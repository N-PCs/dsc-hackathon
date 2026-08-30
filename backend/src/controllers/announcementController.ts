import { Request, Response } from 'express';
import * as announcementService from '../services/announcementService.js';
import { Announcement } from '../utils/types.js';

export const getAnnouncements = async (req: Request, res: Response) => {
  const announcements = await announcementService.getAnnouncements();
  res.json({ success: true, announcements });
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const { title, message, category = 'general', sender = 'DSC Origin Admin' } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message required' });
  }
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    category,
    timestamp: 'Just now',
    sender,
  };
  await announcementService.createAnnouncement(newAnn);
  res.status(201).json({ success: true, announcement: newAnn });
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID required' });
  await announcementService.deleteAnnouncement(id);
  res.json({ success: true, message: 'Announcement deleted' });
};