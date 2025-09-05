#!/bin/bash

echo 'Starting Peer...'
sleep 20

SERVICE_NAME="peer-$ORG_NAME"
MSPDIR=/etc/hyperledger/fabric/msp
TLSDIR=/etc/hyperledger/fabric/tls

export CORE_PEER_TLS_CERT_FILE=$TLSDIR/server.crt
export CORE_PEER_TLS_KEY_FILE=$TLSDIR/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=$TLSDIR/ca.crt
export CORE_PEER_LISTENADDRESS=0.0.0.0:$SERVICE_PORT
export CORE_PEER_ADDRESS=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_GOSSIP_EXTERNALENDPOINT=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_GOSSIP_BOOTSTRAP=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_MSPCONFIGPATH=$MSPDIR

if [ ! -d "$MSPDIR/logs" ]; then

echo "MSP directory does not exist, creating crypto config..."
rm -rf $MSPDIR
rm -rf $TLSDIR


mkdir -p $MSPDIR/tlsca
mkdir -p $MSPDIR/cacerts
mkdir -p $MSPDIR/keystore
mkdir -p $MSPDIR/signcerts
mkdir -p $MSPDIR/tlscacerts
mkdir -p $MSPDIR/logs
mkdir -p $TLSDIR

tee $MSPDIR/config.yaml &>/dev/null <<EOF
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem
    OrganizationalUnitIdentifier: orderer
EOF

TOKEN=`cat /tmp/token/vault-token-via-agent`

CA_CERT=$(curl -s \
    -H "Content-Type: application/json" \
    --request POST \
    --data '{ "role":"peer", "name":"'"$PEER_ID"'"}' \
    $CA_ADDRESS/api/ca/v1/msp/certs)
    
TLS_CERT=$(curl -s \
    -H "Content-Type: application/json" \
    --request POST \
    --data '{ "name":"'"$PEER_ID.$SERVICE_NAME.service.consul"'", "role": "peer"}' \
    $CA_ADDRESS/api/ca/v1/tls/certs)

certificate=$(echo $CA_CERT | jq -r '.data.certificate')
serial=$(echo $CA_CERT | jq -r '.data.serial_number')
issuing_ca=$(echo $CA_CERT | jq -r '.data.issuing_ca')
private_key=$(echo $CA_CERT | jq -r '.data.private_key')

tls_certificate=$(echo $TLS_CERT | jq -r '.data.certificate')
tls_serial=$(echo $TLS_CERT | jq -r '.data.serial_number')
tls_issuing_ca=$(echo $TLS_CERT | jq -r '.data.issuing_ca')
tls_private_key=$(echo $TLS_CERT | jq -r '.data.private_key')

echo "${issuing_ca}" | tee $MSPDIR/cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${certificate}" | tee $MSPDIR/signcerts/$PEER_ID.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${private_key}" | tee $MSPDIR/keystore/priv_key >/dev/null
echo "${tls_issuing_ca}" | tee $MSPDIR/tlscacerts/tlsca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null

echo "${tls_issuing_ca}" | tee $CORE_PEER_TLS_ROOTCERT_FILE >/dev/null
echo "${tls_certificate}" | tee $CORE_PEER_TLS_CERT_FILE >/dev/null
echo "${tls_private_key}" | tee $CORE_PEER_TLS_KEY_FILE >/dev/null
fi

REGISTER_TLS=$(curl -s \
    -H "Content-Type: application/json" \
    --request PUT \
    --cacert $CONSUL_CACERT \
    --data "$tls_serial" \
    $CONSUL_ADDR:8500/v1/kv/$PEER_ID-peer-$ORG_NAME-tls)
    
REGISTER_CA=$(curl -s \
    -H "Content-Type: application/json" \
    --request PUT \
    --cacert $CONSUL_CACERT \
    --data "$serial" \
    $CONSUL_ADDR:8500/v1/kv/$PEER_ID-peer-$ORG_NAME-ca)

echo "${tls_certificate}"

peer node start
