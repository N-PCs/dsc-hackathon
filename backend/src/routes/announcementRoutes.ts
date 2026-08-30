import { Router } from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { validate, announcementValidation } from '../validators/index.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getAnnouncements);
router.post('/', requireAdminAuth, announcementValidation, validate, createAnnouncement);
router.delete('/:id', requireAdminAuth, deleteAnnouncement);

export default router;