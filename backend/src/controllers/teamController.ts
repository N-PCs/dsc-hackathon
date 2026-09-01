import { Request, Response } from 'express';
import * as teamService from '../services/teamService.js';
import * as statsService from '../services/statsService.js';
import { getSubmissionDeadline, isDeadlinePassed } from '../utils/deadline.js';
import { Team } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export const listTeams = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || 'all';
    const track = (req.query.track as string) || 'all';
    const hasProject = req.query.hasProject === 'true' ? true : req.query.hasProject === 'false' ? false : undefined;
    const scoredParam = req.query.scored;
    const scored: 'all' | 'true' | 'false' = scoredParam === 'true' || scoredParam === 'false' ? scoredParam : 'all';

    // If no pagination params, return all teams (backward compatibility)
    if (!req.query.page && !req.query.limit) {
      const teams = await teamService.getAllTeams();
      return res.json({ success: true, teams });
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

    res.json({
      success: true,
      teams: result.teams,
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
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  const team = await teamService.findTeamById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, team });
};

export const teamLogin = async (req: Request, res: Response) => {
  const { identifier } = req.body; // accessCode removed
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Team ID or Leader Email required' });
  }
  const team = await teamService.findTeamByIdentifier(identifier);
  if (!team) {
    return res.status(404).json({ success: false, message: 'No registered team found' });
  }
  // access code check removed – any valid identifier logs the team in
  res.json({ success: true, team });
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
      return res.status(200).json({ success: true, message: 'Team already registered', team: existing });
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
    logger.info({ teamId }, 'Team registered');
    res.status(201).json({ success: true, message: 'Team registered! Awaiting admin verification.', team: newTeam });
  } catch (err: any) {
    logger.error({ err }, 'Registration error');
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitProject = async (req: Request, res: Response) => {
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

  // ✅ FIX: Keep the team's top-level `track` (registration-time field, used by
  // SQL filtering / the jury "track" filter buttons) in sync with whatever track
  // is chosen at project-submission time. Without this, `team.track` stays frozen
  // at whatever was picked (or defaulted) during registration, while the badge
  // shown on cards displays `project.track` — causing the mismatch where a team
  // submits under "Web3 & Blockchain" but still only appears under the
  // "AI & Machine Learning" filter.
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
};

export const deleteTeam = async (req: Request, res: Response) => {
  await teamService.deleteTeam(req.params.id);
  res.json({ success: true, message: 'Team removed' });
};