import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/admin';
import { readContacts, writeContacts, createContact, type OutreachContact, type ContactStatus } from '@/lib/outreach';

export const dynamic = 'force-dynamic';

export async function GET() {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    const contacts = readContacts();
    return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    const body = await req.json();
    const { name, type, email, website, notes } = body;

    if (!name || !type || !email) {
        return NextResponse.json({ error: 'name, type, and email are required' }, { status: 400 });
    }

    const contacts = readContacts();
    const contact = createContact({ name, type, email, website: website ?? '', notes: notes ?? '' });
    contacts.push(contact);
    writeContacts(contacts);

    return NextResponse.json({ contact }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    const body = await req.json() as Partial<OutreachContact> & { id: string };
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const contacts = readContacts();
    const idx = contacts.findIndex(c => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    // Only allow updating safe fields
    const allowed: (keyof OutreachContact)[] = ['status', 'notes', 'emailHistory', 'lastContactedAt', 'name', 'email', 'website', 'type'];
    const contactAsRecord = contacts[idx] as unknown as Record<string, unknown>;
    const updatesAsRecord = updates as unknown as Record<string, unknown>;
    for (const key of allowed) {
        if (key in updates) {
            contactAsRecord[key] = updatesAsRecord[key];
        }
    }

    writeContacts(contacts);
    return NextResponse.json({ contact: contacts[idx] });
}

export async function DELETE(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const contacts = readContacts();
    const filtered = contacts.filter(c => c.id !== id);
    if (filtered.length === contacts.length) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    writeContacts(filtered);
    return NextResponse.json({ success: true });
}

// Bulk import from CSV data
export async function PUT(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    const body = await req.json() as { contacts: Array<{ name: string; type: string; email: string; website?: string; notes?: string }> };
    if (!Array.isArray(body.contacts)) return NextResponse.json({ error: 'contacts array required' }, { status: 400 });

    const contacts = readContacts();
    const existingEmails = new Set(contacts.map(c => c.email.toLowerCase()));
    const added: OutreachContact[] = [];
    const skipped: string[] = [];

    for (const row of body.contacts) {
        if (!row.name || !row.email || !row.type) { skipped.push(row.email ?? 'unknown'); continue; }
        if (existingEmails.has(row.email.toLowerCase())) { skipped.push(row.email); continue; }
        const contact = createContact({
            name: row.name,
            type: (row.type === 'resale_platform' ? 'resale_platform' : 'boutique'),
            email: row.email,
            website: row.website ?? '',
            notes: row.notes ?? '',
        });
        added.push(contact);
        existingEmails.add(row.email.toLowerCase());
    }

    writeContacts([...contacts, ...added]);
    return NextResponse.json({ added: added.length, skipped: skipped.length });
}
