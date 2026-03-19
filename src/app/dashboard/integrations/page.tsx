"use client";

import { useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingBag, Globe, Code, CheckCircle, AlertCircle, Loader2, Copy, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

function IntegrationsContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const connected = searchParams.get('connected');
  const error = searchParams.get('error');

  const [shopDomain, setShopDomain] = useState('');
  const [wooUrl, setWooUrl] = useState('');
  const [wooKey, setWooKey] = useState('');
  const [wooSecret, setWooSecret] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    connected ? { type: 'success', text: `${connected} connected successfully!` } :
    error ? { type: 'error', text: 'Connection failed. Please try again.' } : null
  );
  const [copied, setCopied] = useState(false);

  const vpaId = 'VPA-' + (session?.user?.email?.slice(0, 6).toUpperCase() || 'XXXXXX');
  const snippet = `<script src="https://vparegistry.com/badge.js" data-vpa-id="${vpaId}"></script>`;

  async function connectShopify() {
    if (!shopDomain) return;
    const domain = shopDomain.includes('.myshopify.com') ? shopDomain : `${shopDomain}.myshopify.com`;
    setLoading('shopify');
    router.push(`/api/integrations/shopify/auth?shop=${domain}`);
  }

  async function connectWoo() {
    if (!wooUrl || !wooKey || !wooSecret) return;
    setLoading('woocommerce');
    setMessage(null);
    try {
      const res = await fetch('/api/integrations/woocommerce/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl: wooUrl, consumerKey: wooKey, consumerSecret: wooSecret }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'WooCommerce connected successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Connection failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(null);
    }
  }

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Integrations</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>Connect your website to automatically display VPA badges on product images.</p>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Shopify */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <ShoppingBag size={24} color="#96bf48" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Shopify</h2>
        </div>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          One-click connect. We&apos;ll automatically add VPA badges to all your product images.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="your-store.myshopify.com"
            value={shopDomain}
            onChange={e => setShopDomain(e.target.value)}
            style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
          />
          <button
            onClick={connectShopify}
            disabled={!shopDomain || loading === 'shopify'}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none',
              background: '#96bf48', color: '#fff', fontWeight: 600, cursor: 'pointer',
              opacity: !shopDomain || loading === 'shopify' ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {loading === 'shopify' ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Connect
          </button>
        </div>
      </div>

      {/* WooCommerce */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Globe size={24} color="#7f54b3" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>WooCommerce</h2>
        </div>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Enter your WooCommerce REST API credentials. Find them in WooCommerce → Settings → Advanced → REST API.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text"
            placeholder="https://your-store.com"
            value={wooUrl}
            onChange={e => setWooUrl(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="Consumer Key (ck_...)"
              value={wooKey}
              onChange={e => setWooKey(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
            />
            <input
              type="password"
              placeholder="Consumer Secret (cs_...)"
              value={wooSecret}
              onChange={e => setWooSecret(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem' }}
            />
          </div>
          <button
            onClick={connectWoo}
            disabled={!wooUrl || !wooKey || !wooSecret || loading === 'woocommerce'}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none',
              background: '#7f54b3', color: '#fff', fontWeight: 600, cursor: 'pointer',
              opacity: (!wooUrl || !wooKey || !wooSecret || loading === 'woocommerce') ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start',
            }}
          >
            {loading === 'woocommerce' ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
            Connect
          </button>
        </div>
      </div>

      {/* JS Snippet */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Code size={24} color="#d4a843" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Any Website (JS Snippet)</h2>
        </div>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Add this script tag to your website. It automatically overlays VPA badges on product images. Remove the tag to revert.
        </p>
        <div style={{
          background: '#1a1a1a', borderRadius: '8px', padding: '1rem',
          fontFamily: 'monospace', fontSize: '0.8rem', color: '#e5e7eb',
          position: 'relative', overflowX: 'auto',
        }}>
          <code>{snippet}</code>
          <button
            onClick={copySnippet}
            style={{
              position: 'absolute', top: '0.5rem', right: '0.5rem',
              background: '#333', border: 'none', borderRadius: '4px',
              padding: '0.25rem 0.5rem', color: '#e5e7eb', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
            }}
          >
            <Copy size={12} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p style={{ color: '#999', fontSize: '0.75rem', marginTop: '0.75rem' }}>
          Optional attributes: <code>data-selector</code> (CSS selector for images), <code>data-position</code> (top-left, top-right, bottom-left, bottom-right)
        </p>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem' }}>Loading...</div>}>
      <IntegrationsContent />
    </Suspense>
  );
}
