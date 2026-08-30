import { Redis } from '@upstash/redis';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({ url: redisUrl, token: redisToken });
    logger.info('[Upstash Redis] Client initialized.');
  } catch (err) {
    logger.warn({ err }, '[Upstash Redis] Failed to initialize');
  }
} else {
  logger.info('[Upstash Redis] Credentials not configured.');
}

export const redis = redisClient;

export const CACHE_KEYS = {
  TEAMS: 'origin:teams',
  ANNOUNCEMENTS: 'origin:announcements',
  ADMINS: 'origin:admins',
  SUBMISSION_STATUS: 'origin:submission_status',
  REGISTRATION_STATUS: 'origin:registration_status',
};

export const DEFAULT_TTL = 3600;

export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get<T>(key);
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as T;
      } catch {
        return data as unknown as T;
      }
    }
    return data;
  } catch (err) {
    logger.warn({ err, key }, '[Redis] Get failed');
    return null;
  }
}

export async function setCachedData<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    logger.warn({ err, key }, '[Redis] Set failed');
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, '[Redis] Delete failed');
  }
}