import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/admin';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { readContacts, writeContacts } from '@/lib/outreach';

export const dynamic = 'force-dynamic';

const FOLLOWUP_DAYS = 5; // send follow-up after 5 days of silence

export async function POST() {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    if (!process.env.ANTHROPIC_API_KEY || !process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY and RESEND_API_KEY must be configured' }, { status: 503 });
    }

    const contacts = readContacts();
    const now = Date.now();
    const cutoff = FOLLOWUP_DAYS * 24 * 60 * 60 * 1000;

    // Find contacts that were emailed but haven't responded, and last contact was >= FOLLOWUP_DAYS ago
    const stale = contacts.filter(c =>
        c.status === 'emailed' &&
        c.lastContactedAt !== null &&
        (now - new Date(c.lastContactedAt).getTime()) >= cutoff
    );

    if (stale.length === 0) {
        return NextResponse.json({ message: 'No follow-ups needed', sent: 0 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.OUTREACH_FROM_EMAIL ?? 'partners@vparegistry.com';

    const VPA_PITCH = `VPA Registry is a cryptographic authenticity certification platform for luxury and high-end products. Similar to GIA for diamonds, VPA certifies product photos with a unique watermarked image and QR code linking to a tamper-proof public registry. Buyers scan the QR code to verify authenticity instantly at vparegistry.com.`;

    let sent = 0;
    const errors: string[] = [];

    for (const contact of stale) {
        const typeLabel = contact.type === 'resale_platform' ? 'luxury resale platform' : 'high-end boutique';
        const lastDate = contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : 'recently';

        const prompt = `You are writing a brief, polite follow-up email on behalf of VPA Registry to ${contact.name}, a ${typeLabel}.

The initial outreach was sent on ${lastDate}. There has been no reply yet.

About VPA Registry: ${VPA_PITCH}

Write a 2-3 paragraph follow-up. Be brief — acknowledge they are busy, restate the core value in one sentence, and suggest a simple next step (a 15-minute call or a direct reply).

Return ONLY valid JSON: {"subject": "...", "body": "..."}`;

        try {
            const message = await anthropic.messages.create({
                model: 'claude-opus-4-6',
                max_tokens: 512,
                messages: [{ role: 'user', content: prompt }],
            });

            const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
            const { subject, body } = JSON.parse(text) as { subject: string; body: string };

            const { error } = await resend.emails.send({ from: fromEmail, to: contact.email, subject, text: body });
            if (error) throw new Error(error.message);

            // Update contact record
            const today = new Date().toISOString().split('T')[0];
            const idx = contacts.findIndex(c => c.id === contact.id);
            contacts[idx].emailHistory.push({ date: today, subject, body, type: 'followup' });
            contacts[idx].lastContactedAt = new Date().toISOString();
            sent++;
        } catch (err) {
            console.error(`[Outreach/Followup] Failed for ${contact.name}:`, err);
            errors.push(`${contact.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    }

    writeContacts(contacts);

    return NextResponse.json({
        message: `Follow-up run complete`,
        sent,
        errors: errors.length > 0 ? errors : undefined,
    });
}

// Also allow GET for the scheduled task runner (no auth needed — uses a secret token)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token || token !== process.env.OUTREACH_CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Reuse the POST logic by calling it directly
    const contacts = readContacts();
    const now = Date.now();
    const cutoff = FOLLOWUP_DAYS * 24 * 60 * 60 * 1000;
    const stale = contacts.filter(c =>
        c.status === 'emailed' &&
        c.lastContactedAt !== null &&
        (now - new Date(c.lastContactedAt).getTime()) >= cutoff
    );

    return NextResponse.json({ staleCount: stale.length, contacts: stale.map(c => ({ id: c.id, name: c.name, lastContactedAt: c.lastContactedAt })) });
}
