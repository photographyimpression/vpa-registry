import { NextResponse } from 'next/server';
import { getAllCertificates } from '@/lib/data';

/**
 * GET /api/dashboard
 * Returns real certificate stats and recent records from Google Sheets.
 */
export async function GET() {
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
