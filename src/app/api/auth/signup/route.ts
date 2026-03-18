import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/users';

export async function POST(req: NextRequest) {
    try {
        const { email, name, password } = await req.json();

        if (!email || !name || !password) {
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const existing = await getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
        }

        await createUser(email, name, password);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
