#!/bin/bash
ORG_NAME=$1
ORG_ID=$2
BLOCK_PATH=$3
LOCALMSPID=$4
SERVICE_PORT="9051"
PEER_ID="peer0"

export CORE_PEER_LOCALMSPID=$LOCALMSPID
export CORE_PEER_MSPCONFIGPATH="/tmp/msp/$ORG_NAME/mspca"
export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:9051"
export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/$ORG_NAME/tls/tls.cert.pem"
export CORE_PEER_TLS_CERT_FILE="/tmp/msp/$ORG_NAME/tls/cert.pem"
export CORE_PEER_TLS_KEY_FILE="/tmp/msp/$ORG_NAME/tls/key.pem"
export CORE_PEER_TLS_ENABLED=true

peer channel create -o orderer.orderer-naesb.service.consul:7080  -c spire-tva -f /tmp/msp/spire-tva.tx --outputBlock /tmp/msp/genesis.block