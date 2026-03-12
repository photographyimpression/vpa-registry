import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAllCertificates } from '@/lib/data';

/**
 * GET /api/dashboard
 * Returns real certificate stats and recent records from Google Sheets.
 * Requires an active partner session.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const records = await getAllCertificates();

        const totalCertificates = records.length;
        const recent = records.slice(-10).reverse(); // last 10, newest first

        return NextResponse.json({
            totalCertificates,
            recent,
        });
    } catch (error) {
        console.error('[VPA Dashboard API] Error:', error);
        return NextResponse.json({ totalCertificates: 0, recent: [] });
    }
}
