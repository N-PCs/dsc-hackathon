import { Router } from 'express';
import teamRoutes from './teamRoutes.js';
import adminRoutes from './adminRoutes.js';
import announcementRoutes from './announcementRoutes.js';
import publicRoutes from './publicRoutes.js';
import juryRoutes from './juryRoutes.js';
import { uploadFile } from '../controllers/uploadController.js';
import { exportCsv, exportExcel } from '../controllers/exportController.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public stats
router.use(publicRoutes);

// Teams
router.use('/teams', teamRoutes);

// Announcements
router.use('/announcements', announcementRoutes);

// Admin
router.use('/admin', adminRoutes);

// File upload (public, but with signature validation)
router.post('/upload', uploadFile);

// Exports (admin only)
router.get('/export-csv', requireAdminAuth, exportCsv);
router.get('/export-excel', requireAdminAuth, exportExcel);

//jury 
router.use('/jury', juryRoutes);

export default router;