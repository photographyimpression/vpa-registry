#!/usr/bin/env bash
# =============================================================================
# VPA Registry — Dedicated n8n on Google Cloud Run
# One-time setup script. Run this once from your local machine.
# =============================================================================
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="vpa-n8n"
SQL_INSTANCE="vpa-n8n-db"
SQL_DB="n8n"
SQL_USER="n8n"
N8N_ADMIN_USER="admin"
N8N_DOMAIN="n8n.vparegistry.com"      # Change if using a different subdomain
N8N_IMAGE="n8nio/n8n:latest"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VPA Registry — Dedicated n8n Deployment"
echo "  Project : $PROJECT_ID"
echo "  Region  : $REGION"
echo "  Domain  : $N8N_DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Step 1: Enable required GCP APIs ──────────────────────────────────────────
echo ""
echo "▶ Step 1/7 — Enabling GCP APIs..."
gcloud services enable \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project="$PROJECT_ID"
echo "  ✓ APIs enabled"

# ── Step 2: Create a dedicated service account for n8n ────────────────────────
echo ""
echo "▶ Step 2/7 — Creating n8n service account..."
SA_NAME="vpa-n8n-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="VPA Registry n8n Service Account" \
  --project="$PROJECT_ID" 2>/dev/null || echo "  (Service account already exists, continuing...)"

# Grant Cloud SQL client access
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudsql.client" \
  --quiet

# Grant Secret Manager accessor
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

echo "  ✓ Service account ready: $SA_EMAIL"

# ── Step 3: Create Cloud SQL PostgreSQL instance ───────────────────────────────
echo ""
echo "▶ Step 3/7 — Creating Cloud SQL PostgreSQL 15 instance..."
echo "  (This takes 3–5 minutes — please wait...)"

if gcloud sql instances describe "$SQL_INSTANCE" --project="$PROJECT_ID" &>/dev/null; then
  echo "  (Cloud SQL instance already exists, skipping creation)"
else
  gcloud sql instances create "$SQL_INSTANCE" \
    --database-version=POSTGRES_15 \
    --tier=db-g1-small \
    --region="$REGION" \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --project="$PROJECT_ID"
  echo "  ✓ Cloud SQL instance created"
fi

# Create database
gcloud sql databases create "$SQL_DB" \
  --instance="$SQL_INSTANCE" \
  --project="$PROJECT_ID" 2>/dev/null || echo "  (Database already exists)"

# Generate and set database password
SQL_PASSWORD=$(openssl rand -base64 24 | tr -d '=/+' | head -c 28)
gcloud sql users create "$SQL_USER" \
  --instance="$SQL_INSTANCE" \
  --password="$SQL_PASSWORD" \
  --project="$PROJECT_ID" 2>/dev/null || \
  gcloud sql users set-password "$SQL_USER" \
    --instance="$SQL_INSTANCE" \
    --password="$SQL_PASSWORD" \
    --project="$PROJECT_ID"

echo "  ✓ PostgreSQL database and user ready"

# ── Step 4: Generate secrets and store in Secret Manager ──────────────────────
echo ""
echo "▶ Step 4/7 — Storing secrets in Secret Manager..."

N8N_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '=/+' | head -c 32)
N8N_ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d '=/+' | head -c 16)

store_secret() {
  local name=$1
  local value=$2
  if gcloud secrets describe "$name" --project="$PROJECT_ID" &>/dev/null; then
    echo -n "$value" | gcloud secrets versions add "$name" \
      --data-file=- --project="$PROJECT_ID"
  else
    echo -n "$value" | gcloud secrets create "$name" \
      --data-file=- --project="$PROJECT_ID"
  fi
  # Grant service account access
  gcloud secrets add-iam-policy-binding "$name" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT_ID" --quiet
}

store_secret "n8n-db-password"      "$SQL_PASSWORD"
store_secret "n8n-encryption-key"   "$N8N_ENCRYPTION_KEY"
store_secret "n8n-admin-password"   "$N8N_ADMIN_PASSWORD"

echo "  ✓ Secrets stored in Secret Manager"

# ── Step 5: Deploy n8n to Cloud Run ───────────────────────────────────────────
echo ""
echo "▶ Step 5/7 — Deploying n8n to Cloud Run..."

CLOUD_SQL_CONNECTION="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

gcloud run deploy "$SERVICE_NAME" \
  --image="$N8N_IMAGE" \
  --platform=managed \
  --region="$REGION" \
  --port=5678 \
  --memory=2Gi \
  --cpu=2 \
  --min-instances=1 \
  --max-instances=5 \
  --timeout=300 \
  --service-account="$SA_EMAIL" \
  --add-cloudsql-instances="$CLOUD_SQL_CONNECTION" \
  --set-env-vars="\
DB_TYPE=postgresdb,\
DB_POSTGRESDB_HOST=/cloudsql/${CLOUD_SQL_CONNECTION},\
DB_POSTGRESDB_PORT=5432,\
DB_POSTGRESDB_DATABASE=${SQL_DB},\
DB_POSTGRESDB_USER=${SQL_USER},\
N8N_PORT=5678,\
N8N_PROTOCOL=https,\
N8N_HOST=${N8N_DOMAIN},\
WEBHOOK_URL=https://${N8N_DOMAIN}/,\
N8N_BASIC_AUTH_ACTIVE=true,\
N8N_BASIC_AUTH_USER=${N8N_ADMIN_USER},\
EXECUTIONS_PROCESS=main,\
N8N_SKIP_WEBHOOK_DEREGISTRATION_SHUTDOWN=true,\
GENERIC_TIMEZONE=America/Toronto,\
NODE_ENV=production" \
  --set-secrets="\
DB_POSTGRESDB_PASSWORD=n8n-db-password:latest,\
N8N_ENCRYPTION_KEY=n8n-encryption-key:latest,\
N8N_BASIC_AUTH_PASSWORD=n8n-admin-password:latest" \
  --allow-unauthenticated \
  --project="$PROJECT_ID"

echo "  ✓ n8n deployed to Cloud Run"

# ── Step 6: Get the Cloud Run URL ─────────────────────────────────────────────
echo ""
echo "▶ Step 6/7 — Getting service URL..."

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --format="value(status.url)")

echo "  ✓ Cloud Run URL: $SERVICE_URL"

# ── Step 7: Print next steps ──────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  n8n is LIVE on Google Cloud!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Cloud Run URL : $SERVICE_URL"
echo "  Admin User    : $N8N_ADMIN_USER"
echo "  Admin Password: $N8N_ADMIN_PASSWORD"
echo ""
echo "  SAVE THE PASSWORD ABOVE — it won't be shown again."
echo ""
echo "  NEXT STEPS:"
echo "  1. Map your domain:"
echo "     Add a CNAME record: n8n.vparegistry.com → ghs.googlehosted.com"
echo "     Then run: gcloud run domain-mappings create \\"
echo "       --service=$SERVICE_NAME \\"
echo "       --domain=$N8N_DOMAIN \\"
echo "       --region=$REGION \\"
echo "       --project=$PROJECT_ID"
echo ""
echo "  2. Set your n8n webhook URL in Cloud Run (vpa-registry service):"
echo "     N8N_CERTIFICATION_WEBHOOK_URL=https://$N8N_DOMAIN/webhook/vpa-certify"
echo ""
echo "  3. Open n8n and import the workflow:"
echo "     $SERVICE_URL"
echo "     File: n8n-workflow/vpa-certification-workflow.json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
