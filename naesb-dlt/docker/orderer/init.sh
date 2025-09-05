#!/bin/bash

SERVICE_NAME="orderer-$ORG_NAME"
MSPDIR=/var/hyperledger/orderer/msp
TLSDIR=/var/hyperledger/orderer/tls

rm -rf $MSPDIR
rm -rf $TLSDIR

mkdir -p $MSPDIR/cacerts
mkdir -p $MSPDIR/keystore
mkdir -p $MSPDIR/signcerts
mkdir -p $MSPDIR/tlscacerts
mkdir -p $TLSDIR

tee $MSPDIR/config.yaml <<EOF
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
    --data '{ "role":"orderer", "name":"'"$ORDERER_ID"'"}' \
    $CA_ADDRESS/api/ca/v1/msp/certs)
    
TLS_CERT=$(curl -s \
    -H "Content-Type: application/json" \
    --request POST \
    --data '{ "name":"'"$ORDERER_ID.$SERVICE_NAME.service.consul"'", "role": "orderer"}' \
    $CA_ADDRESS/api/ca/v1/tls/certs)

certificate=$(echo $CA_CERT | jq -r '.data.certificate')
serial=$(echo $CA_CERT | jq -r '.data.serial_number')
issuing_ca=$(echo $CA_CERT | jq -r '.data.issuing_ca')
private_key=$(echo $CA_CERT | jq -r '.data.private_key')

tls_certificate=$(echo $TLS_CERT | jq -r '.data.certificate')
tls_serial=$(echo $TLS_CERT | jq -r '.data.serial_number')
tls_issuing_ca=$(echo $TLS_CERT | jq -r '.data.issuing_ca')
tls_private_key=$(echo $TLS_CERT | jq -r '.data.private_key')

REGISTER_TLS=$(curl \
    -H "Content-Type: application/json" \
    --request PUT \
    --cacert $CONSUL_CACERT \
    --data "$tls_serial" \
    $CONSUL_ADDR:8500/v1/kv/orderer-$ORG_NAME-tls)
    
REGISTER_CA=$(curl \
    -H "Content-Type: application/json" \
    --request PUT \
    --cacert $CONSUL_CACERT \
    --data "$serial" \
    $CONSUL_ADDR:8500/v1/kv/orderer-$ORG_NAME-ca)

echo "${issuing_ca}" | tee $MSPDIR/cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${certificate}" | tee $MSPDIR/signcerts/orderer.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${private_key}" | tee $MSPDIR/keystore/priv_key >/dev/null


echo "${tls_issuing_ca}" | tee $MSPDIR/tlscacerts/tlsca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${tls_issuing_ca}" | tee $TLSDIR/ca.crt >/dev/null
echo "${tls_certificate}" | tee $TLSDIR/server.crt >/dev/null
echo "${tls_private_key}" | tee $TLSDIR/server.key >/dev/null 

JSON_STRING=$( jq -n \
    --arg private_key "$private_key" \
    '{options: {cas: 0}, data:{ key: $private_key}}' )
body='{"options": {"cas": 0},"data":{"key":"'"$private_key"'"}}'

curl \
    -H "Content-Type: application/json" \
    -H "X-Vault-Token: $TOKEN" \
    --request POST \
    --data "$JSON_STRING" \
    $VAULT_ADDR/v1/kv/$ORG_ID/data/orderer/key

orderer start