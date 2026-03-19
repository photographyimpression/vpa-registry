interface WooProduct {
  id: number;
  name: string;
  images: { id: number; src: string; name: string }[];
}

export class WooCommerceClient {
  private baseUrl: string;
  private auth: string;

  constructor(storeUrl: string, consumerKey: string, consumerSecret: string) {
    this.baseUrl = storeUrl.replace(/\/$/, '');
    this.auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  }

  async testConnection(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/wp-json/wc/v3/system_status`, {
      headers: { Authorization: `Basic ${this.auth}` },
    });
    return res.ok;
  }

  async fetchProducts(): Promise<WooProduct[]> {
    const products: WooProduct[] = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `${this.baseUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`,
        { headers: { Authorization: `Basic ${this.auth}` } }
      );
      if (!res.ok) throw new Error(`WooCommerce API error: ${res.status}`);
      const data: WooProduct[] = await res.json();
      if (data.length === 0) break;
      products.push(...data);
      page++;
    }
    return products;
  }

  async updateProductImage(
    productId: number,
    imageId: number,
    newImageUrl: string
  ): Promise<void> {
    const res = await fetch(
      `${this.baseUrl}/wp-json/wc/v3/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          images: [{ id: imageId, src: newImageUrl }],
        }),
      }
    );
    if (!res.ok) throw new Error(`Failed to update product ${productId}: ${res.status}`);
  }
}
