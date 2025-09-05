#!/bin/bash
ORG_NAME=$1
ORG_ID=$2
SERVICE_PORT=$3
PEER_ID="peer0"

export CORE_PEER_LOCALMSPID=$ORG_ID
export CORE_PEER_MSPCONFIGPATH="/tmp/msp/$ORG_ID/msp"
export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:$SERVICE_PORT"
export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/$ORG_ID/tls/tls.cert.pem"
export CORE_PEER_TLS_CERT_FILE="/tmp/msp/$ORG_ID/tls/server.crt"
export CORE_PEER_TLS_KEY_FILE="/tmp/msp/$ORG_ID/tls/server.key"

echo "Listing channels."
peer channel list