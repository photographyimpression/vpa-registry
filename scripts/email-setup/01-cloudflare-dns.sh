#!/bin/bash
# =============================================================================
# VPA Registry — Cloudflare DNS Setup for 100 Mail Subdomains
# Creates A, MX, SPF, and DMARC records for mail1–mail100.vparegistry.com
#
# Usage:
#   export CLOUDFLARE_API_TOKEN="your_token_here"
#   export CLOUDFLARE_ZONE_ID="your_zone_id_here"
#   export OVH_SERVER_IP="your_ovh_ip_here"
#   bash 01-cloudflare-dns.sh
#
# How to get your Cloudflare credentials:
#   API Token: Cloudflare Dashboard → My Profile → API Tokens → Create Token
#              → Use "Edit zone DNS" template → select vparegistry.com zone
#   Zone ID:   Cloudflare Dashboard → vparegistry.com → Overview → right sidebar
# =============================================================================

set -e

# --- Validate required env vars ---
if [[ -z "$CLOUDFLARE_API_TOKEN" || -z "$CLOUDFLARE_ZONE_ID" || -z "$OVH_SERVER_IP" ]]; then
  echo "ERROR: Missing required environment variables."
  echo "  export CLOUDFLARE_API_TOKEN=..."
  echo "  export CLOUDFLARE_ZONE_ID=..."
  echo "  export OVH_SERVER_IP=..."
  exit 1
fi

BASE_DOMAIN="vparegistry.com"
CF_API="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records"
HEADERS=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

TOTAL=100
SUCCESS=0
SKIP=0
FAIL=0

echo "============================================="
echo "VPA Registry — Cloudflare DNS Setup"
echo "Adding records for mail1–mail${TOTAL}.${BASE_DOMAIN}"
echo "OVH Server IP: ${OVH_SERVER_IP}"
echo "============================================="
echo ""

add_record() {
  local TYPE="$1"
  local NAME="$2"
  local CONTENT="$3"
  local PROXIED="${4:-false}"
  local PRIORITY="${5:-}"

  local DATA
  if [[ -n "$PRIORITY" ]]; then
    DATA=$(jq -n \
      --arg type "$TYPE" \
      --arg name "$NAME" \
      --arg content "$CONTENT" \
      --argjson proxied "$PROXIED" \
      --argjson priority "$PRIORITY" \
      '{type: $type, name: $name, content: $content, proxied: $proxied, priority: $priority, ttl: 3600}')
  else
    DATA=$(jq -n \
      --arg type "$TYPE" \
      --arg name "$NAME" \
      --arg content "$CONTENT" \
      --argjson proxied "$PROXIED" \
      '{type: $type, name: $name, content: $content, proxied: $proxied, ttl: 3600}')
  fi

  local RESPONSE
  RESPONSE=$(curl -s -X POST "$CF_API" "${HEADERS[@]}" --data "$DATA")

  local SUCCESS_FLAG
  SUCCESS_FLAG=$(echo "$RESPONSE" | jq -r '.success')

  if [[ "$SUCCESS_FLAG" == "true" ]]; then
    echo "  ✅ $TYPE $NAME → $CONTENT"
    ((SUCCESS++)) || true
  else
    local ERROR_MSG
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // "unknown error"')
    if echo "$ERROR_MSG" | grep -qi "already exists\|duplicate"; then
      echo "  ⏭️  $TYPE $NAME already exists, skipping"
      ((SKIP++)) || true
    else
      echo "  ❌ FAILED: $TYPE $NAME — $ERROR_MSG"
      ((FAIL++)) || true
    fi
  fi
}

for i in $(seq 1 $TOTAL); do
  SUBDOMAIN="mail${i}.${BASE_DOMAIN}"
  echo "--- Setting up $SUBDOMAIN ---"

  # A record: subdomain → OVH IP (not proxied — mail must not go through Cloudflare proxy)
  add_record "A" "$SUBDOMAIN" "$OVH_SERVER_IP" false

  # MX record: mail for this subdomain is handled by itself
  add_record "MX" "$SUBDOMAIN" "$SUBDOMAIN" false 10

  # SPF record: only our OVH server IP is allowed to send
  add_record "TXT" "$SUBDOMAIN" "v=spf1 ip4:${OVH_SERVER_IP} ~all" false

  # DMARC record: monitor mode (p=none) — will tighten after 4 weeks
  add_record "TXT" "_dmarc.${SUBDOMAIN}" "v=DMARC1; p=none; rua=mailto:hello@vparegistry.com" false

  echo ""
done

echo "============================================="
echo "Done!"
echo "  Created: $SUCCESS records"
echo "  Skipped: $SKIP (already existed)"
echo "  Failed:  $FAIL"
echo ""
echo "NOTE: DKIM records will be added by script 04-generate-dkim.sh"
echo "      after the mail server is running."
echo "============================================="
