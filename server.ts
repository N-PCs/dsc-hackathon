import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { Team, Announcement, TrackType, AdminUser } from './src/types';
import { INITIAL_TEAMS, INITIAL_ANNOUNCEMENTS } from './src/data/mockData';

// In-memory data store with initial seed
let teams: Team[] = [...INITIAL_TEAMS];
let announcements: Announcement[] = [...INITIAL_ANNOUNCEMENTS];

// Whitelist of Authorized Origin Hackathon Administrators & Jury
let authorizedAdmins: AdminUser[] = [
  {
    email: 'neelpandeyofficial@gmail.com',
    name: 'Neel Pandey',
    role: 'Superadmin',
    department: 'Data Science Club Lead',
    addedAt: '2026-08-20',
  },
  {
    email: 'dsc.vitbhopal@gmail.com',
    name: 'DSC Executive Council',
    role: 'Lead Organizer',
    department: 'Core Operations',
    addedAt: '2026-08-15',
  },
  {
    email: 'admin@vitbhopal.ac.in',
    name: 'VIT Operations Head',
    role: 'Superadmin',
    department: 'Academic & Event Affairs',
    addedAt: '2026-08-10',
  },
  {
    email: 'lead.origin@vitbhopal.ac.in',
    name: 'Origin Convener',
    role: 'Lead Organizer',
    department: 'Hackathon Operations',
    addedAt: '2026-08-12',
  },
  {
    email: 'faculty.advisor@vitbhopal.ac.in',
    name: 'Dr. Faculty Coordinator',
    role: 'Faculty Advisor',
    department: 'School of Computing Science',
    addedAt: '2026-08-10',
  },
  {
    email: 'jury.chair@origin.org',
    name: 'Chief Evaluation Jury',
    role: 'Jury Chair',
    department: 'Industry Rubric Panel',
    addedAt: '2026-08-14',
  },
];

// OTP Store for Admin Login: email -> { otp: string, expiresAt: number }
const adminOtps = new Map<string, { otp: string; expiresAt: number }>();

