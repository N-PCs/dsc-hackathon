import { Request, Response, NextFunction } from 'express';
import { getAuthorizedAdmins } from '../services/adminService.js';
import { logger } from '../utils/logger.js';

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminEmail = (
    (req.headers['x-admin-email'] as string) ||
    (req.headers['authorization']?.replace('Bearer ', '') as string) ||
    ''
  ).trim().toLowerCase();

  if (!adminEmail) {
    logger.warn({ ip: req.ip }, 'Admin auth missing header');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: x-admin-email header required',
    });
  }

  const admins = await getAuthorizedAdmins();
  const admin = admins.find((a) => a.email.toLowerCase() === adminEmail);

  if (!admin) {
    logger.warn({ email: adminEmail, ip: req.ip }, 'Admin not whitelisted');
    return res.status(403).json({
      success: false,
      message: `Access Denied: ${adminEmail} is not an authorized administrator.`,
    });
  }

  (req as any).adminUser = admin;
  next();
}