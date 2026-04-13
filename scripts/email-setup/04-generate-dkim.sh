#!/bin/bash
# =============================================================================
# VPA Registry — Generate DKIM Keys & Upload to Cloudflare
#
# Usage (run ON the OVH server, after accounts are created):
#   export CLOUDFLARE_API_TOKEN="your_token_here"
#   export CLOUDFLARE_ZONE_ID="your_zone_id_here"
#   bash 04-generate-dkim.sh
#
# What this does:
#   1. Generates DKIM keys for all 100 mail subdomains inside docker-mailserver
#   2. Reads the generated public keys
#   3. Uploads them as TXT DNS records to Cloudflare
# =============================================================================

set -e

CONTAINER_NAME="mailserver"
BASE_DOMAIN="vparegistry.com"
TOTAL=100
CF_API="https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records"
HEADERS=(-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json")

# --- Validate ---
if [[ -z "$CLOUDFLARE_API_TOKEN" || -z "$CLOUDFLARE_ZONE_ID" ]]; then
  echo "ERROR: Missing Cloudflare credentials."
  echo "  export CLOUDFLARE_API_TOKEN=..."
  echo "  export CLOUDFLARE_ZONE_ID=..."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "ERROR: Container '${CONTAINER_NAME}' is not running."
  exit 1
fi

echo "============================================="
echo "VPA Registry — DKIM Key Generation & Upload"
echo "Processing mail1–mail${TOTAL}.${BASE_DOMAIN}"
echo "============================================="
echo ""

SUCCESS=0
FAIL=0

for i in $(seq 1 $TOTAL); do
  SUBDOMAIN="mail${i}.${BASE_DOMAIN}"
  echo "--- Generating DKIM for $SUBDOMAIN ---"

  # Generate DKIM key for this domain inside the container
  docker exec "$CONTAINER_NAME" setup config dkim domain "$SUBDOMAIN" keysize 2048 &>/dev/null || true

  # Path where docker-mailserver stores DKIM public keys
  KEY_FILE="/tmp/docker-mailserver/opendkim/keys/${SUBDOMAIN}/mail.txt"

  # Extract the public key value from the container
  if docker exec "$CONTAINER_NAME" test -f "$KEY_FILE" 2>/dev/null; then
    # Get the raw key content and parse it into a single-line DNS value
    RAW=$(docker exec "$CONTAINER_NAME" cat "$KEY_FILE")
    # Extract just the TXT record value (strip the bind zone file formatting)
    DKIM_VALUE=$(echo "$RAW" | grep -oP '(?<=\( ")[^"]+' | tr -d '\n' | tr -d ' ')
    DKIM_VALUE="v=DKIM1; k=rsa; p=${DKIM_VALUE}"

    # DNS record name: mail._domainkey.mailN.vparegistry.com
    RECORD_NAME="mail._domainkey.${SUBDOMAIN}"

    # Upload to Cloudflare
    DATA=$(jq -n \
      --arg type "TXT" \
      --arg name "$RECORD_NAME" \
      --arg content "$DKIM_VALUE" \
      '{type: $type, name: $name, content: $content, proxied: false, ttl: 3600}')

    RESPONSE=$(curl -s -X POST "$CF_API" "${HEADERS[@]}" --data "$DATA")
    CF_SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

    if [[ "$CF_SUCCESS" == "true" ]]; then
      echo "  ✅ DKIM uploaded for $SUBDOMAIN"
      ((SUCCESS++)) || true
    else
      ERROR_MSG=$(echo "$RESPONSE" | jq -r '.errors[0].message // "unknown"')
      if echo "$ERROR_MSG" | grep -qi "already exists\|duplicate"; then
        echo "  ⏭️  DKIM record already exists for $SUBDOMAIN"
        ((SUCCESS++)) || true
      else
        echo "  ❌ Failed to upload DKIM for $SUBDOMAIN: $ERROR_MSG"
        ((FAIL++)) || true
      fi
    fi
  else
    echo "  ⚠️  Key file not found for $SUBDOMAIN — skipping"
    ((FAIL++)) || true
  fi

  echo ""
done

echo "============================================="
echo "Done!"
echo "  Uploaded: $SUCCESS DKIM records"
echo "  Failed:   $FAIL"
echo ""
echo "Wait 24–48 hours for DNS propagation, then verify:"
echo "  https://mxtoolbox.com/dkim.aspx"
echo "  Selector: mail, Domain: mail1.vparegistry.com"
echo "============================================="