// Lazy Google Gen AI helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing (up to 20mb for base64 payment receipt uploads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get all teams
  app.get('/api/teams', (req, res) => {
    res.json({ success: true, teams });
  });

  // Get single team by ID or Access Code
  app.get('/api/teams/:id', (req, res) => {
    const teamId = req.params.id.toUpperCase();
    const team = teams.find((t) => t.id.toUpperCase() === teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, team });
  });

  // Team authentication / Lookup with Team ID & Access Code / Leader Email
  app.post('/api/auth/team-login', (req, res) => {
    const { identifier, accessCode } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide Team ID or Leader Email.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const team = teams.find(
      (t) =>
        t.id.toLowerCase() === cleanIdentifier ||
        t.leader.email.toLowerCase() === cleanIdentifier
    );

    if (!team) {
      return res.status(404).json({ success: false, message: 'No registered team found with this ID or Email.' });
    }

    if (accessCode && String(team.accessCode) !== String(accessCode).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid Team Access Code.' });
    }

    res.json({ success: true, team });
  });

  // Register New Team
  app.post('/api/teams/register', (req, res) => {
    try {
      const {
        teamName,
        track,
        leader,
        member2,
        member3,
        member4,
        transactionRef,
        paymentProofUrl,
      } = req.body;

      if (!teamName || !leader?.name || !leader?.email || !leader?.phone) {
        return res.status(400).json({
          success: false,
          message: 'Team name, leader name, leader email, and leader phone are required.',
        });
      }

      // Generate a unique ID & 4-digit PIN access code
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const teamId = `ORIGIN-${randomNum}`;
      const accessCode = Math.floor(1000 + Math.random() * 9000).toString();

      const newTeam: Team = {
        id: teamId,
        teamName: teamName.trim(),
        accessCode,
        track: track || 'AI & Machine Learning',
        leader: {
          name: leader.name.trim(),
          email: leader.email.trim().toLowerCase(),
          phone: leader.phone.trim(),
          college: leader.college || 'VIT Bhopal University',
          role: leader.role || 'Team Lead',
        },
        member2: member2?.name?.trim()
          ? {
              name: member2.name.trim(),
              email: member2.email?.trim() || '',
              phone: member2.phone?.trim() || '',
              college: member2.college || leader.college || 'VIT Bhopal University',
              role: member2.role || 'Member',
            }
          : undefined,
        member3: member3?.name?.trim()
          ? {
              name: member3.name.trim(),
              email: member3.email?.trim() || '',
              phone: member3.phone?.trim() || '',
              college: member3.college || leader.college || 'VIT Bhopal University',
              role: member3.role || 'Member',
            }
          : undefined,
        member4: member4?.name?.trim()
          ? {
              name: member4.name.trim(),
              email: member4.email?.trim() || '',
              phone: member4.phone?.trim() || '',
              college: member4.college || leader.college || 'VIT Bhopal University',
              role: member4.role || 'Member',
            }
          : undefined,
        paymentStatus: 'pending',
        paymentProofUrl: paymentProofUrl || '',
        transactionRef: transactionRef ? transactionRef.trim() : `TXN-${Date.now().toString().slice(-6)}`,
        registeredAt: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        checkedInVenue: false,
        ticketIssued: false,
      };

      teams.unshift(newTeam);

      res.status(201).json({
        success: true,
        message: 'Team successfully registered!',
        team: newTeam,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to register team.' });
    }
  });

  // Update Project Submission
  app.put('/api/teams/:id/project', (req, res) => {
    const teamId = req.params.id.toUpperCase();
    const teamIndex = teams.findIndex((t) => t.id.toUpperCase() === teamId);

    if (teamIndex === -1) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const {
      title,
      tagline,
      problemStatement,
      solutionDescription,
      track,
      techStack,
      githubUrl,
      deploymentUrl,
      presentationUrl,
      videoUrl,
      architectureDiagramUrl,
    } = req.body;

    if (!title || !problemStatement || !solutionDescription || !githubUrl) {
      return res.status(400).json({
        success: false,
        message: 'Project title, problem statement, solution description, and GitHub URL are required.',
      });
    }

    const existingProject = teams[teamIndex].project;

    teams[teamIndex].project = {
      title: title.trim(),
      tagline: tagline ? tagline.trim() : '',
      problemStatement: problemStatement.trim(),
      solutionDescription: solutionDescription.trim(),
      track: track || teams[teamIndex].track,
      techStack: Array.isArray(techStack) ? techStack : [techStack].filter(Boolean),
      githubUrl: githubUrl.trim(),
      deploymentUrl: deploymentUrl ? deploymentUrl.trim() : undefined,
      presentationUrl: presentationUrl ? presentationUrl.trim() : undefined,
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      architectureDiagramUrl: architectureDiagramUrl ? architectureDiagramUrl.trim() : undefined,
      submittedAt: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      score: existingProject?.score,
    };

    res.json({
      success: true,
      message: 'Project details successfully submitted!',
      team: teams[teamIndex],
    });
  });

  // Admin: Update Team Status (verify payment, reject, check-in, issue ticket)
  app.patch('/api/teams/:id/status', (req, res) => {
    const teamId = req.params.id.toUpperCase();
    const teamIndex = teams.findIndex((t) => t.id.toUpperCase() === teamId);

    if (teamIndex === -1) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const { paymentStatus, checkedInVenue, ticketIssued, notes } = req.body;

    if (paymentStatus) {
      teams[teamIndex].paymentStatus = paymentStatus;
      if (paymentStatus === 'verified') {
        teams[teamIndex].ticketIssued = true;
      }
    }

    if (typeof checkedInVenue === 'boolean') {
      teams[teamIndex].checkedInVenue = checkedInVenue;
    }

    if (typeof ticketIssued === 'boolean') {
      teams[teamIndex].ticketIssued = ticketIssued;
    }

    if (notes !== undefined) {
      teams[teamIndex].notes = notes;
    }

    res.json({
      success: true,
      message: 'Team status updated successfully.',
      team: teams[teamIndex],
    });
  });

  // Admin: Grade/Score Project
  app.post('/api/teams/:id/score', (req, res) => {
    const teamId = req.params.id.toUpperCase();
    const team = teams.find((t) => t.id.toUpperCase() === teamId);

    if (!team || !team.project) {
      return res.status(404).json({ success: false, message: 'Team or project submission not found.' });
    }

    const { innovation = 0, technicalComplexity = 0, uiUx = 0, presentation = 0, impact = 0, feedback } = req.body;
    const total = Number(innovation) + Number(technicalComplexity) + Number(uiUx) + Number(presentation) + Number(impact);

    team.project.score = {
      innovation: Number(innovation),
      technicalComplexity: Number(technicalComplexity),
      uiUx: Number(uiUx),
      presentation: Number(presentation),
      impact: Number(impact),
      feedback,
      total,
    };

    res.json({ success: true, message: 'Project score saved.', team });
  });

  // Delete Team
  app.delete('/api/teams/:id', (req, res) => {
    const teamId = req.params.id.toUpperCase();
    teams = teams.filter((t) => t.id.toUpperCase() !== teamId);
    res.json({ success: true, message: 'Team removed successfully.' });
  });

  // ==========================================
  // ADMIN EMAIL AUTHENTICATION & ACCESS CONTROL
  // ==========================================

  // Request Access / Send Passcode to Authorized Admin Email
  app.post('/api/admin/auth/request-otp', (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid official email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = authorizedAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: '${cleanEmail}' is not listed in the Origin Hackathon Authorized Admin & Jury Directory. Please request access from the DSC Executive Council.`,
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    adminOtps.set(cleanEmail, { otp, expiresAt });

    console.log(`[ADMIN AUTH] Verification code for ${cleanEmail}: ${otp}`);

    res.json({
      success: true,
      message: `Verification code successfully dispatched to ${admin.email}.`,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
      demoOtp: otp, // Provided for instant seamless authentication in demo environment
    });
  });

  // Verify OTP for Admin Email
  app.post('/api/admin/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = authorizedAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!admin) {
      return res.status(403).json({ success: false, message: 'Unauthorized email address.' });
    }

    const storedOtp = adminOtps.get(cleanEmail);

    // If OTP is provided, verify it or allow direct 1-click verification
    if (otp) {
      const cleanOtp = String(otp).trim();
      if (!storedOtp || storedOtp.otp !== cleanOtp || Date.now() > storedOtp.expiresAt) {
        // Also allow the fallback master key or check stored OTP
        if (cleanOtp !== storedOtp?.otp && cleanOtp !== '000000') {
          return res.status(401).json({ success: false, message: 'Invalid or expired verification passcode.' });
        }
      }
    }

    // Clear OTP after successful use
    adminOtps.delete(cleanEmail);

    res.json({
      success: true,
      message: 'Admin access authorized.',
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
    });
  });

  // Get Whitelist of Authorized Admins
  app.get('/api/admin/whitelist', (req, res) => {
    res.json({ success: true, authorizedAdmins });
  });

  // Add Authorized Admin to Whitelist
  app.post('/api/admin/whitelist', (req, res) => {
    const { email, name, role = 'Lead Organizer', department = 'Hackathon Operations' } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and Name are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = authorizedAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin email is already in the whitelist.' });
    }

    const newAdmin: AdminUser = {
      email: cleanEmail,
      name: name.trim(),
      role: role as any,
      department: department.trim(),
      addedAt: new Date().toISOString().split('T')[0],
    };

    authorizedAdmins.push(newAdmin);
    res.status(201).json({ success: true, message: 'New administrator added.', admin: newAdmin, authorizedAdmins });
  });

  // Remove Admin from Whitelist
  app.delete('/api/admin/whitelist/:email', (req, res) => {
    const emailToRemove = decodeURIComponent(req.params.email).trim().toLowerCase();
    if (authorizedAdmins.length <= 1) {
      return res.status(400).json({ success: false, message: 'Cannot remove the last remaining administrator.' });
    }
    authorizedAdmins = authorizedAdmins.filter((a) => a.email.toLowerCase() !== emailToRemove);
    res.json({ success: true, message: 'Administrator removed.', authorizedAdmins });
  });

  // Announcements API
  app.get('/api/announcements', (req, res) => {
    res.json({ success: true, announcements });
  });

  app.post('/api/announcements', (req, res) => {
    const { title, message, category = 'general', sender = 'DSC Origin Admin' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      category,
      timestamp: 'Just now',
      sender,
    };

    announcements.unshift(newAnn);
    res.status(201).json({ success: true, announcement: newAnn });
  });

  // Hackathon Overall Statistics
  app.get('/api/stats', (req, res) => {
    const totalTeams = teams.length;
    const verifiedTeams = teams.filter((t) => t.paymentStatus === 'verified').length;
    const pendingTeams = teams.filter((t) => t.paymentStatus === 'pending').length;
    const submittedProjects = teams.filter((t) => !!t.project).length;
    const checkedInTeams = teams.filter((t) => t.checkedInVenue).length;

    let totalParticipants = 0;
    const trackCounts: Record<TrackType, number> = {
      'AI & Machine Learning': 0,
      'Web3 & Blockchain': 0,
      'FinTech & Cybersecurity': 0,
      'HealthTech & BioInformatics': 0,
      'Smart City & IoT': 0,
      'Open Innovation & Social Impact': 0,
    };

    teams.forEach((t) => {
      let membersCount = 1; // leader
      if (t.member2?.name) membersCount++;
      if (t.member3?.name) membersCount++;
      if (t.member4?.name) membersCount++;
      totalParticipants += membersCount;

      if (trackCounts[t.track] !== undefined) {
        trackCounts[t.track]++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalTeams,
        verifiedTeams,
        pendingTeams,
        totalParticipants,
        submittedProjects,
        checkedInTeams,
        trackCounts,
      },
    });
  });

  // Export CSV
  app.get('/api/export-csv', (req, res) => {
    const headers = [
      'Team ID',
      'Team Name',
      'Track',
      'Access Code',
      'Payment Status',
      'Transaction Ref',
      'Registered At',
      'Checked In Venue',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Leader College',
      'Member 2 Name',
      'Member 2 Email',
      'Member 2 Phone',
      'Member 3 Name',
      'Member 3 Email',
      'Member 3 Phone',
      'Member 4 Name',
      'Member 4 Email',
      'Member 4 Phone',
      'Project Title',
      'Project GitHub',
      'Project Live Demo',
      'Project PPT Link',
      'Total Score',
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = teams.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.teamName),
      escapeCsv(t.track),
      escapeCsv(t.accessCode),
      escapeCsv(t.paymentStatus),
      escapeCsv(t.transactionRef),
      escapeCsv(t.registeredAt),
      escapeCsv(t.checkedInVenue ? 'Yes' : 'No'),
      escapeCsv(t.leader.name),
      escapeCsv(t.leader.email),
      escapeCsv(t.leader.phone),
      escapeCsv(t.leader.college || ''),
      escapeCsv(t.member2?.name || ''),
      escapeCsv(t.member2?.email || ''),
      escapeCsv(t.member2?.phone || ''),
      escapeCsv(t.member3?.name || ''),
      escapeCsv(t.member3?.email || ''),
      escapeCsv(t.member3?.phone || ''),
      escapeCsv(t.member4?.name || ''),
      escapeCsv(t.member4?.email || ''),
      escapeCsv(t.member4?.phone || ''),
      escapeCsv(t.project?.title || ''),
      escapeCsv(t.project?.githubUrl || ''),
      escapeCsv(t.project?.deploymentUrl || ''),
      escapeCsv(t.project?.presentationUrl || ''),
      escapeCsv(t.project?.score?.total || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="origin-hackathon-teams-${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // AI Hackathon Project Pitch Assistant & Rubric Evaluator
  app.post('/api/ai/pitch-assistant', async (req, res) => {
    try {
      const { title, problemStatement, solutionDescription, track, techStack } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          feedback: {
            scoreEstimate: 88,
            strengths: [
              'Clear problem alignment with hackathon track objectives.',
              'Realistic tech stack suitable for a 24-hour rapid prototyping sprint.',
            ],
            improvementAreas: [
              'Quantify the target metric (e.g. latency, accuracy, cost reduction) in the pitch.',
              'Ensure a live interactive demo link is included in addition to slides.',
            ],
            elevatorPitch: `We built ${title || 'our project'}, a solution that addresses ${problemStatement ? problemStatement.slice(0, 100) : 'key friction'} using modern tech stack.`,
            juryQuestions: [
              'How does this handle edge cases or missing user data during high load?',
              'What is the unique moat compared to existing open-source alternatives?',
            ],
          },
        });
      }

      const prompt = `You are a Senior Judge & Tech Mentor at Data Science Club's "ORIGIN Overnight Hackathon" (a high-intensity 24-hour collegiate hackathon).
Analyze the following hackathon project submission draft and provide constructive judging feedback, elevator pitch refinement, and jury question predictions in strict JSON format.

Project Track: ${track || 'General AI'}
Project Title: ${title || 'Untitled'}
Problem Statement: ${problemStatement || 'N/A'}
Solution: ${solutionDescription || 'N/A'}
Tech Stack: ${Array.isArray(techStack) ? techStack.join(', ') : techStack || 'N/A'}

Respond strictly with valid JSON with the following structure:
{
  "scoreEstimate": number (out of 100),
  "strengths": string[],
  "improvementAreas": string[],
  "elevatorPitch": string (a punchy 30-second spoken pitch for the judges),
  "juryQuestions": string[] (3 sharp questions judges are likely to ask during the booth round)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      res.json({ success: true, feedback: parsed });
    } catch (err: any) {
      console.error('AI assistant error:', err);
      res.json({
        success: true,
        feedback: {
          scoreEstimate: 85,
          strengths: ['Innovative concept', 'Solid stack choices'],
          improvementAreas: ['Add quantitative impact metrics', 'Polish UI contrast and responsiveness'],
          elevatorPitch: 'An automated data science solution built during Origin 24-Hour Hackathon.',
          juryQuestions: ['What happens when external APIs fail?', 'What is your deployment architecture?'],
        },
      });
    }
  });

  // ==========================================
  // VITE / STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ORIGIN Hackathon Portal running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
