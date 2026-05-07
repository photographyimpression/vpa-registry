# VPA Registry

Cryptographic product authentication platform. Issues tamper-proof digital certificates verified via QR code scan.

- **Production:** [vparegistry.com](https://vparegistry.com)
- **Stack:** Next.js 16 (App Router) · TypeScript · NextAuth · Stripe · Sharp · Upstash Redis · n8n

## Quick start (local dev)

```bash
cp env.example .env.local      # then fill in the values
npm install
npm run dev                    # http://localhost:3000
```

For local-only work most env vars can be left blank — env validation only fails the boot in `NODE_ENV=production`.

## Going live

There's a single click-by-click checklist in [GO-LIVE.md](./GO-LIVE.md). Start there.

The short version:

1. Set 18 env vars on your host (`AUTH_SECRET`, Google OAuth, Google Sheets CSV, n8n URL, Upstash Redis, Stripe keys, Stripe price IDs, watermark secret, `NEXT_PUBLIC_APP_URL`).
2. `npm run setup:stripe` — creates products, prices, and the `MONTREAL90` coupon.
3. Activate the n8n workflow at [`n8n-workflow/vpa-certification-workflow.json`](./n8n-workflow/vpa-certification-workflow.json) and copy its webhook URL into env.
4. Publish the registry Google Sheet as CSV and copy that URL into env.
5. Smoke-test: sign up → buy → upload → issue certificate → scan QR.

If any required env var is missing or still set to a placeholder, the app will refuse to start in production — you'll see a list of what's missing in the boot logs.

## Architecture

| Concern              | Where                                                    |
| -------------------- | -------------------------------------------------------- |
| Auth                 | NextAuth + Google OAuth ([`src/auth.ts`](./src/auth.ts)) |
| Billing              | Stripe Checkout + webhooks ([`src/app/api/stripe/`](./src/app/api/stripe/)) |
| Cert issuance        | [`src/app/api/certify/route.ts`](./src/app/api/certify/route.ts) (validates → calls n8n for AI check → watermarks locally) |
| Watermarking         | [`src/app/api/watermark/route.ts`](./src/app/api/watermark/route.ts) (Sharp + QR + banner template) |
| Registry lookup      | [`src/lib/data.ts`](./src/lib/data.ts) (Google Sheets CSV, cached in Upstash) |
| Rate limiting        | Upstash sliding window, 60 req/min per user             |
| Boot-time env check  | [`src/lib/env-check.ts`](./src/lib/env-check.ts) (called from [`instrumentation.ts`](./instrumentation.ts)) |

## Deployment

The `Dockerfile` produces a standalone Next.js container suitable for Cloud Run, Fly.io, Railway, etc.

Recommended Cloud Run flags:

```bash
--memory=2Gi           # Sharp image processing needs headroom
--min-instances=1      # avoid cold starts on user uploads
--max-instances=10
--concurrency=80
```

## Operations

- **Pipeline test suite:** `npx tsx scripts/test-pipeline.ts` — exercises upload, AI detection, rate limiting, watermarking.
- **Stripe setup (idempotent):** `npm run setup:stripe` — re-run any time; it won't duplicate.
- **Email warmup SOP:** [`docs/EMAIL-WARMING-SOP.md`](./docs/EMAIL-WARMING-SOP.md).
