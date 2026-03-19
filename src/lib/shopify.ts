const SHOPIFY_API_VERSION = '2024-01';

interface ShopifyProduct {
  id: number;
  title: string;
  images: { id: number; src: string; position: number }[];
}

export async function getShopifyAccessToken(
  shop: string,
  code: string
): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });
  if (!res.ok) throw new Error(`Shopify OAuth failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export function getShopifyAuthUrl(shop: string, redirectUri: string): string {
  const scopes = 'read_products,write_products';
  return `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function fetchShopifyProducts(
  shop: string,
  accessToken: string
): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = [];
  let url: string | null = `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=250&fields=id,title,images`;

  while (url) {
    const res = await fetch(url, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
    const data = await res.json();
    products.push(...data.products);

    const linkHeader = res.headers.get('link');
    const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }
  return products;
}

export async function updateShopifyProductImage(
  shop: string,
  accessToken: string,
  productId: number,
  imageId: number,
  newImageBase64: string
): Promise<void> {
  const res = await fetch(
    `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${productId}/images/${imageId}.json`,
    {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: { id: imageId, attachment: newImageBase64 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update image ${imageId}: ${res.status}`);
}
