import { Request, Response } from 'express';
import { getHackathonStats } from '../services/statsService.js';

export const getStats = async (req: Request, res: Response) => {
  const stats = await getHackathonStats();
  res.json({ success: true, stats });
};