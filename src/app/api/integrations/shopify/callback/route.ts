import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getShopifyAccessToken } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const shop = req.nextUrl.searchParams.get('shop');
  const code = req.nextUrl.searchParams.get('code');

  if (!shop || !code) {
    return NextResponse.json({ error: 'Missing shop or code' }, { status: 400 });
  }

  try {
    const accessToken = await getShopifyAccessToken(shop, code);

    // Store integration in n8n/database
    const webhookUrl = process.env.N8N_INTEGRATION_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          platform: 'shopify',
          userEmail: session.user.email,
          storeUrl: `https://${shop}`,
          credentials: { accessToken, shop },
        }),
      }).catch(() => {});
    }

    // Redirect to integrations dashboard
    return NextResponse.redirect(
      new URL('/dashboard/integrations?connected=shopify', req.url)
    );
  } catch (error) {
    console.error('Shopify OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=shopify_auth_failed', req.url)
    );
  }
}
