import Papa from 'papaparse';
import { redis } from '@/lib/redis';

export interface CertificateRecord {
    VPA_Tracking_ID: string;
    Cert_Issue_Date: string;
    Manufacturer_Name: string;
    Device_Metadata: string;
    Master_Image_URL: string;
    Product_Name?: string;
    Certified_Image_URL?: string;
}

// ── Cache configuration ──────────────────────────────────────────────────────
// Redis cache: 5 min TTL with stale-while-revalidate pattern.
// In-memory fallback for local dev (single instance only).
const CACHE_TTL_S = 300; // 5 minutes
const CACHE_KEY = 'vpa:certificates:all';

// Per-cert direct storage. Used as the authoritative source when n8n's Sheets
// write fails: as long as Redis has the row, /id/[X] resolves correctly even
// before the canonical Sheets write happens. 30-day TTL leaves a generous
// window for the Sheets row to land or for ops to investigate.
const CERT_KEY_PREFIX = 'vpa:cert:';
const CERT_TTL_S = 30 * 24 * 3600;

let memoryCache: { data: CertificateRecord[]; expiresAt: number } | null = null;

async function fetchAllFromSheets(): Promise<CertificateRecord[]> {
    const url = process.env.GOOGLE_SHEETS_CSV_URL;
    if (!url) return [];

    try {
        const fetchUrl = url.includes('?') ? `${url}&_cb=${Date.now()}` : `${url}?_cb=${Date.now()}`;
        const response = await fetch(fetchUrl, { cache: 'no-store' });

        if (!response.ok) {
            console.error(`[VPA API] Network error: ${response.status} ${response.statusText}`);
            return [];
        }

        const csvText = await response.text();
        const parsed = Papa.parse<CertificateRecord>(csvText, {
            header: true,
            skipEmptyLines: true,
        });

        if (parsed.errors.length > 0) {
            console.error("[VPA API] CSV Parsing errors:", parsed.errors);
        }

        return parsed.data;
    } catch (error) {
        console.error("[VPA API] Critical fetch failure:", error);
        return [];
    }
}

/**
 * Returns ALL certificate records, using a cache layer to avoid
 * re-downloading the full CSV on every request.
 *
 * Cache priority: Redis (shared, multi-instance) → in-memory (dev fallback).
 */
export async function getAllCertificates(): Promise<CertificateRecord[]> {
    // 1. Try Redis cache
    if (redis) {
        try {
            const cached = await redis.get<CertificateRecord[]>(CACHE_KEY);
            if (cached) return cached;
        } catch (err) {
            console.warn('[VPA Cache] Redis read failed, falling through to fetch:', err);
        }
    } else {
        // 2. In-memory fallback (dev only)
        if (memoryCache && Date.now() < memoryCache.expiresAt) {
            return memoryCache.data;
        }
    }

    // 3. Fetch fresh data
    const records = await fetchAllFromSheets();

    // 4. Populate cache
    if (redis) {
        try {
            await redis.set(CACHE_KEY, records, { ex: CACHE_TTL_S });
        } catch (err) {
            console.warn('[VPA Cache] Redis write failed:', err);
        }
    } else {
        memoryCache = { data: records, expiresAt: Date.now() + CACHE_TTL_S * 1000 };
    }

    return records;
}

/**
 * Invalidate the certificate cache. Call after issuing a new certificate
 * so the next read picks up the latest data.
 */
export async function invalidateCertificateCache(): Promise<void> {
    if (redis) {
        try { await redis.del(CACHE_KEY); } catch { /* best-effort */ }
    }
    memoryCache = null;
}

/**
 * Authoritatively record a freshly-issued certificate to Redis so /id/[X]
 * resolves immediately, without waiting on the n8n → Sheets pipeline.
 * Sheets remains the long-term canonical store.
 */
export async function recordCertificate(record: CertificateRecord): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(`${CERT_KEY_PREFIX}${record.VPA_Tracking_ID}`, record, { ex: CERT_TTL_S });
    } catch (err) {
        console.error('[VPA Data] recordCertificate failed:', err);
    }
}

export async function getCertificateData(id: string): Promise<CertificateRecord | null> {
    // 1. Try direct per-cert Redis lookup. This is the fast path for certs
    //    issued by /api/certify whose row hasn't propagated to Sheets yet.
    if (redis) {
        try {
            const direct = await redis.get<CertificateRecord>(`${CERT_KEY_PREFIX}${id}`);
            if (direct) return direct;
        } catch {
            // fall through to Sheets path
        }
    }

    const url = process.env.GOOGLE_SHEETS_CSV_URL;

    if (!url) {
        console.warn("[VPA API] GOOGLE_SHEETS_CSV_URL missing. Using selective fallback mode.");

        if (id === 'DEMO-123' || id.startsWith('VPA-NEW')) {
            return {
                VPA_Tracking_ID: id,
                Cert_Issue_Date: new Date().toISOString().split('T')[0],
                Manufacturer_Name: 'Secure Capture Systems (Mock)',
                Device_Metadata: 'Lens: 50mm f/1.8, ISO: 100, Sensor: Full Frame CMOS',
                Master_Image_URL: 'https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000001.jp2/info.json',
                Product_Name: 'Demo Product',
            };
        }
        return null;
    }

    const records = await getAllCertificates();
    return records.find(r => r.VPA_Tracking_ID === id) || null;
}
