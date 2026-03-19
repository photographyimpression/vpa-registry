import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getShopifyAuthUrl } from '@/lib/shopify';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop || !/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    return NextResponse.json({ error: 'Invalid shop domain. Use your-store.myshopify.com' }, { status: 400 });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://vparegistry.com'}/api/integrations/shopify/callback`;
  const authUrl = getShopifyAuthUrl(shop, redirectUri);

  return NextResponse.redirect(authUrl);
}
