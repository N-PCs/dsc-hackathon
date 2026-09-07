import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error({ err, method: req.method, url: req.url, ip: req.ip }, 'Unhandled server error');
  if (res.headersSent) return next(err);

  const status = typeof err.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
  
  // Obscure internal error messages in production to prevent schema or connection string leakage
  let message = err.message || 'Internal Server Error';
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal server error occurred. Please contact the hackathon administrator.';
  }

  res.status(status).json({ success: false, message });
}
