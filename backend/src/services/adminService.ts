import { getCachedData, setCachedData, invalidateCache, CACHE_KEYS } from '../config/redis.js';
import {
  getAuthorizedAdmins as getStoredAdmins,
  addAdmin as addAdminToStore,
  removeAdmin as removeAdminFromStore,
} from '../config/database.js';
import { AdminUser } from '../utils/types.js';

export async function getAuthorizedAdmins(): Promise<AdminUser[]> {
  const cached = await getCachedData<AdminUser[]>(CACHE_KEYS.ADMINS);
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  const admins = await getStoredAdmins();
  await setCachedData(CACHE_KEYS.ADMINS, admins);
  return admins;
}

export async function addAdmin(admin: AdminUser): Promise<AdminUser[]> {
  await addAdminToStore(admin);
  await invalidateCache(CACHE_KEYS.ADMINS);
  return getAuthorizedAdmins();
}

export async function removeAdmin(email: string): Promise<AdminUser[]> {
  await removeAdminFromStore(email);
  await invalidateCache(CACHE_KEYS.ADMINS);
  return getAuthorizedAdmins();
}