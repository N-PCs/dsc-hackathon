import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[Upstash Redis] Redis client successfully initialized.');
  } catch (err) {
    console.warn('[Upstash Redis] Failed to initialize Redis client:', err);
    redisClient = null;
  }
} else {
  console.log('[Upstash Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not configured.');
}

export const redis = redisClient;

// Cache Keys
export const CACHE_KEYS = {
  TEAMS: 'origin:teams',
  ANNOUNCEMENTS: 'origin:announcements',
  ADMINS: 'origin:admins',
  SUBMISSION_STATUS: 'origin:submission_status',
  REGISTRATION_STATUS: 'origin:registration_status',
};

// Default TTL: 1 hour (3600 seconds)
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
    console.warn(`[Redis Cache Error] Failed to get key ${key}:`, err);
    return null;
  }
}

export async function setCachedData<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[Redis Cache Error] Failed to set key ${key}:`, err);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[Redis Cache Error] Failed to delete key ${key}:`, err);
  }
}
