import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/campaigns/[id]/prospects
 * Returns paginated prospects for a campaign.
 * Query params: page, limit, status (filter).
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '25';
        const status = searchParams.get('status') || '';

        const webhookUrl = process.env.N8N_CAMPAIGNS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Campaigns webhook not configured' }, { status: 500 });
        }

        const url = new URL(webhookUrl);
        url.searchParams.set('id', id);
        url.searchParams.set('resource', 'prospects');
        url.searchParams.set('page', page);
        url.searchParams.set('limit', limit);
        if (status) url.searchParams.set('status', status);

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Webhook responded with ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Campaigns API] GET prospects error:', error);
        return NextResponse.json(
            { prospects: [], total: 0, page: 1, limit: 25 },
            { status: 200 }
        );
    }
}
