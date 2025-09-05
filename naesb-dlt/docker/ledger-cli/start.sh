#!/bin/sh
apk update
apk add jq curl

TOKEN=`cat /tmp/token/vault-token-via-agent`

initOrgCerts() {
ORG_NAME=$1
ORG_ID=$2
echo "===================== generating CA Certificate for org '$ORG_NAME' '$ORG_ID' ===================== "
mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp
tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/config.yaml <<EOF
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
echo "===================== generating CA Certificate for org '$ORG_NAME' ===================== "
CA_CERT=$(curl \
    -H "Content-Type: application/json" \
    -H "X-Vault-Token: $TOKEN" \
    --request POST \
    --data '{"client_flag": true, "server_flag": true,"key_type": "ec","key_bits":256, "ttl":"360h","common_name":"'"Admin@$ORG_NAME.$DOMAIN"'"}' \
    $VAULT_ADDR/v1/$ORG_ID/msp/issue/admin)

echo "===================== generating TLS Certificate for org '$ORG_NAME' ===================== "
TLS_CERT=$(curl \
    -H "Content-Type: application/json" \
    -H "X-Vault-Token: $TOKEN" \
    --request POST \
    --data '{ "ttl":"360h","common_name":"'"tls.client.$ORG_NAME.$DOMAIN"'"}' \
    $VAULT_ADDR/v1/$ORG_ID/tls/issue/client)

certificate=$(echo $CA_CERT | jq -r '.data.certificate')
serial=$(echo $CA_CERT | jq -r '.data.serial_number')
issuing_ca=$(echo $CA_CERT | jq -r '.data.issuing_ca')
private_key=$(echo $CA_CERT | jq -r '.data.private_key')

tls_certificate=$(echo $TLS_CERT | jq -r '.data.certificate')
tls_serial=$(echo $TLS_CERT | jq -r '.data.serial_number')
tls_issuing_ca=$(echo $TLS_CERT | jq -r '.data.issuing_ca')
tls_private_key=$(echo $TLS_CERT | jq -r '.data.private_key')

mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls
mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/cacerts
mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/keystore
mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/signcerts
mkdir -p /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/tlscacerts

echo "${issuing_ca}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/cacerts/ca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${certificate}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/signcerts/Admin@$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${private_key}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/keystore/priv_key >/dev/null

echo "${tls_issuing_ca}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp/tlscacerts/tlsca.$ORG_NAME.$DOMAIN-cert.pem >/dev/null
echo "${tls_issuing_ca}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/ca.crt >/dev/null
echo "${tls_certificate}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.crt >/dev/null
echo "${tls_private_key}" | tee /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.key >/dev/null
}

setEnvironment() {
  if [[ $# -lt 1 ]]
  then
    echo "Run: setEnvironments <org> [<peer>]"
    exit 1
  fi
  ORG_NAME=$1
  PEER_ID=peer0
  if [[ $# -eq 2 ]]
  then
    PEER_ID=$2
  fi
  MSP=
  if [[ "$ORG_NAME" == "spire" ]]
  then
    ORG_ID=org_N3LsIPXJkZqD5QD4
    MSP_ID=D188779862
  elif [[ "$ORG_NAME" == "tva" ]]
  then
    ORG_ID=org_ZVg6j5mzxBltGrJJ
    MSP_ID=D001883032
  elif [[ "$ORG_NAME" == "naesb" ]]
  then
    ORG_ID=org_Zq88NZfnjTsOu2II
    MSP_ID=D000000000
  elif [[ "$ORG_NAME" == "eqt" ]]
  then
    ORG_ID=org_5bxHHug4Gu0kk5tR
    MSP_ID=D272727272
  else
    echo "Unknown Org: "$ORG_NAME
    exit 1
  fi
  export CORE_PEER_LOCALMSPID=$MSP_ID
  export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/ca.crt"
  export CORE_PEER_MSPCONFIGPATH="/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp"
  export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:9051"
  export CORE_PEER_TLS_CERT_FILE=/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.crt
  export CORE_PEER_TLS_KEY_FILE=/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.key
}

ORG_NAME="naesb"
ORG_ID="org_Zq88NZfnjTsOu2II"
initOrgCerts $ORG_NAME $ORG_ID
configtxgen -profile SpireTVAChannel -configPath="/config" -channelID spire-tva -outputBlock genesis.block
osnadmin channel join -o orderer.orderer-naesb.service.consul:7080 --channelID=spire-tva --config-block=genesis.block --ca-file /tmp/msp/ordererOrganizations/naesb.$DOMAIN/tlsca/orderer.naesb.$DOMAIN-cert.pem --client-cert /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.crt --client-key /tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.key

SERVICE_PORT="9051"
PEER_ID="peer0"
export CORE_PEER_LOCALMSPID="NAESB"
export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/msp"
export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:9051"
export CORE_PEER_TLS_CERT_FILE=/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.crt
export CORE_PEER_TLS_KEY_FILE=/tmp/msp/peerOrganizations/$ORG_NAME.$DOMAIN/users/Admin@$ORG_NAME.$DOMAIN/tls/client.key
sleep 20
echo "**** Fetching Channel Info ****"
peer channel fetch newest mychannel.block --tls --cafile "/tmp/msp/ordererOrganizations/naesb.$DOMAIN/tlsca/orderer.naesb.$DOMAIN-cert.pem" -c "spire-tva" -o "orderer.orderer-naesb.service.consul:7050" 
peer channel join -b mychannel.block
sleep 20
echo "**** Listing Channels ****"
peer channel list 

sleep infinity
