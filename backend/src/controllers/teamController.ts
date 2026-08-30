import { Request, Response } from 'express';
import * as teamService from '../services/teamService.js';
import * as statsService from '../services/statsService.js';
import { getSubmissionDeadline, isDeadlinePassed } from '../utils/deadline.js';
import { Team } from '../utils/types.js';
import { logger } from '../utils/logger.js';

export const listTeams = async (req: Request, res: Response) => {
  const teams = await teamService.getAllTeams();
  res.json({ success: true, teams });
};

export const getTeam = async (req: Request, res: Response) => {
  const team = await teamService.findTeamById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, team });
};

export const teamLogin = async (req: Request, res: Response) => {
  const { identifier, accessCode } = req.body;
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Team ID or Leader Email required' });
  }
  const team = await teamService.findTeamByIdentifier(identifier);
  if (!team) {
    return res.status(404).json({ success: false, message: 'No registered team found' });
  }
  if (accessCode && String(team.accessCode) !== String(accessCode).trim()) {
    return res.status(401).json({ success: false, message: 'Invalid Access Code' });
  }
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
  if (team.paymentStatus !== 'verified') {
    return res.status(403).json({ success: false, message: 'Team not verified – cannot submit project.' });
  }

  const { title, tagline, problemStatement, solutionDescription, track, techStack, githubUrl, deploymentUrl, presentationUrl, videoUrl } = req.body;
  if (!title || !problemStatement || !solutionDescription || !githubUrl) {
    return res.status(400).json({ success: false, message: 'Missing required project fields' });
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