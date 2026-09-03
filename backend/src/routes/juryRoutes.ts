import { Router } from 'express';
import { scoreProject } from '../controllers/adminController.js';
import { requireJuryAuth } from '../middleware/auth.js';

const router = Router();


router.get('/allowed-emails', (req, res) => {
  const emails = process.env.JURY_ALLOWED_EMAILS?.split(',').map(e => e.trim()) || [];
  res.json({ success: true, allowedEmails: emails });
});



// POST /api/jury/teams/:id/score
router.post('/teams/:id/score', requireJuryAuth, scoreProject);

export default router;