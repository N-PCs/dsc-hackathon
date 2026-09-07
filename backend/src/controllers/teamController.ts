import { Request, Response } from 'express';
import * as teamService from '../services/teamService.js';
import * as statsService from '../services/statsService.js';
import { getSubmissionDeadline, isDeadlinePassed } from '../utils/deadline.js';
import { Team } from '../utils/types.js';
import { logger } from '../utils/logger.js';
import {
  signTeamToken,
  verifyToken,
  sanitizeTeamPublic,
  sanitizeTeamForJury,
  timingSafeEqual,
} from '../utils/security.js';

export const listTeams = async (req: Request, res: Response) => {
  try {
    const isJury = !!(req as any).juryUser && !(req as any).adminUser;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    const track = (req.query.track as string) || 'all';
    const hasProject = req.query.hasProject === 'true' ? true : req.query.hasProject === 'false' ? false : undefined;
    const scoredParam = req.query.scored;
    const scored: 'all' | 'true' | 'false' = scoredParam === 'true' || scoredParam === 'false' ? scoredParam : 'all';

    // If no pagination params, return all teams (sanitized if jury)
    if (!req.query.page && !req.query.limit) {
      const teams = await teamService.getAllTeams();
      const resultTeams = isJury ? teams.map((t) => sanitizeTeamForJury(t)) : teams;
      return res.json({ success: true, teams: resultTeams });
    }

    const result = await teamService.getTeamsPaginated({
      page,
      limit,
      search,
      status,
      track,
      hasProject,
      scored,
    });

    const resultTeams = isJury ? result.teams.map((t) => sanitizeTeamForJury(t)) : result.teams;

    res.json({
      success: true,
      teams: resultTeams,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        evaluatedCount: result.evaluatedCount || 0,
        pendingCount: result.pendingCount || 0,
      },
    });
  } catch (err: any) {
    logger.error({ err }, 'listTeams error');
    res.status(500).json({ success: false, message: 'Failed to retrieve team data' });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  try {
    const team = await teamService.findTeamById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

    // Check if requester has authenticated team or admin credentials
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader?.trim();
    let isPrivileged = false;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        if (payload.role === 'admin') {
          isPrivileged = true;
        } else if (payload.role === 'team' && payload.teamId?.toUpperCase() === team.id.toUpperCase()) {
          isPrivileged = true;
        }
      }
    }

    const accessCode = (req.headers['x-access-code'] as string || (req.query.accessCode as string) || '').trim();
    if (accessCode && timingSafeEqual(team.accessCode, accessCode)) {
      isPrivileged = true;
    }

    if (isPrivileged) {
      return res.json({ success: true, team });
    }

    // Return sanitized public profile for event ticket badge scanning
    res.json({ success: true, team: sanitizeTeamPublic(team) });
  } catch (err: any) {
    logger.error({ err }, 'getTeam error');
    res.status(500).json({ success: false, message: 'Failed to retrieve team' });
  }
};

