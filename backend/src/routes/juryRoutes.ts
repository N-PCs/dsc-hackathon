import { Router } from 'express';
import { scoreProject } from '../controllers/adminController.js';
import { requireJuryAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/jury/teams/:id/score
router.post('/teams/:id/score', requireJuryAuth, scoreProject);

export default router;