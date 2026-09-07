import { Router } from 'express';
import { scoreProject } from '../controllers/adminController.js';
import { requireJuryAuth } from '../middleware/auth.js';
import { verifyJuryCredentials, signJuryToken } from '../utils/security.js';

const router = Router();

// Jury Authentication: Login with authorized email and secure passcode
router.post('/auth/login', (req, res) => {
  const { email, passcode } = req.body || {};
  if (!email || !passcode) {
    return res.status(400).json({ success: false, message: 'Email and passcode required' });
  }

  const isValid = verifyJuryCredentials(email, passcode);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid jury email or passcode' });
  }

  const token = signJuryToken(email);
  res.json({ success: true, message: 'Jury authenticated', token, email: email.toLowerCase() });
});

// Scoring: Requires verified Jury token
router.post('/teams/:id/score', requireJuryAuth, scoreProject);

export default router;