export const teamLogin = async (req: Request, res: Response) => {
  try {
    const { identifier, accessCode } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Team ID or Leader Email required' });
    }
    const team = await teamService.findTeamByIdentifier(identifier);
    if (!team) {
      return res.status(404).json({ success: false, message: 'No registered team found' });
    }

    // If access code was supplied, verify it
    if (accessCode && !timingSafeEqual(team.accessCode, String(accessCode).trim())) {
      return res.status(401).json({ success: false, message: 'Invalid access code' });
    }

    const token = signTeamToken(team.id, team.leader.email);
    res.json({ success: true, team, token });
  } catch (err: any) {
    logger.error({ err }, 'teamLogin error');
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

export const registerTeam = async (req: Request, res: Response) => {
  try {
    const isOpen = await teamService.getRegistrationStatus();
    if (!isOpen) {
      return res.status(403).json({ success: false, message: 'Registrations closed by organizers.' });
    }

    const {
      teamName,
      track,
      leader,
      member2,
      member3,
      member4,
      member5,
      transactionRef,
      paymentProofUrl,
    } = req.body;

    if (!teamName || !leader?.name || !leader?.email || !leader?.phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const leaderEmailClean = leader.email.trim().toLowerCase();
    const existing = await teamService.findTeamByIdentifier(leaderEmailClean);
    if (existing) {
      const token = signTeamToken(existing.id, existing.leader.email);
      return res.status(200).json({ success: true, message: 'Team already registered', team: existing, token });
    }

    if (transactionRef && transactionRef.trim() !== '') {
      const used = await teamService.isTransactionRefUsed(transactionRef);
      if (used) {
        return res.status(400).json({ success: false, message: 'This UTR has already been used.' });
      }
    }

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
        registrationNumber: leader.registrationNumber?.trim() || '',
        residentialStatus: leader.residentialStatus || 'Hosteller',
        messName: leader.messName || 'Anchor (Boys)',
      },
      member2: member2?.name?.trim() ? { ...member2, email: member2.email?.trim().toLowerCase() } : undefined,
      member3: member3?.name?.trim() ? { ...member3, email: member3.email?.trim().toLowerCase() } : undefined,
      member4: member4?.name?.trim() ? { ...member4, email: member4.email?.trim().toLowerCase() } : undefined,
      member5: member5?.name?.trim() ? { ...member5, email: member5.email?.trim().toLowerCase() } : undefined,
      paymentStatus: 'pending',
      paymentProofUrl: paymentProofUrl || '',
      transactionRef: transactionRef ? transactionRef.trim() : `TXN-${Date.now().toString().slice(-6)}`,
      amountPaid: typeof req.body.amountPaid === 'number' && req.body.amountPaid > 0
        ? req.body.amountPaid
        : (leader.residentialStatus === 'Day Scholar' ? 219 : 100) +
          (member2?.name ? (member2.residentialStatus === 'Day Scholar' ? 219 : 100) : 0) +
          (member3?.name ? (member3.residentialStatus === 'Day Scholar' ? 219 : 100) : 0) +
          (member4?.name ? (member4.residentialStatus === 'Day Scholar' ? 219 : 100) : 0) +
          (member5?.name ? (member5.residentialStatus === 'Day Scholar' ? 219 : 100) : 0),
      registeredAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      checkedInVenue: false,
      ticketIssued: false,
    };

    await teamService.saveTeam(newTeam);
    const token = signTeamToken(newTeam.id, newTeam.leader.email);
    logger.info({ teamId }, 'Team registered');
    res.status(201).json({
      success: true,
      message: 'Team registered! Awaiting admin verification.',
      team: newTeam,
      token,
    });
  } catch (err: any) {
    logger.error({ err }, 'Registration error');
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const submitProject = async (req: Request, res: Response) => {
  try {
    const deadline = getSubmissionDeadline();
    if (isDeadlinePassed(deadline)) {
      return res.status(403).json({ success: false, message: 'Submission deadline passed.' });
    }

    const isOpen = await teamService.getSubmissionStatus();
    if (!isOpen) {
      return res.status(403).json({ success: false, message: 'Project submissions closed by admin.' });
    }

    const team = await teamService.findTeamById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

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
      presentationPdfUrl,
      presentationPptUrl,
      videoUrl,
    } = req.body;

    if (!title || !problemStatement || !solutionDescription || !githubUrl) {
      return res.status(400).json({ success: false, message: 'Missing required project fields' });
    }

    if (track) {
      team.track = track;
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
      presentationPdfUrl: presentationPdfUrl ? presentationPdfUrl.trim() : undefined,
      presentationPptUrl: presentationPptUrl ? presentationPptUrl.trim() : undefined,
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      score: team.project?.score,
    };

    await teamService.updateTeam(team);
    res.json({ success: true, message: 'Project submitted', team });
  } catch (err: any) {
    logger.error({ err }, 'submitProject error');
    res.status(500).json({ success: false, message: 'Failed to submit project' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    await teamService.deleteTeam(req.params.id);
    res.json({ success: true, message: 'Team removed' });
  } catch (err: any) {
    logger.error({ err }, 'deleteTeam error');
    res.status(500).json({ success: false, message: 'Failed to delete team' });
  }
};
