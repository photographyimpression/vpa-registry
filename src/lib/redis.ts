import { Redis } from '@upstash/redis';

/**
 * Shared Upstash Redis client.
 * Required in production for rate limiting + caching.
 * Returns null only when env vars are missing (local dev).
 */
export const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Redis({
              url: process.env.UPSTASH_REDIS_REST_URL,
              token: process.env.UPSTASH_REDIS_REST_TOKEN,
          })
        : null;

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Asserts Redis is available.  In production, throws if not configured.
 * In development, returns false (callers can fall back to local state).
 */
export function requireRedis(): boolean {
    if (redis) return true;
    if (IS_PRODUCTION) {
        console.warn(
            '[VPA] UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN not set — ' +
            'using in-memory rate limiting (not distributed across instances).'
        );
    }
    return false;
}
