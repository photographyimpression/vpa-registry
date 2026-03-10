# VPA Registry — Dedicated n8n on Google Cloud Run

A fully isolated n8n instance running on Google Cloud, dedicated exclusively to the VPA Registry certification pipeline. Separated from personal automations for security, scalability, and professional isolation.

## Architecture

```
Google Cloud Project: vpa-registry
├── Cloud Run:  vpa-registry     → vparegistry.com       (Next.js app)
├── Cloud Run:  vpa-n8n          → n8n.vparegistry.com   (n8n automation)
└── Cloud SQL:  vpa-n8n-db       (PostgreSQL 15)
```

## Specs

| Resource | Configuration |
|---|---|
| Cloud Run: vpa-n8n | 2 vCPU / 2 GB RAM, min 1 instance |
| Cloud SQL | PostgreSQL 15, db-g1-small, 10 GB SSD |
| Authentication | HTTP Basic Auth (username + password) |
| Data persistence | Cloud SQL (workflows, credentials, executions) |
| Secrets | Google Secret Manager |

## One-Time Setup — Run This Once

```bash
# 1. Make sure you're pointed at the right GCP project
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Make the script executable
chmod +x n8n-cloud/setup-gcp.sh

# 3. Run it (takes ~5 minutes for Cloud SQL provisioning)
./n8n-cloud/setup-gcp.sh
```

The script will print your **admin username and password** at the end.
**Save that password** — it's generated once and stored in Secret Manager.

---

## After Setup — 4 Steps to Go Fully Live

### 1. Map the Domain

In your DNS provider (wherever `vparegistry.com` is managed):

```
Type  : CNAME
Name  : n8n
Value : ghs.googlehosted.com
TTL   : 3600
```

Then register the domain with Cloud Run:
```bash
gcloud run domain-mappings create \
  --service=vpa-n8n \
  --domain=n8n.vparegistry.com \
  --region=us-central1
```

### 2. Import the Workflow

1. Open `https://n8n.vparegistry.com` (or the Cloud Run URL before domain maps)
2. Log in with the credentials printed by the setup script
3. Go to **Workflows → Import from file**
4. Select: `n8n-workflow/vpa-certification-workflow.json`
5. Configure credentials inside the workflow:
   - **Google Drive** node → Add Google credential
   - **Google Sheets** node → Same Google credential + paste your Sheet ID
6. Click **Activate**
7. Copy the webhook URL from the **"📥 Receive Certification Request"** node

### 3. Wire the Webhook URL into the Main App

In [Cloud Run Console → vpa-registry → Edit → Variables](https://console.cloud.google.com/run):

```
N8N_CERTIFICATION_WEBHOOK_URL = https://n8n.vparegistry.com/webhook/vpa-certify
```

### 4. Test It End-to-End

1. Log into `vparegistry.com/login`
2. Go to **Dashboard → Issue Certificate**
3. Upload a product photo, fill in details, click **Generate**
4. ✅ You should get a real VPA ID + certified image with QR code
5. In n8n, click **Executions** — you'll see the workflow execution with every node's input/output for easy debugging

---

## Updating n8n Later

To redeploy with a newer n8n version:

```bash
gcloud builds submit --config=n8n-cloud/cloudbuild.yaml
```

Or trigger it from Cloud Build in the GCP Console.

---

## Troubleshooting

| Problem | Where to Look |
|---|---|
| Webhook not receiving requests | Cloud Run Logs → vpa-n8n |
| Workflow stopped at a node | n8n → Executions → click the failed run |
| Database connection error | n8n Logs → check `DB_POSTGRESDB_HOST` |
| Secret not found | GCP → Secret Manager → verify secret names |
| Domain not resolving | DNS propagation can take up to 24h |
