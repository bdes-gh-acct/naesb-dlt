#!/bin/bash
ORG_NAME=$1
ORG_ID=$2
LOCALMSPID=$3
SERVICE_PORT="9051"
PEER_ID="peer0"
CC_LABEL=$4
CC_VERSION=$5
CC_PKG_FILE=${CC_LABEL}_${CC_VERSION}.tar.gz

export CORE_PEER_LOCALMSPID=$LOCALMSPID
export CORE_PEER_MSPCONFIGPATH="/tmp/msp/$ORG_NAME/mspca"
export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:9051"
export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/$ORG_NAME/tls/tls.cert.pem"
export CORE_PEER_TLS_CERT_FILE="/tmp/msp/$ORG_NAME/tls/cert.pem"
export CORE_PEER_TLS_KEY_FILE="/tmp/msp/$ORG_NAME/tls/key.pem"

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute Chaincode Installation Scenario ==========="
    echo
    exit 1
  fi
}

installChaincode() {
  set -x
  peer lifecycle chaincode install --connTimeout 500s $CC_PKG_FILE >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ ! -f $CC_PKG_FILE ]
  then
    res=1
  fi
  verifyResult $res "Chaincode installation failed"
  echo "===================== Chaincode packaged ===================== "
  echo
}

installChaincode