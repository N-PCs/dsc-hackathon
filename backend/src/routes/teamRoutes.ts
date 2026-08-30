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
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/auth/team-login', teamLogin);
router.post('/register', registerTeamValidation, validate, registerTeam);

// Project submission (team uses their id)
router.put('/:id/project', projectSubmissionValidation, validate, submitProject);

// Admin only
router.delete('/:id', requireAdminAuth, deleteTeam);

export default router;