import 'dotenv/config';
import express from 'express';
import path from 'path';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';
import { Team, Announcement, TrackType, AdminUser } from './src/types';
import {
  initDatabase,
  getAllTeams,
  findTeamById,
  saveNewTeam,
  updateTeam,
  deleteTeamById,
  getAuthorizedAdminsDB,
  addAdminDB,
  removeAdminDB,
  getAnnouncementsDB,
  addAnnouncementDB,
  getSubmissionStatusDB,
  setSubmissionStatusDB,
  isTransactionRefUsed,
} from './server/db';
import { uploadFileToImagekit } from './server/imagekit';
import { getSubmissionDeadline, isDeadlinePassed } from './src/lib/deadline';
import { validateFileSignature } from './src/lib/fileValidation';


// Configure Multer for file uploads (10MB size limit)
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

// OTP Store for Admin Login: email -> { otp: string, expiresAt: number }
const adminOtps = new Map<string, { otp: string; expiresAt: number }>();

// Global unhandled rejection handler to avoid crashes and ensure JSON errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]', reason);
});

async function startServer() {
  // Initialize DB tables if Neon DB URL is present
  await initDatabase();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // JSON Body parsing (up to 25mb for base64/large payloads)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static serving for local uploads directory fallback
  const distUploads = path.join(process.cwd(), 'dist', 'uploads');
  app.use('/uploads', express.static(distUploads));

  // ==========================================
  // MEDIA & FILE UPLOAD ROUTE (CLOUDINARY)
  // ==========================================
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        // If uploaded as base64 in body
        if (req.body.fileData) {
          const { fileData, fileName = 'upload.png', mimeType = 'image/png' } = req.body;
          const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          let buffer: Buffer;
          if (matches && matches.length === 3) {
            buffer = Buffer.from(matches[2], 'base64');
          } else {
            buffer = Buffer.from(fileData, 'base64');
          }

          if (!validateFileSignature(buffer, mimeType, fileName)) {
            return res.status(400).json({ success: false, message: 'Invalid file signature or type mismatch.' });
          }

          const result = await uploadFileToImagekit(buffer, fileName, mimeType);
          return res.json({ success: true, url: result.url, publicId: result.publicId });
        }
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      if (!validateFileSignature(req.file.buffer, req.file.mimetype, req.file.originalname)) {
        return res.status(400).json({ success: false, message: 'Invalid file signature or type mismatch.' });
      }

      const result = await uploadFileToImagekit(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (err: any) {
      console.error('[API /upload error]:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'File upload failed. Ensure file is within 10MB limit.',
      });
    }
  });

  // ==========================================
  // TEAMS & REGISTRATION API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get all teams
  app.get('/api/teams', async (req, res) => {
    const teams = await getAllTeams();
    res.json({ success: true, teams });
  });

  // Get single team by ID or Email
  app.get('/api/teams/:id', async (req, res) => {
    const team = await findTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }
    res.json({ success: true, team });
  });

  // Team authentication / Lookup with Team ID & Access Code / Leader Email
  app.post('/api/auth/team-login', async (req, res) => {
    const { identifier, accessCode } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide Team ID or Leader Email.' });
    }

    const team = await findTeamById(identifier);

    if (!team) {
      return res.status(404).json({ success: false, message: 'No registered team found with this ID or Email.' });
    }

    if (accessCode && String(team.accessCode) !== String(accessCode).trim()) {
      return res.status(401).json({ success: false, message: 'Invalid Team Access Code.' });
    }

    res.json({ success: true, team });
  });

  // Register New Team (Initial Status: Pending / Locked until Admin verification)
  app.post('/api/teams/register', async (req, res) => {
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

      const leaderEmailClean = leader.email.trim().toLowerCase();

      // Check if team already registered with this leader email
      const existingTeam = await findTeamById(leaderEmailClean);
      if (existingTeam) {
        return res.status(200).json({
          success: true,
          message: 'Team with this leader email is already registered!',
          team: existingTeam,
        });
      }

      // Check if transactionRef is already used
      if (transactionRef && transactionRef.trim() !== '') {
        const isUsed = await isTransactionRefUsed(transactionRef);
        if (isUsed) {
          return res.status(400).json({
            success: false,
            message: 'This UTR/transaction reference has already been used by another team. Please provide a valid, unique UTR.',
          });
        }
      }

      // Generate unique ID & 4-digit PIN access code
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
          email: leaderEmailClean,
          phone: leader.phone.trim(),
          college: leader.college || 'VIT Bhopal University',
          role: leader.role || 'Team Lead',
        },
        member2: member2?.name?.trim()
          ? {
              name: member2.name.trim(),
              email: member2.email?.trim().toLowerCase() || '',
              phone: member2.phone?.trim() || '',
              college: member2.college || leader.college || 'VIT Bhopal University',
              role: member2.role || 'Member',
            }
          : undefined,
        member3: member3?.name?.trim()
          ? {
              name: member3.name.trim(),
              email: member3.email?.trim().toLowerCase() || '',
              phone: member3.phone?.trim() || '',
              college: member3.college || leader.college || 'VIT Bhopal University',
              role: member3.role || 'Member',
            }
          : undefined,
        member4: member4?.name?.trim()
          ? {
              name: member4.name.trim(),
              email: member4.email?.trim().toLowerCase() || '',
              phone: member4.phone?.trim() || '',
              college: member4.college || leader.college || 'VIT Bhopal University',
              role: member4.role || 'Member',
            }
          : undefined,
        paymentStatus: 'pending', // Locked until Admin verifies
        paymentProofUrl: paymentProofUrl || '',
        transactionRef: transactionRef ? transactionRef.trim() : `TXN-${Date.now().toString().slice(-6)}`,
        registeredAt: new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
        checkedInVenue: false,
        ticketIssued: false, // Locked until Admin verifies
      };

      await saveNewTeam(newTeam);

      res.status(201).json({
        success: true,
        message: 'Team registered! Access is currently pending admin verification.',
        team: newTeam,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to register team.' });
    }
  });

  // Update Project Submission (Gated: Team must be verified by Admin & within Deadline)
  app.put('/api/teams/:id/project', async (req, res) => {
    // STRICT LOCK: Reject late submissions after official deadline
    const deadline = getSubmissionDeadline();
    if (isDeadlinePassed(deadline)) {
      return res.status(403).json({
        success: false,
        message: 'Submission deadline has passed. Submissions are permanently closed.',
      });
    }

    const isSubmissionsOpen = await getSubmissionStatusDB();
    if (!isSubmissionsOpen) {
      return res.status(403).json({
        success: false,
        message: 'Project submissions are currently closed by the Admin! Submissions will open when enabled by the organizers.',
      });
    }


    const team = await findTeamById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    // STRICT LOCK: Block project submission if team is not verified by admin
    if (team.paymentStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Project submission is locked! Admin verification and approval is required before submitting project details.',
      });
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

    team.project = {
      title: title.trim(),
      tagline: tagline ? tagline.trim() : '',
      problemStatement: problemStatement.trim(),
      solutionDescription: solutionDescription.trim(),
      track: track || team.track,
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
      score: team.project?.score,
    };

    await updateTeam(team);

    res.json({
      success: true,
      message: 'Project details and presentation successfully submitted!',
      team,
    });
  });

  // Admin: Update Team Status & Unlock Controls (verify payment, reject, check-in, issue ticket)
  app.patch('/api/teams/:id/status', async (req, res) => {
    const team = await findTeamById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const { paymentStatus, checkedInVenue, ticketIssued, notes } = req.body;

    if (paymentStatus) {
      team.paymentStatus = paymentStatus;
      if (paymentStatus === 'verified') {
        team.ticketIssued = true; // Unlock Team Pass / Ticket
      }
    }

    if (typeof checkedInVenue === 'boolean') {
      team.checkedInVenue = checkedInVenue;
    }

    if (typeof ticketIssued === 'boolean') {
      team.ticketIssued = ticketIssued;
    }

    if (notes !== undefined) {
      team.notes = notes;
    }

    await updateTeam(team);

    res.json({
      success: true,
      message: `Team status updated successfully. ${team.paymentStatus === 'verified' ? 'Team pass unlocked!' : ''}`,
      team,
    });
  });

  // Admin: Grade/Score Project
  app.post('/api/teams/:id/score', async (req, res) => {
    const team = await findTeamById(req.params.id);

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

    await updateTeam(team);

    res.json({ success: true, message: 'Project score saved.', team });
  });

  // Admin: Delete Team
  app.delete('/api/teams/:id', async (req, res) => {
    await deleteTeamById(req.params.id);
    res.json({ success: true, message: 'Team removed successfully.' });
  });

  // ==========================================
  // ADMIN AUTHENTICATION & WHITELIST
  // ==========================================

  app.post('/api/admin/auth/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid official email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admins = await getAuthorizedAdminsDB();
    const admin = admins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: '${cleanEmail}' is not listed in the Origin Hackathon Authorized Admin Directory. Please request access from the lead convener.`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    adminOtps.set(cleanEmail, { otp, expiresAt });

    console.log(`[ADMIN AUTH] Verification code for ${cleanEmail}: ${otp}`);

    res.json({
      success: true,
      message: `Verification code dispatched to ${admin.email}.`,
      admin: {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        department: admin.department,
      },
      demoOtp: otp,
    });
  });

  app.post('/api/admin/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admins = await getAuthorizedAdminsDB();
    const admin = admins.find((a) => a.email.toLowerCase() === cleanEmail);

    if (!admin) {
      return res.status(403).json({ success: false, message: 'Unauthorized email address.' });
    }

    const storedOtp = adminOtps.get(cleanEmail);

    if (otp) {
      const cleanOtp = String(otp).trim();
      if (!storedOtp || storedOtp.otp !== cleanOtp || Date.now() > storedOtp.expiresAt) {
        return res.status(401).json({ success: false, message: 'Invalid or expired verification passcode.' });
      }
    }

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

  app.get('/api/admin/whitelist', async (req, res) => {
    const authorizedAdmins = await getAuthorizedAdminsDB();
    res.json({ success: true, authorizedAdmins });
  });

  app.post('/api/admin/whitelist', async (req, res) => {
    const { email, name, role = 'Lead Organizer', department = 'Hackathon Operations' } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Email and Name are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const newAdmin: AdminUser = {
      email: cleanEmail,
      name: name.trim(),
      role: role as any,
      department: department.trim(),
      addedAt: new Date().toISOString().split('T')[0],
    };

    const authorizedAdmins = await addAdminDB(newAdmin);
    res.status(201).json({ success: true, message: 'New administrator added.', admin: newAdmin, authorizedAdmins });
  });

  app.delete('/api/admin/whitelist/:email', async (req, res) => {
    const emailToRemove = decodeURIComponent(req.params.email).trim().toLowerCase();
    const authorizedAdmins = await removeAdminDB(emailToRemove);
    res.json({ success: true, message: 'Administrator removed.', authorizedAdmins });
  });

  // SUBMISSIONS TOGGLE API
  app.get('/api/admin/submissions-status', async (req, res) => {
    const submissionsOpen = await getSubmissionStatusDB();
    const deadline = getSubmissionDeadline();
    const deadlinePassed = isDeadlinePassed(deadline);
    res.json({
      success: true,
      submissionsOpen,
      deadline,
      isDeadlinePassed: deadlinePassed,
      serverTime: new Date().toISOString(),
    });
  });


  app.post('/api/admin/submissions-toggle', async (req, res) => {
    const { submissionsOpen } = req.body;
    if (typeof submissionsOpen !== 'boolean') {
      return res.status(400).json({ success: false, message: 'submissionsOpen boolean property required.' });
    }
    const updated = await setSubmissionStatusDB(submissionsOpen);
    res.json({
      success: true,
      submissionsOpen: updated,
      message: `Project submissions are now ${updated ? 'OPEN' : 'CLOSED'}.`,
    });
  });

  // Announcements API
  app.get('/api/announcements', async (req, res) => {
    const announcements = await getAnnouncementsDB();
    res.json({ success: true, announcements });
  });

  app.post('/api/announcements', async (req, res) => {
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

    await addAnnouncementDB(newAnn);
    res.status(201).json({ success: true, announcement: newAnn });
  });

  // Hackathon Overall Statistics
  app.get('/api/stats', async (req, res) => {
    const teams = await getAllTeams();
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
      let membersCount = 1;
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
  app.get('/api/export-csv', async (req, res) => {
    const teams = await getAllTeams();
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
      'Project Presentation (PPT/PDF)',
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
      escapeCsv(t.project?.presentationUrl || ''),
      escapeCsv(t.project?.score?.total || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="origin-hackathon-teams-${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // Export Excel (.xlsx)
  app.get('/api/export-excel', async (req, res) => {
    const teams = await getAllTeams();
    const data = teams.map((t) => ({
      'Team ID': t.id,
      'Team Name': t.teamName,
      'Track': t.track,
      'Access Code': t.accessCode,
      'Payment Status': t.paymentStatus,
      'Transaction Ref': t.transactionRef,
      'Registered At': t.registeredAt,
      'Checked In Venue': t.checkedInVenue ? 'Yes' : 'No',
      'Leader Name': t.leader.name,
      'Leader Email': t.leader.email,
      'Leader Phone': t.leader.phone,
      'Leader College': t.leader.college || '',
      'Member 2': t.member2?.name || '',
      'Member 2 Email': t.member2?.email || '',
      'Member 3': t.member3?.name || '',
      'Member 3 Email': t.member3?.email || '',
      'Member 4': t.member4?.name || '',
      'Member 4 Email': t.member4?.email || '',
      'Project Title': t.project?.title || 'Not Submitted',
      'Project GitHub': t.project?.githubUrl || '',
      'PPT/PDF Document Link': t.project?.presentationUrl || '',
      'Score': t.project?.score?.total || 'Unscored',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="origin-hackathon-teams-${Date.now()}.xlsx"`);
    res.send(buffer);
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

  // Global error handler to always return JSON
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Express Error]', err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  const server = app.listen(PORT, () => {
    console.log(`ORIGIN Hackathon Portal running at http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Warning] Port ${PORT} is busy. Trying http://localhost:${Number(PORT) + 1}...`);
      const nextPort = Number(PORT) + 1;
      app.listen(nextPort, () => {
        console.log(`ORIGIN Hackathon Portal running at http://localhost:${nextPort}`);
      });
    } else {
      console.error('[Server Error]', err);
    }
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
