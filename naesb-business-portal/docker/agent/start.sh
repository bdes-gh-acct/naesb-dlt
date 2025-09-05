#!/bin/bash

if [[ "$BOOTSTRAP_DID" == "true" ]]; then
  # DID is bootstrapped to network assuming that the POOL_URL/register endpoint is supported and is unauthenticated
curl \
 --header "Content-Type: application/json" \
 -d '{"seed":"'"$ACAPY_WALLET_SEED"'", "role":"'"$INDY_ROLE"'", "alias":"'"$ACAPY_LABEL"'"}' -X POST ${POOL_URL}/register 
fi

# sleep 15
# echo 'Provisioning Agent...'
# aca-py provision \
#   -it http '0.0.0.0' "$ACAPY_SERVICE_PORT" \
#   -ot http \
#   --admin '0.0.0.0' "$ACAPY_ADMIN_PORT" \
#   --wallet-type "askar" \
#   --wallet-name "$ACAPY_WALLET_NAME" \
#   --wallet-key "$ACAPY_WALLET_KEY" \
#   --wallet-storage-type "postgres_storage" \
#   --wallet-storage-config '{"url":"'"$DB_HOST:$DB_PORT"'", "max_connections":5}' \
#   --wallet-storage-creds '{"account":"'"$DB_ACCOUNT"'","password":"'"$DB_PASSWORD"'","admin_account":"'"$DB_ADMIN_ACCOUNT"'","admin_password":"'"$DB_ADMIN_PASSWORD"'"}'

sleep 15
echo 'Starting Agent...'
echo '{"account":"'"$DB_ACCOUNT"'","password":"'"$DB_PASSWORD"'","admin_account":"'"$DB_ADMIN_ACCOUNT"'","admin_password":"'"$DB_ADMIN_PASSWORD"'"}'
aca-py start -it http '0.0.0.0' $ACAPY_SERVICE_PORT \
  -ot http \
  --admin '0.0.0.0' $ACAPY_ADMIN_PORT \
  --wallet-type "askar" \
  --wallet-storage-type 'postgres_storage' \
  --wallet-storage-config '{"url":"'"$DB_HOST:$DB_PORT"'", "max_connections":5}' \
  --wallet-storage-creds '{"account":"'"$DB_ACCOUNT"'","password":"'"$DB_PASSWORD"'","admin_account":"'"$DB_ADMIN_ACCOUNT"'","admin_password":"'"$DB_ADMIN_PASSWORD"'"}' \
  --log-level debug