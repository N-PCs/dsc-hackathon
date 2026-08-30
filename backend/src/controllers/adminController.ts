import { Request, Response } from 'express';
import { clearAllData } from '../config/database.js';
import { CACHE_KEYS, invalidateCache } from '../config/redis.js';
import * as adminService from '../services/adminService.js';
import * as teamService from '../services/teamService.js';
import { logger } from '../utils/logger.js';


const adminOtps = new Map<string, { otp: string; expiresAt: number }>();

export const requestOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const admins = await adminService.getAuthorizedAdmins();
  const admin = admins.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!admin) {
    return res.status(403).json({ success: false, message: 'Unauthorized email' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;
  adminOtps.set(cleanEmail, { otp, expiresAt });
  logger.info({ email: cleanEmail, otp }, 'Admin OTP generated');
  res.json({
    success: true,
    message: 'OTP sent',
    admin: { name: admin.name, email: admin.email, role: admin.role },
    demoOtp: otp,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const cleanEmail = email.trim().toLowerCase();
  const admins = await adminService.getAuthorizedAdmins();
  const admin = admins.find((a) => a.email.toLowerCase() === cleanEmail);
  if (!admin) return res.status(403).json({ success: false, message: 'Unauthorized' });

  const stored = adminOtps.get(cleanEmail);
  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
  }
  adminOtps.delete(cleanEmail);
  res.json({ success: true, message: 'Admin verified', admin });
};

export const getWhitelist = async (req: Request, res: Response) => {
  const admins = await adminService.getAuthorizedAdmins();
  res.json({ success: true, authorizedAdmins: admins });
};

export const addWhitelist = async (req: Request, res: Response) => {
  const { email, name, role, department } = req.body;
  const newAdmin = {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role: role || 'Lead Organizer',
    department: department || 'Hackathon Operations',
    addedAt: new Date().toISOString().split('T')[0],
  };
  const list = await adminService.addAdmin(newAdmin);
  res.status(201).json({ success: true, message: 'Admin added', admin: newAdmin, authorizedAdmins: list });
};

export const removeWhitelist = async (req: Request, res: Response) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();
  const list = await adminService.removeAdmin(email);
  res.json({ success: true, message: 'Admin removed', authorizedAdmins: list });
};

export const toggleSubmissions = async (req: Request, res: Response) => {
  const { submissionsOpen } = req.body;
  if (typeof submissionsOpen !== 'boolean') {
    return res.status(400).json({ success: false, message: 'submissionsOpen boolean required' });
  }
  await teamService.setSubmissionStatus(submissionsOpen);
  res.json({ success: true, submissionsOpen, message: `Submissions now ${submissionsOpen ? 'OPEN' : 'CLOSED'}` });
};

export const toggleRegistrations = async (req: Request, res: Response) => {
  const { registrationsOpen } = req.body;
  if (typeof registrationsOpen !== 'boolean') {
    return res.status(400).json({ success: false, message: 'registrationsOpen boolean required' });
  }
  await teamService.setRegistrationStatus(registrationsOpen);
  res.json({ success: true, registrationsOpen, message: `Registrations now ${registrationsOpen ? 'OPEN' : 'CLOSED'}` });
};

export const getSubmissionStatus = async (req: Request, res: Response) => {
  const isOpen = await teamService.getSubmissionStatus();
  res.json({ success: true, submissionsOpen: isOpen });
};

export const getRegistrationStatus = async (req: Request, res: Response) => {
  const isOpen = await teamService.getRegistrationStatus();
  res.json({ success: true, registrationsOpen: isOpen });
};

export const clearDatabase = async (req: Request, res: Response) => {
  await clearAllData();
  await invalidateCache(CACHE_KEYS.TEAMS);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
  res.json({ success: true, message: 'All data cleared' });
};

export const updateTeamStatus = async (req: Request, res: Response) => {
  const team = await teamService.findTeamById(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

  const { paymentStatus, checkedInVenue, ticketIssued, notes, amountPaid } = req.body;
  if (paymentStatus) {
    team.paymentStatus = paymentStatus;
    if (paymentStatus === 'verified') team.ticketIssued = true;
  }
  if (typeof amountPaid === 'number') team.amountPaid = amountPaid;
  if (typeof checkedInVenue === 'boolean') team.checkedInVenue = checkedInVenue;
  if (typeof ticketIssued === 'boolean') team.ticketIssued = ticketIssued;
  if (notes !== undefined) team.notes = notes;

  await teamService.updateTeam(team);
  res.json({ success: true, message: 'Team status updated', team });
};

export const scoreProject = async (req: Request, res: Response) => {
  const team = await teamService.findTeamById(req.params.id);
  if (!team || !team.project) {
    return res.status(404).json({ success: false, message: 'Team or project not found' });
  }
  const { innovation, technicalComplexity, uiUx, presentation, impact, feedback } = req.body;
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
  await teamService.updateTeam(team);
  res.json({ success: true, message: 'Score saved', team });
};