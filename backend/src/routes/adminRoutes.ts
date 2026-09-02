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

const router = Router();

// OTP flow (public)
router.post('/auth/request-otp', adminOtpRequestValidation, validate, requestOtp);
router.post('/auth/verify-otp', adminOtpVerifyValidation, validate, verifyOtp);

// ✅ These two endpoints are now public (no admin auth required)
router.get('/submissions-status', getSubmissionStatus);
router.get('/registrations-status', getRegistrationStatus);

// All subsequent routes require admin authentication
router.use(requireAdminAuth);

// Whitelist
router.get('/whitelist', getWhitelist);
router.post('/whitelist', whitelistAddValidation, validate, addWhitelist);
router.delete('/whitelist/:email', removeWhitelist);

// Submission & registration toggles (admin only)
router.post('/submissions-toggle', toggleSubmissions);
router.post('/registrations-toggle', toggleRegistrations);

// Database
router.post('/clear-database', clearDatabase);

// Team management (admin)
router.patch('/teams/:id/status', teamStatusUpdateValidation, validate, updateTeamStatus);
router.post('/teams/:id/score', scoreSubmissionValidation, validate, scoreProject);

export default router;