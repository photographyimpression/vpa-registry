import crypto from 'crypto';

export interface UserRecord {
    email: string;
    name: string;
    hashedPassword: string;
}

function hashPassword(password: string): string {
    return crypto.pbkdf2Sync(password, process.env.AUTH_SECRET!, 100000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

// Lazy-load Redis only when env vars are present
async function getRedis() {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
    const { Redis } = await import('@upstash/redis');
    return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
    const key = email.toLowerCase();

    // Check env-var admin user first (always available, no external deps)
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminHash = process.env.ADMIN_PASS_HASH;
    if (adminEmail && adminHash && adminEmail === key) {
        return { email: adminEmail, name: 'Admin', hashedPassword: adminHash };
    }

    // Fall back to Upstash Redis if configured
    try {
        const redis = await getRedis();
        if (!redis) return null;
        return await redis.get<UserRecord>(`user:${key}`);
    } catch {
        return null;
    }
}

export async function createUser(email: string, name: string, password: string): Promise<void> {
    const redis = await getRedis();
    if (!redis) throw new Error('Redis not configured');
    const user: UserRecord = {
        email: email.toLowerCase(),
        name,
        hashedPassword: hashPassword(password),
    };
    await redis.set(`user:${user.email}`, user);
}
