import {
  getAnnouncements as getStoredAnnouncements,
  addAnnouncement as addAnnouncementRecord,
  deleteAnnouncement as deleteAnnouncementRecord,
} from '../config/database.js';
import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../config/redis.js';
import { Announcement } from '../utils/types.js';

export async function getAnnouncements(): Promise<Announcement[]> {
  const cached = await getCachedData<Announcement[]>(CACHE_KEYS.ANNOUNCEMENTS);
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  const announcements = await getStoredAnnouncements();
  await setCachedData(CACHE_KEYS.ANNOUNCEMENTS, announcements);
  return announcements;
}

export async function createAnnouncement(ann: Announcement): Promise<Announcement> {
  const record = await addAnnouncementRecord(ann);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
  return record;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await deleteAnnouncementRecord(id);
  await invalidateCache(CACHE_KEYS.ANNOUNCEMENTS);
}