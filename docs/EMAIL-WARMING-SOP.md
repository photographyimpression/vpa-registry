# Email Warming SOP — VPA Registry Outreach

**Purpose:** Step-by-step process for setting up, warming, and graduating to active cold outreach for VPA Registry.
**Owner:** Moshe Lerner
**Last Updated:** March 2026

---

## Why Email Warming Matters

When you send emails from a brand-new domain or mailbox, inbox providers (Gmail, Outlook, etc.) have zero trust data on you. Sending cold outreach immediately = near-certain spam folder.

Warming builds that trust gradually by simulating real email activity before you start sending to prospects.

**Without warming:** ~5% inbox rate
**With warming:** ~85–95% inbox rate

---

## Overview: Two-Phase Strategy

| Phase | Tool | Cost | Duration | Purpose |
|-------|------|------|----------|---------|
| **Phase 1 — Warm** | Mailflow.io (free) | $0 | Weeks 1–4 | Build sender reputation |
| **Phase 2 — Send** | Instantly.ai | ~$37/mo | Ongoing | Cold outreach + continued warming |

Start Phase 1 immediately. Do not send any cold outreach until Phase 1 is complete.

---

## Step 1 — Buy the Sending Subdomain

Use a **subdomain** for outreach — never send cold email from your main domain (`vparegistry.com`). If anything goes wrong, your main domain stays clean.

**Target subdomain:** `outreach.vparegistry.com`

> Where to buy: You can add this as a subdomain through your existing DNS provider (wherever vparegistry.com is registered). No separate purchase needed — just a DNS configuration.

---

## Step 2 — Set Up the Sending Mailbox

