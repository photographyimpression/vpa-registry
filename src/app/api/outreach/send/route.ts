import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/admin';
import { Resend } from 'resend';
import { readContacts, writeContacts } from '@/lib/outreach';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 });
    }

    const { contactId, subject, body, type = 'outreach' } = await req.json() as {
        contactId: string;
        subject: string;
        body: string;
        type?: 'outreach' | 'followup';
    };

    if (!contactId || !subject || !body) {
        return NextResponse.json({ error: 'contactId, subject, and body are required' }, { status: 400 });
    }

    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.id === contactId);
    if (idx === -1) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    const contact = contacts[idx];
    const fromEmail = process.env.OUTREACH_FROM_EMAIL ?? 'partners@vparegistry.com';
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to: contact.email,
            subject,
            text: body,
        });

        if (error) throw new Error(error.message);

        // Log the sent email and update status
        const today = new Date().toISOString().split('T')[0];
        contacts[idx].emailHistory.push({ date: today, subject, body, type });
        contacts[idx].lastContactedAt = new Date().toISOString();
        contacts[idx].status = 'emailed';
        writeContacts(contacts);

        return NextResponse.json({ success: true, contact: contacts[idx] });
    } catch (err) {
        console.error('[Outreach/Send] Error:', err);
        return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send email' }, { status: 500 });
    }
}
