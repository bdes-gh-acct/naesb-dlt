#!/bin/sh


apk add curl jq
SERVICE_NAME="peer-$ORG_NAME"
MSPDIR=/etc/hyperledger/fabric/msp
TLSDIR=/etc/hyperledger/fabric/tls
rm -rf $MSPDIR
rm -rf $TLSDIR
mkdir -p $MSPDIR/tlsca
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

CA_CERT=$(curl \
    -H "Content-Type: application/json" \
    -H "X-Vault-Token: $TOKEN" \
    --request POST \
    --data '{ "exclude_cn_from_sans":true, "ttl":"360h", "common_name":"'"$PEER_ID.$ORG_NAME.$DOMAIN"'","alt_names":"'"$PEER_ID.$SERVICE_NAME.service.consul"'"}' \
    $VAULT_ADDR/v1/$ORG_ID/msp/issue/peer)
    
TLS_CERT=$(curl \
    -H "Content-Type: application/json" \
    -H "X-Vault-Token: $TOKEN" \
    --request POST \
    --data '{ "ttl":"360h","common_name":"'"$PEER_ID.$SERVICE_NAME.service.consul"'","alt_names":"'"$PEER_ID.$SERVICE_NAME.service.consul"'","ip_sans":"'"$SERVICE_ADDRESS"'"}' \
    $VAULT_ADDR/v1/$ORG_ID/tls/issue/peer)

 echo $CA_CERT 
 certData=$(echo $CA_CERT | jq -r '.data')  
 echo 'cert data'
 echo $certData

certificate=$(echo $CA_CERT | jq -r '.data.certificate')
serial=$(echo $CA_CERT | jq -r '.data.serial_number')
issuing_ca=$(echo $CA_CERT | jq -r '.data.issuing_ca')
private_key=$(echo $CA_CERT | jq -r '.data.private_key')

tls_certificate=$(echo $TLS_CERT | jq -r '.data.certificate')
tls_serial=$(echo $TLS_CERT | jq -r '.data.serial_number')
tls_issuing_ca=$(echo $TLS_CERT | jq -r '.data.issuing_ca')
tls_private_key=$(echo $TLS_CERT | jq -r '.data.private_key')

generateServiceInfo()
{
  cat <<EOF
{
  "ID":"$SERVICE_NAME", 
  "Name":"$SERVICE_NAME",
  "Tags": ["$PEER_ID"],
  "Address": "$SERVICE_ADDRESS",
  "Port": $SERVICE_PORT
}
EOF
}

REGISTER=$(curl \
    -H "Content-Type: application/json" \
    --request PUT \
    --data "$(generateServiceInfo)" \
    $CONSUL_ADDR:8500/v1/agent/service/register)

REGISTER_TLS=$(curl \
    -H "Content-Type: application/json" \
    --request PUT \
    --data "$tls_serial" \
    $CONSUL_ADDR:8500/v1/kv/$PEER_ID-peer-$ORG_NAME-tls)
    
REGISTER_CA=$(curl \
    -H "Content-Type: application/json" \
    --request PUT \
    --data "$serial" \
    $CONSUL_ADDR:8500/v1/kv/$PEER_ID-peer-$ORG_NAME-ca)

export CORE_PEER_TLS_CERT_FILE=$TLSDIR/server.crt
export CORE_PEER_TLS_KEY_FILE=$TLSDIR/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=$TLSDIR/ca.crt
export CORE_PEER_LISTENADDRESS=0.0.0.0:$SERVICE_PORT
export CORE_PEER_ADDRESS=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_GOSSIP_EXTERNALENDPOINT=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_GOSSIP_BOOTSTRAP=$PEER_ID.$SERVICE_NAME.service.consul:$SERVICE_PORT
export CORE_PEER_MSPCONFIGPATH=$MSPDIR

echo "${issuing_ca}"

echo "${issuing_ca}" | tee $MSPDIR/cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${certificate}" | tee $MSPDIR/signcerts/$PEER_ID.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${private_key}" | tee $MSPDIR/keystore/priv_key >/dev/null
echo "${tls_issuing_ca}" | tee $MSPDIR/tlscacerts/tlsca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null

echo "${tls_issuing_ca}" | tee $CORE_PEER_TLS_ROOTCERT_FILE >/dev/null
echo "${tls_certificate}" | tee $CORE_PEER_TLS_CERT_FILE >/dev/null
echo "${tls_private_key}" | tee $CORE_PEER_TLS_KEY_FILE >/dev/null



peer node start