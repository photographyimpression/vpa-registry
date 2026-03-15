import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export type ContactStatus = 'new' | 'emailed' | 'responded' | 'demo' | 'signed' | 'rejected';
export type ContactType = 'boutique' | 'resale_platform';

export interface EmailEntry {
    date: string;
    subject: string;
    body: string;
    type: 'outreach' | 'followup';
}

export interface OutreachContact {
    id: string;
    name: string;
    type: ContactType;
    email: string;
    website: string;
    status: ContactStatus;
    notes: string;
    emailHistory: EmailEntry[];
    lastContactedAt: string | null;
    addedAt: string;
}

const CONTACTS_PATH = join(process.cwd(), 'data', 'outreach-contacts.json');

export function readContacts(): OutreachContact[] {
    try {
        return JSON.parse(readFileSync(CONTACTS_PATH, 'utf-8'));
    } catch {
        return [];
    }
}

export function writeContacts(contacts: OutreachContact[]): void {
    writeFileSync(CONTACTS_PATH, JSON.stringify(contacts, null, 2), 'utf-8');
}

export function createContact(data: Omit<OutreachContact, 'id' | 'emailHistory' | 'lastContactedAt' | 'addedAt' | 'status'>): OutreachContact {
    return {
        id: randomUUID(),
        status: 'new',
        emailHistory: [],
        lastContactedAt: null,
        addedAt: new Date().toISOString().split('T')[0],
        ...data,
    };
}
