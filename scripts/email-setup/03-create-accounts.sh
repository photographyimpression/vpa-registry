#!/bin/bash
# =============================================================================
# VPA Registry — Create 100 Email Accounts on docker-mailserver
#
# Usage (run ON the OVH server, after docker-mailserver is running):
#   bash 03-create-accounts.sh
#
# Output:
#   email-credentials.csv — contains all 100 email/password pairs
#   NEVER commit this file to git (.gitignore already excludes it)
# =============================================================================

set -e

CONTAINER_NAME="mailserver"
OUTPUT_FILE="email-credentials.csv"
TOTAL=100

# --- Check docker-mailserver is running ---
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "ERROR: Container '${CONTAINER_NAME}' is not running."
  echo "  Start it first: docker compose -f 02-docker-compose.yml up -d"
  echo "  Then wait ~90 seconds for it to initialize before running this script."
  exit 1
fi

echo "============================================="
echo "VPA Registry — Creating 100 Email Accounts"
echo "Output file: $OUTPUT_FILE"
echo "============================================="
echo ""

# Write CSV header
echo "email,password" > "$OUTPUT_FILE"

SUCCESS=0
FAIL=0

for i in $(seq 1 $TOTAL); do
  EMAIL="hello@mail${i}.vparegistry.com"

  # Generate a strong random password (20 chars, alphanumeric + symbols)
  PASSWORD=$(openssl rand -base64 20 | tr -d '/+=' | head -c 20)

  # Add the account to docker-mailserver
  if docker exec "$CONTAINER_NAME" setup email add "$EMAIL" "$PASSWORD" &>/dev/null; then
    echo "  ✅ Created: $EMAIL"
    echo "${EMAIL},${PASSWORD}" >> "$OUTPUT_FILE"
    ((SUCCESS++)) || true
  else
    echo "  ❌ Failed:  $EMAIL"
    ((FAIL++)) || true
  fi
done

echo ""
echo "============================================="
echo "Done!"
echo "  Created: $SUCCESS accounts"
echo "  Failed:  $FAIL"
echo ""
echo "Credentials saved to: $OUTPUT_FILE"
echo "⚠️  Keep this file secure. Do NOT commit it to git."
echo "============================================="
