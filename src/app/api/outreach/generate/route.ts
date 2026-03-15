import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { requireAdmin } from '@/lib/admin';
import Anthropic from '@anthropic-ai/sdk';
import { readContacts } from '@/lib/outreach';

export const dynamic = 'force-dynamic';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VPA_PITCH = `
VPA Registry is a cryptographic authenticity certification platform for luxury and high-end products.
Similar to how GIA certifies diamonds, VPA certifies product photos — issuing a unique watermarked image
with a QR code that links to a tamper-proof public registry entry. Buyers can scan the QR code to verify
the product's authenticity, origin, and chain of custody in seconds.

Key benefits for boutiques and resale platforms:
- Instantly eliminate counterfeit listings and build buyer trust
- Each certified photo carries a unique VPA ID verifiable at vparegistry.com
- Partners get a professional dashboard to issue and manage certificates
- Used by luxury fashion, watches, jewellery, and collectibles markets
- Simple integration: upload a product photo, receive certified image + QR code
- Starter plan from $49/month, Professional from $149/month
`.trim();

export async function POST(req: NextRequest) {
    const adminCheck = await requireAdmin();
    if ("error" in adminCheck) return adminCheck.error;

    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 });
    }

    const { contactId, tone = 'formal', isFollowup = false, previousEmailDate } = await req.json();
    if (!contactId) return NextResponse.json({ error: 'contactId is required' }, { status: 400 });

    const contacts = readContacts();
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    const typeLabel = contact.type === 'resale_platform' ? 'luxury resale platform' : 'high-end boutique';

    const prompt = isFollowup
        ? `You are writing a professional follow-up email on behalf of VPA Registry to ${contact.name}, a ${typeLabel}.

The initial outreach email was sent on ${previousEmailDate ?? 'a few days ago'}. There has been no reply yet.

About VPA Registry:
${VPA_PITCH}

Write a brief, polite follow-up email. Reference the previous contact, reiterate the core value proposition in 1-2 sentences, and suggest a short 15-minute call or request a reply if they have any questions.

Tone: ${tone === 'warm' ? 'friendly and warm, like a fellow industry professional' : 'professional and respectful'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{"subject": "...", "body": "..."}`
        : `You are writing a cold outreach email on behalf of VPA Registry to ${contact.name}, a ${typeLabel}${contact.website ? ` (${contact.website})` : ''}.

About VPA Registry:
${VPA_PITCH}

Write a compelling, concise outreach email (3-4 short paragraphs). Personalise it to a ${typeLabel}. Mention how VPA certification can help their specific business — buyer trust, anti-counterfeiting, and a professional verification seal their customers will recognise.

End with a clear call to action: suggest a 15-minute introductory call or offer a free trial certificate.

Tone: ${tone === 'warm' ? 'friendly and warm, like a fellow industry professional' : 'professional and respectful'}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{"subject": "...", "body": "..."}`;

    try {
        const message = await client.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });

        const text = message.content[0].type === 'text' ? message.content[0].text : '';
        const parsed = JSON.parse(text.trim()) as { subject: string; body: string };

        return NextResponse.json({ subject: parsed.subject, body: parsed.body });
    } catch (err) {
        console.error('[Outreach/Generate] Error:', err);
        return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
    }
}
