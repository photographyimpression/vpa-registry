import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function requireAdmin(): Promise<{ error: NextResponse } | { ok: true }> {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

    if (!session?.user?.email || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
        return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    }
    return { ok: true };
}
