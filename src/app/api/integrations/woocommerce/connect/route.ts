import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { WooCommerceClient } from '@/lib/woocommerce';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storeUrl, consumerKey, consumerSecret } = await req.json();

    if (!storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate URL format
    try { new URL(storeUrl); } catch {
      return NextResponse.json({ error: 'Invalid store URL' }, { status: 400 });
    }

    // Test connection
    const client = new WooCommerceClient(storeUrl, consumerKey, consumerSecret);
    const connected = await client.testConnection();

    if (!connected) {
      return NextResponse.json({ error: 'Could not connect to WooCommerce. Check your API credentials.' }, { status: 400 });
    }

    // Store integration in n8n/database
    const webhookUrl = process.env.N8N_INTEGRATION_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          platform: 'woocommerce',
          userEmail: session.user.email,
          storeUrl,
          credentials: { consumerKey, consumerSecret },
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, message: 'WooCommerce connected successfully' });
  } catch (error) {
    console.error('WooCommerce connect error:', error);
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}
