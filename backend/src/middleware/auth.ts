import { Request, Response, NextFunction } from 'express';
import { getAuthorizedAdmins } from '../services/adminService.js';
import { findTeamById } from '../services/teamService.js';
import { verifyToken, timingSafeEqual } from '../utils/security.js';
import { logger } from '../utils/logger.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

/**
 * Extract token from Authorization header (Bearer <token>)
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return authHeader.trim();
}

/**
 * Strict Admin Authentication Middleware
 * Requires a cryptographically verified JWT token or valid ADMIN_SECRET.
 * REJECTS any unauthenticated x-admin-email spoofing attempts!
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Check for Admin Secret Key header (e.g. for CLI/scripts)
  const secretHeader = (req.headers['x-admin-secret'] as string) || '';
  if (ADMIN_SECRET && secretHeader && timingSafeEqual(secretHeader, ADMIN_SECRET)) {
    (req as any).adminUser = { email: 'admin@internal', role: 'Superadmin' };
    return next();
  }

  // 2. Check for cryptographically signed Bearer JWT
  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.role === 'admin' && payload.email) {
      const admins = await getAuthorizedAdmins();
      const admin = admins.find((a) => a.email.toLowerCase() === payload.email?.toLowerCase());
      if (admin) {
        (req as any).adminUser = admin;
        return next();
      }
    }
  }

  // 3. Fallback for legacy development environment ONLY if explicitly allowed
  if (process.env.ALLOW_INSECURE_DEV_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    const devEmail = ((req.headers['x-admin-email'] as string) || '').trim().toLowerCase();
    if (devEmail) {
      const admins = await getAuthorizedAdmins();
      const admin = admins.find((a) => a.email.toLowerCase() === devEmail);
      if (admin) {
        logger.warn({ email: devEmail }, '⚠️ Insecure dev auth header accepted (dev mode only)');
        (req as any).adminUser = admin;
        return next();
      }
    }
  }

  logger.warn({ ip: req.ip, url: req.originalUrl }, 'Unauthorized admin access attempt blocked');
  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Valid Admin Bearer token required.',
  });
}

/**
 * Strict Jury Authentication Middleware
 * Requires a verified Jury token or Admin token.
 */
export async function requireJuryAuth(req: Request, res: Response, next: NextFunction) {
  // Admin secret bypass
  const secretHeader = (req.headers['x-admin-secret'] as string) || '';
  if (ADMIN_SECRET && secretHeader && timingSafeEqual(secretHeader, ADMIN_SECRET)) {
    (req as any).juryUser = { email: 'jury@internal' };
    return next();
  }

  const token = extractBearerToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload && (payload.role === 'jury' || payload.role === 'admin') && payload.email) {
      (req as any).juryUser = { email: payload.email, role: payload.role };
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized: Valid Jury Bearer token required.',
  });
}

/**
 * Allows either Admin or Jury to access endpoints (e.g. view submissions / list teams)
 */
export async function requireAdminOrJuryAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  const secretHeader = (req.headers['x-admin-secret'] as string) || '';

  if (ADMIN_SECRET && secretHeader && timingSafeEqual(secretHeader, ADMIN_SECRET)) {
    return next();
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload && (payload.role === 'admin' || payload.role === 'jury')) {
      if (payload.role === 'admin') {
        const admins = await getAuthorizedAdmins();
        if (admins.some((a) => a.email.toLowerCase() === payload.email?.toLowerCase())) {
          (req as any).adminUser = { email: payload.email };
          return next();
        }
      } else {
        (req as any).juryUser = { email: payload.email };
        return next();
      }
    }
  }

  // Development bypass if explicitly enabled
  if (process.env.ALLOW_INSECURE_DEV_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    const devEmail = ((req.headers['x-admin-email'] as string) || '').trim().toLowerCase();
    if (devEmail) {
      const admins = await getAuthorizedAdmins();
      if (admins.some((a) => a.email.toLowerCase() === devEmail)) {
        return next();
      }
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Access denied: Valid Admin or Jury authentication required to access team database.',
  });
}

/**
 * Team or Admin Authentication Middleware
 * Protects project submissions and private team modifications.
 * Ensures the caller is either the verified team owner (via token or access code) or an admin.
 */
export async function requireTeamOrAdminAuth(req: Request, res: Response, next: NextFunction) {
  const targetTeamId = (req.params.id || req.body.teamId || '').trim().toUpperCase();

  // 1. Admin bypass
  const token = extractBearerToken(req);
  const secretHeader = (req.headers['x-admin-secret'] as string) || '';
  if (ADMIN_SECRET && secretHeader && timingSafeEqual(secretHeader, ADMIN_SECRET)) {
    return next();
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      if (payload.role === 'admin') {
        return next();
      }
      if (payload.role === 'team' && payload.teamId?.toUpperCase() === targetTeamId) {
        return next();
      }
    }
  }

  // 2. Validate using accessCode provided in headers or body
  const accessCode = (req.headers['x-access-code'] as string || req.body.accessCode || '').trim();
  if (accessCode && targetTeamId) {
    const team = await findTeamById(targetTeamId);
    if (team && timingSafeEqual(team.accessCode, accessCode)) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    message: 'Access Denied: You do not have permission to modify this team project.',
  });
}
