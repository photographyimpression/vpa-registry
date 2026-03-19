import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/campaigns/[id]
 * Returns a single campaign with full stats.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const webhookUrl = process.env.N8N_CAMPAIGNS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Campaigns webhook not configured' }, { status: 500 });
        }

        const url = new URL(webhookUrl);
        url.searchParams.set('id', id);

        const res = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!res.ok) {
            if (res.status === 404) {
                return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
            }
            throw new Error(`Webhook responded with ${res.status}`);
        }

        const campaign = await res.json();
        return NextResponse.json(campaign);
    } catch (error) {
        console.error('[Campaigns API] GET [id] error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch campaign' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign (pause/resume, change daily limit).
 * Body: { status?, dailyLimit? }
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { status, dailyLimit } = body;

        const webhookUrl = process.env.N8N_CAMPAIGNS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Campaigns webhook not configured' }, { status: 500 });
        }

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                id,
                ...(status !== undefined && { status }),
                ...(dailyLimit !== undefined && { dailyLimit }),
                updatedBy: session.user.email,
            }),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Webhook responded with ${res.status}`);
        }

        const campaign = await res.json();
        return NextResponse.json(campaign);
    } catch (error) {
        console.error('[Campaigns API] PATCH error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update campaign' },
            { status: 500 }
        );
    }
}