1. Go to [workspace.google.com](https://workspace.google.com) — Business Starter plan (~$6/mo)
2. Add the account: `hello@outreach.vparegistry.com` (or `moshe@outreach.vparegistry.com`)
3. Keep this mailbox **separate** from your main business email

---

## Step 3 — Configure DNS Records

Log in to your DNS provider and add these records for `outreach.vparegistry.com`:

### SPF Record
```
Type:  TXT
Name:  outreach.vparegistry.com
Value: v=spf1 include:_spf.google.com ~all
TTL:   3600
```

### DKIM Record
1. In Google Workspace Admin → Apps → Google Workspace → Gmail → Authenticate email
2. Generate DKIM key (2048-bit)
3. Google will give you a TXT record to add — copy it exactly into DNS:
```
Type:  TXT
Name:  google._domainkey.outreach.vparegistry.com
Value: v=DKIM1; k=rsa; p=<YOUR KEY FROM GOOGLE>
TTL:   3600
```

### DMARC Record (start lenient, tighten over time)
```
Type:  TXT
Name:  _dmarc.outreach.vparegistry.com
Value: v=DMARC1; p=none; rua=mailto:hello@vparegistry.com
TTL:   3600
```

### DMARC Hardening Timeline
| Week | Policy | Action |
|------|--------|--------|
| Week 1–2 | `p=none` | Monitor only — no emails blocked |
| Week 3–4 | `p=quarantine` | Suspicious emails go to spam |
| Week 5+ | `p=reject` | Unauthorized emails fully blocked |

> **Verify DNS:** Use [MXToolbox](https://mxtoolbox.com/SuperTool.aspx) to confirm SPF, DKIM, and DMARC are all passing before proceeding.

---

## Step 4 — Set Up Mailflow.io (Free Warm-Up)

1. Go to [mailflow.io](https://mailflow.io) and create a free account
2. Connect your `hello@outreach.vparegistry.com` Google Workspace mailbox via OAuth
3. Enable warm-up — Mailflow automatically sends and replies to warm-up emails within their network
4. Free plan sends **5 warm-up emails/day** — slow but free

> **Note:** Mailflow.io is warm-up only. It does not send your actual outreach campaigns.

### What Mailflow Does Automatically
- Sends emails from your mailbox to other inboxes in their network
- Those inboxes automatically open and reply
- Marks any emails that land in spam as "not spam"
- Gradually builds your sender score over 4 weeks

---

## Step 5 — The 4-Week Warm-Up Ramp

Even with Mailflow on free (5/day), you are building reputation. In parallel, you can do **manual warm-up** to accelerate:

| Week | Mailflow Auto | Manual (optional) | Total/day |
|------|--------------|-------------------|-----------|
| Week 1 | 5 | Send 5–10 real emails to contacts, ask them to reply | ~10–15 |
| Week 2 | 5 | Send 15–20 real emails (newsletters, colleagues) | ~20–25 |
| Week 3 | 5 | Begin sending to 1–2 early prospects as a test | ~25–30 |
| Week 4 | 5 | Ramp up carefully, monitor open rates | ~30–50 |

**Manual warm-up tips:**
- Email friends, family, past colleagues from the new address
- Subscribe to newsletters you actually read (opens count)
- Ask recipients to reply — two-way conversation is the strongest signal
- Never send from this mailbox to a purchased list

---

## Step 6 — Graduation Check (End of Week 4)

Before sending any real cold outreach, verify all of the following:

- [ ] SPF passing ✅ (check MXToolbox)
- [ ] DKIM passing ✅ (check MXToolbox)
- [ ] DMARC policy updated to `p=quarantine` or `p=reject` ✅
- [ ] Domain not on any blacklists ✅ (check [MXToolbox Blacklist Check](https://mxtoolbox.com/blacklists.aspx))
- [ ] Send a test email to [mail-tester.com](https://www.mail-tester.com) → score should be 8/10 or higher ✅
- [ ] 4 weeks have passed since warm-up started ✅

---

## Step 7 — Upgrade to Instantly.ai for Outreach

Once graduation check passes, sign up for [Instantly.ai](https://instantly.ai) (~$37/mo).

**Why switch?**
- Includes warm-up AND cold outreach sending in one platform
- Can manage sending campaigns, follow-up sequences, open/click tracking
- Replaces Mailflow.io (cancel free account or keep for monitoring)

**Setup in Instantly:**
1. Import your `hello@outreach.vparegistry.com` SMTP/IMAP credentials
2. Enable Instantly's warm-up (in addition to your existing reputation)
3. Import your Montreal prospect list (from `VPA_Montreal_Target_List.xlsx`)
4. Load your cold email template (from `VPA_Marketing_Copy_Kit.md`)
5. Set daily send limit: **start at 20/day, scale by doubling every 3 days**

### Cold Outreach Scaling Protocol
```
Day 1:   20 emails → monitor
Day 4:   40 emails → if no bounce spikes, continue
Day 7:   80 emails → check open rates (target: >30%)
Day 10: 160 emails → if healthy, continue
Day 14: All Montreal jewelry (target: ~49 businesses)
```

---

## Step 8 — Post-Signup Email Automation (Nurture Sequence)

This is separate from cold outreach — this fires when someone **signs up** on vparegistry.com.

**Tool:** Brevo (free up to 300 emails/day) or Mailchimp (free up to 500 contacts)

**Sequence:** 5 emails already written in `email-sequence.html`

| Email | Timing | Subject |
|-------|--------|---------|
| Email 1 | Day 0 (immediately) | Welcome + next steps |
| Email 2 | Day 2 | How VPA badges work |
| Email 3 | Day 5 | Case study / social proof |
| Email 4 | Day 10 | Upgrade nudge (FOMO) |
| Email 5 | Day 21 | Final push / personal note |

**Setup steps:**
1. Create Brevo account at [brevo.com](https://brevo.com)
2. Create automation: trigger = new signup event (via API or Zapier)
3. Load email sequence from `email-sequence.html`
4. Set timing as above
5. Test with your own email address before going live

> **Sending domain for nurture:** Use `mail.vparegistry.com` (separate from outreach subdomain). Set up SPF/DKIM the same way.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Emails landing in spam | DNS not set up / warming too short | Verify SPF/DKIM/DMARC, extend warming |
| Low open rates (<20%) | Subject lines / sender name | A/B test subject lines in Instantly |
| High bounce rate (>5%) | Bad email list | Verify list with ZeroBounce before sending |
| Domain blacklisted | Sent too fast | Reduce daily volume, check MXToolbox blacklist |
| DKIM failing | Key not propagated | Wait 24–48 hours for DNS propagation |

---

## Key Tools & Links

| Tool | Purpose | Cost | Link |
|------|---------|------|------|
| Mailflow.io | Email warm-up (Phase 1) | Free | mailflow.io |
| Instantly.ai | Warm-up + cold outreach (Phase 2) | ~$37/mo | instantly.ai |
| Brevo | Post-signup nurture automation | Free tier | brevo.com |
| MXToolbox | DNS verification + blacklist check | Free | mxtoolbox.com |
| Mail-Tester | Spam score test | Free | mail-tester.com |
| ZeroBounce | Email list verification | Pay-per-use | zerobounce.net |
| Google Workspace | Sending mailbox | ~$6/mo | workspace.google.com |

---

## Quick Reference: DNS Records Summary

```
outreach.vparegistry.com  TXT  v=spf1 include:_spf.google.com ~all
google._domainkey.outreach.vparegistry.com  TXT  v=DKIM1; k=rsa; p=<KEY>
_dmarc.outreach.vparegistry.com  TXT  v=DMARC1; p=none; rua=mailto:hello@vparegistry.com
```

---

---

## Appendix — Self-Hosted Setup on OVH (100 Subdomains Strategy)

### Why 100 Subdomains Instead of 100 Emails on One Subdomain

Each subdomain has its own independent sender reputation. If one gets flagged or blacklisted, the other 99 keep working. This is called **domain rotation** — the strategy used by serious email senders at scale.

```
❌ Bad:  warm1@outreach.vparegistry.com ... warm100@outreach.vparegistry.com
         → One blacklisting event = all 100 gone

✅ Good: hello@mail1.vparegistry.com ... hello@mail100.vparegistry.com
         → One blacklisting event = 1 gone, 99 still running
```

**Total cost: $0 extra** (OVH VPS already paid, Cloudflare free, docker-mailserver open source, Mailflow.io free supports exactly 100 mailboxes)

---

### Infrastructure Overview

```
Cloudflare DNS (already managing vparegistry.com)
  └── mail1–mail100.vparegistry.com → OVH server IP (A records)
  └── MX, SPF, DMARC, DKIM records × 100

OVH VPS
  └── docker-mailserver (Docker container, coexists with existing services)
       └── 100 domains configured
       └── hello@mail1 through hello@mail100

Mailflow.io (free tier)
  └── All 100 mailboxes connected via IMAP/SMTP
  └── 5 warm-up emails/day × 100 mailboxes = 500 total/day
```

---

### Setup Scripts (in /scripts/email-setup/)

| Script | What It Does | Where to Run |
|--------|-------------|-------------|
| `01-cloudflare-dns.sh` | Creates 100× A, MX, SPF, DMARC records via Cloudflare API | Your Mac |
| `02-docker-compose.yml` | Deploys docker-mailserver on OVH | OVH server |
| `mailserver.env` | Configuration for docker-mailserver | OVH server |
| `03-create-accounts.sh` | Creates all 100 email accounts | OVH server |
| `04-generate-dkim.sh` | Generates DKIM keys + uploads to Cloudflare | OVH server |

---

### Step-by-Step Execution

#### Prerequisites — Credentials You Need
- **OVH server IP** (find in OVH control panel)
- **SSH access** to OVH server (username + password or SSH key)
- **Cloudflare API Token**: Dashboard → My Profile → API Tokens → Create Token → "Edit zone DNS" template → select vparegistry.com
- **Cloudflare Zone ID**: Dashboard → vparegistry.com → Overview → right sidebar

#### Step A — Check Port 25 on OVH Server
SSH into your OVH server and run:
```bash
nc -zv smtp.gmail.com 25
```
- **Connected** → Port 25 is open, proceed
- **Refused/timeout** → Contact OVH support to request port 25 unblocking (usually approved within 24h for VPS plans)

Also check for port conflicts with existing services:
```bash
sudo ss -tlnp | grep -E ':25|:587|:993'
```
If any are in use, those services must be reconfigured before proceeding.

#### Step B — Run DNS Script (from your Mac)
```bash
cd /path/to/vpa-registry/scripts/email-setup

export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"
export OVH_SERVER_IP="your_ovh_ip_here"

bash 01-cloudflare-dns.sh
```
This creates 400 DNS records (100 × A + MX + SPF + DMARC). Takes ~5 minutes.

#### Step C — Deploy Mail Server on OVH
SSH into OVH server, copy the docker-compose files, then:
```bash
# Install Docker if not already installed
curl -fsSL https://get.docker.com | sh

# Get a TLS certificate for the mail hostname
sudo apt install certbot -y
sudo certbot certonly --standalone -d mail.vparegistry.com

# Start the mail server
docker compose -f 02-docker-compose.yml up -d

# Wait 90 seconds for initialization
sleep 90
docker logs mailserver --tail 20

# Fix mail-data permissions so docker-mailserver (uid 5000) can write
# Without this, account creation and DKIM generation will silently fail
sudo chown -R 5000:5000 /opt/mailserver/mail-data/
```

#### Step D — Create 100 Email Accounts (on OVH server)
```bash
bash 03-create-accounts.sh
```
Output: `email-credentials.csv` with all 100 email/password pairs. Keep this file secure — never commit it to git.

#### Step E — Generate & Upload DKIM Keys (on OVH server)
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ZONE_ID="your_zone_id_here"

bash 04-generate-dkim.sh
```
Wait 24–48 hours for DNS propagation after this step.

#### Step F — Verify Everything Works
Test one mailbox before connecting all 100:
1. Go to [mail-tester.com](https://www.mail-tester.com) — get a test address
2. Send an email from `hello@mail1.vparegistry.com` to that address
3. Score should be **8/10 or higher**
4. Check [MXToolbox Blacklist](https://mxtoolbox.com/blacklists.aspx) — OVH IP should be clean

#### Step G — Connect All 100 to Mailflow.io
1. Go to [mailflow.io](https://mailflow.io) and log in
2. Click "Add mailbox" for each account:
   - **IMAP Host:** your OVH server IP | Port: 993 | SSL: yes
   - **SMTP Host:** your OVH server IP | Port: 587 | TLS: yes
   - **Username:** hello@mailN.vparegistry.com
   - **Password:** from email-credentials.csv
3. Enable warm-up for each mailbox
4. Repeat × 100 (takes ~1 hour — do in batches)

---

### DMARC Hardening Schedule (per subdomain)

| Week | Policy | Action |
|------|--------|--------|
| 1–4 | `p=none` | Monitor only — set by script automatically |
| 5–6 | `p=quarantine` | Update via Cloudflare dashboard or re-run script with updated value |
| 7+ | `p=reject` | Full enforcement |

---

### Credentials Security
- `email-credentials.csv` is excluded from git via `.gitignore`
- Store a backup copy in your password manager (1Password, Bitwarden, etc.)
- The OVH server itself holds the actual mailboxes — credentials file is just your reference

---

*This SOP should be updated each time the outreach strategy evolves.*
