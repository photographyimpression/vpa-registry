import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

/**
 * GET /api/campaigns
 * Returns all campaigns from PostgreSQL via N8N webhook.
 */
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const webhookUrl = process.env.N8N_CAMPAIGNS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Campaigns webhook not configured' }, { status: 500 });
        }

        const res = await fetch(webhookUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Webhook responded with ${res.status}`);
        }

        const campaigns = await res.json();
        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('[Campaigns API] GET error:', error);
        return NextResponse.json([], { status: 200 });
    }
}

/**
 * POST /api/campaigns
 * Create a new campaign.
 * Body: { name, industry, city, country?, dailyLimit? }
 */
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, industry, city, country, dailyLimit } = body;

        if (!name || !industry || !city) {
            return NextResponse.json(
                { error: 'name, industry, and city are required' },
                { status: 400 }
            );
        }

        const webhookUrl = process.env.N8N_CAMPAIGNS_WEBHOOK_URL;
        if (!webhookUrl) {
            return NextResponse.json({ error: 'Campaigns webhook not configured' }, { status: 500 });
        }

        const res = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                name,
                industry,
                city,
                country: country || 'Canada',
                dailyLimit: dailyLimit || 1,
                createdBy: session.user.email,
            }),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Webhook responded with ${res.status}`);
        }

        const campaign = await res.json();
        return NextResponse.json(campaign, { status: 201 });
    } catch (error) {
        console.error('[Campaigns API] POST error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
