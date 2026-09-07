import { Router } from 'express';
import {
  listTeams,
  getTeam,
  teamLogin,
  registerTeam,
  submitProject,
  deleteTeam,
} from '../controllers/teamController.js';
import { validate, registerTeamValidation, projectSubmissionValidation } from '../validators/index.js';
import { requireAdminAuth, requireAdminOrJuryAuth, requireTeamOrAdminAuth } from '../middleware/auth.js';

const router = Router();

// Protected: Only Admin or Jury can list teams
router.get('/', requireAdminOrJuryAuth, listTeams);

// Team details: Sanitized for public, full data if authenticated as team or admin
router.get('/:id', getTeam);

// Team authentication
router.post('/auth/team-login', teamLogin);

// Team registration
router.post('/register', registerTeamValidation, validate, registerTeam);

// Project submission: Requires team or admin authentication
router.put('/:id/project', requireTeamOrAdminAuth, projectSubmissionValidation, validate, submitProject);

// Admin only
router.delete('/:id', requireAdminAuth, deleteTeam);

export default router;
