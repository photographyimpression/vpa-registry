import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
    try {
        const user = await redis.get<UserRecord>(`user:${email.toLowerCase()}`);
        return user;
    } catch {
        return null;
    }
}

export async function createUser(email: string, name: string, password: string): Promise<void> {
    const user: UserRecord = {
        email: email.toLowerCase(),
        name,
        hashedPassword: hashPassword(password),
    };
    await redis.set(`user:${email.toLowerCase()}`, user);
}
