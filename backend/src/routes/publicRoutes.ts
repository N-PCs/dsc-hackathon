import { Router } from 'express';
import { getStats } from '../controllers/statsController.js';
import * as teamService from '../services/teamService.js';
import * as announcementService from '../services/announcementService.js';
import { getDeadline } from '../config/database.js';
import { isDeadlinePassed } from '../utils/deadline.js';

const router = Router();

router.get('/stats', getStats);

router.get('/live-status', async (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const [submissionsOpen, registrationsOpen, announcements, deadline] = await Promise.all([
      teamService.getSubmissionStatus(),
      teamService.getRegistrationStatus(),
      announcementService.getAnnouncements(),
      getDeadline(),
    ]);
    res.json({
      success: true,
      submissionsOpen,
      registrationsOpen,
      announcements,
      deadline,
      isDeadlinePassed: isDeadlinePassed(deadline),
      serverTime: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load live status' });
  }
});

export default router;
