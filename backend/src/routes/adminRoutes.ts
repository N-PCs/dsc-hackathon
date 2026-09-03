import { Router } from 'express';
import {
  requestOtp,
  verifyOtp,
  getWhitelist,
  addWhitelist,
  removeWhitelist,
  toggleSubmissions,
  toggleRegistrations,
  getSubmissionStatus,
  getRegistrationStatus,
  clearDatabase,
  updateTeamStatus,
  scoreProject,
  getDeadline,
  setDeadline,
} from '../controllers/adminController.js';
import {
  validate,
  adminOtpRequestValidation,
  adminOtpVerifyValidation,
  whitelistAddValidation,
  teamStatusUpdateValidation,
  scoreSubmissionValidation,
} from '../validators/index.js';
import { requireAdminAuth } from '../middleware/auth.js';
import * as adminService from '../services/adminService.js';

const router = Router();

// OTP flow (public)
router.post('/auth/request-otp', adminOtpRequestValidation, validate, requestOtp);
router.post('/auth/verify-otp', adminOtpVerifyValidation, validate, verifyOtp);

// ✅ Public email verification
router.post('/verify-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  const admins = await adminService.getAuthorizedAdmins();
  const admin = admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, admin });
});

// Public status endpoints
router.get('/submissions-status', getSubmissionStatus);
router.get('/registrations-status', getRegistrationStatus);

// All subsequent routes require admin authentication
router.use(requireAdminAuth);

// Whitelist
router.get('/whitelist', getWhitelist);
router.post('/whitelist', whitelistAddValidation, validate, addWhitelist);
router.delete('/whitelist/:email', removeWhitelist);

// Submission & registration toggles
router.post('/submissions-toggle', toggleSubmissions);
router.post('/registrations-toggle', toggleRegistrations);

// Deadline management
router.get('/deadline', getDeadline);
router.post('/deadline', setDeadline);

// Database
router.post('/clear-database', clearDatabase);

// Team management (admin)
router.patch('/teams/:id/status', teamStatusUpdateValidation, validate, updateTeamStatus);
router.post('/teams/:id/score', scoreSubmissionValidation, validate, scoreProject);

export default router;