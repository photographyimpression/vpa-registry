# VPA Registry — Go-Live Checklist

This is the only doc you need to take VPA Registry from "code is ready" to "live and accepting paid customers." Each step has a direct link and an acceptance test. Total time: ~60–90 minutes.

The app will **refuse to boot in production** if any required env var is missing or still set to a placeholder. The boot log will tell you exactly what's missing — no silent half-broken state.

---

## 0. Prep — pick your hosting (5 min)

Where will the Next.js app run? The Dockerfile is generic; common targets:

- **Google Cloud Run** (matches `env.example` notes — recommended)
- **Fly.io** / **Railway** / **Render** — also works, same env vars
- **Vercel** — also works, but rate-limit assumptions assume long-lived instances

Whatever you pick, you need a place to set environment variables. Have that dashboard open in a tab.

**Acceptance:** you can reach the env-vars page on your host.

---

## 1. NextAuth secret + URL (2 min)

Generate the secret:

```bash
openssl rand -base64 32
```

Set on host:

```
AUTH_SECRET=<paste-the-output>
AUTH_URL=https://vparegistry.com
NEXT_PUBLIC_APP_URL=https://vparegistry.com
```

**Acceptance:** all three set, no quotes.

---

## 2. Google OAuth (5 min)

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create OAuth 2.0 Client ID → **Web application**.
3. Authorized redirect URI: `https://vparegistry.com/api/auth/callback/google`
4. Copy Client ID + Secret.

Set on host:

```
GOOGLE_CLIENT_ID=<the-client-id>
GOOGLE_CLIENT_SECRET=<the-secret>
```

**Acceptance:** the OAuth client shows up in the Google Cloud Console list.

---

## 3. Google Sheets registry (5 min)

The registry lookup reads from a published Google Sheet (CSV).

1. Open your registry sheet (the one with VPA IDs, manufacturer names, etc.).
2. Required columns: `VPA_Tracking_ID | Cert_Issue_Date | Manufacturer_Name | Device_Metadata | Master_Image_URL | Product_Name | Certified_Image_URL`
3. **File → Share → Publish to web → Entire document → CSV → Publish**.
4. Copy the URL (ends in `output=csv`).

Set on host:

```
GOOGLE_SHEETS_CSV_URL=<the-published-csv-url>
```

**Acceptance:** opening the URL in a private tab downloads a CSV.

---

## 4. Upstash Redis (3 min)

Without this, rate limiting falls back to in-process state — won't survive a deploy and won't scale past one instance.

1. Sign up at [console.upstash.com](https://console.upstash.com) (free tier is fine to start).
2. **Create Database** → Global → name it `vpa-registry`.
3. On the database page, scroll to **REST API** → copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

Set on host:

```
UPSTASH_REDIS_REST_URL=<the-rest-url>
UPSTASH_REDIS_REST_TOKEN=<the-rest-token>
```

**Acceptance:** the Upstash dashboard shows the database as `Active`.

---

## 5. n8n certification workflow (10 min)

This is the AI authenticity check. Without it, certificates are issued without any auth check — defeats the product.

1. Open your n8n instance (per `CLAUDE.md`, this is on Google Cloud, separate from the OVH n8n).
2. **Workflows → Import from File** → choose [`n8n-workflow/vpa-certification-workflow.json`](./n8n-workflow/vpa-certification-workflow.json).
3. Open the imported workflow → fill in any credential placeholders (Claude Vision, Google Drive, Google Sheets).
4. **Activate** the workflow (top-right toggle).
5. Click the **"Receive Certification Request"** node → copy the production webhook URL.

Generate a watermark secret:

```bash
openssl rand -base64 32
```

In n8n, edit the HTTP Request node that calls `/api/watermark` → add header `X-VPA-Watermark-Secret: <your-secret>`.

Set on host:

```
N8N_CERTIFICATION_WEBHOOK_URL=<the-webhook-url>
WATERMARK_SECRET=<the-watermark-secret>
```

**Acceptance:** the n8n workflow shows as **Active**, and the test execution from the n8n editor succeeds.

---

## 6. Stripe — keys, products, prices, coupon (10 min)

### 6a. Get the keys

1. Open [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys).
2. Copy the **Live secret key** (`sk_live_...`) and **Live publishable key** (`pk_live_...`).

Set on host:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 6b. Auto-create products, prices, MONTREAL90 coupon

Run locally (the script reads `STRIPE_SECRET_KEY` from the env, hits Stripe's API, prints the price IDs):

```bash
STRIPE_SECRET_KEY=sk_live_... npm run setup:stripe
```

The script is idempotent — safe to re-run. It creates:

- 3 products (Starter, Professional, Business)
- 6 prices (monthly + annual for each)
- 1 coupon `MONTREAL90` (90% off, forever) + matching promo code

It prints six env-var lines. Paste them into the host:

```
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_ANNUAL_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_...
```

### 6c. Webhook

1. [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks) → **Add endpoint**.
2. URL: `https://vparegistry.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
4. Click into the new endpoint → **Reveal** signing secret → copy it.

Set on host:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Acceptance:**
- `npm run setup:stripe` printed all six price IDs.
- The Stripe Dashboard shows `MONTREAL90` under **Products → Coupons**.
- The webhook endpoint shows up under **Webhooks**.

---

## 7. Optional but recommended (5 min)

```
N8N_STRIPE_WEBHOOK_URL=<n8n url for Stripe-event automations, optional>
N8N_REGISTER_WEBHOOK_URL=<n8n url for partner-access requests, optional>
N8N_RECORD_WEBHOOK_URL=<n8n url for fire-and-forget cert recording, optional>
AI_DETECTION_MODE=warn
```

These aren't required to boot, but without them: subscription notifications won't go anywhere, partner sign-ups only land in stdout, and certificates won't be persisted to Sheets.

---

## 8. Deploy + smoke test (10 min)

1. **Deploy** the Next.js app to your host. The boot log should print `[VPA Env] All required env vars present.`
2. If it prints a list of failures instead, fix them and redeploy. The app will not start until they're all resolved.

Run this end-to-end smoke test in a private browser window:

| Step                                                       | Expected                                                |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| Visit `https://vparegistry.com`                            | Landing page loads, no console errors                   |
| Click **Sign in** → Google OAuth                           | Redirects back signed in                                |
| Visit `/pricing` → click **Subscribe** on Starter          | Stripe Checkout opens with Starter Monthly              |
| Apply promo code `MONTREAL90`                              | Total drops by 90%                                      |
| Use Stripe test card `4242 4242 4242 4242` (test mode) or a real card (live mode) | Payment succeeds                       |
| Land on `/dashboard?subscribed=1&plan=starter`             | Dashboard shows Starter plan                            |
| Upload a product photo                                     | Certificate issued, watermarked image shown             |
| Scan the QR code with your phone                           | `/id/VPA-XXXXXX-NNNN` page loads with correct details   |

If any step fails, the issue is named in either the boot log (env), Cloud Run logs (request), or the n8n execution log (AI/sheets).

---

## You're live

After the smoke test passes, the system is live. Drive traffic to `/register` and `/pricing`. Monitor:

- Stripe Dashboard for subscriptions
- Upstash Dashboard for rate-limit hits
- n8n executions for AI rejection patterns
- Cloud Run logs for any `[VPA ...]` warnings

If something breaks: the boot log + Cloud Run request logs + n8n execution log are the three places to look. Each is labeled with `[VPA ...]` prefixes for grep-ability.
