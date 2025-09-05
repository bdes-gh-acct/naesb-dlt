#!/bin/bash
CC_PKG_FILE=$1
CC_LABEL=$2
PEER_ID="peer0"
CC_SEQUENCE_NUM=1

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute Chaincode Installation Scenario ==========="
    echo
    exit 1
  fi
}

installChaincode() {
  if [ ! -f $CC_PKG_FILE ]
  then
    res=1
  else
    echo "Installing chaincode."
    peer lifecycle chaincode install --connTimeout 500s $CC_PKG_FILE >&log.txt
    res=$?
  fi
  cat log.txt
  verifyResult $res "Failed to install chaincode on peer '$CORE_PEER_ADDRESS'"

  # CC_PKG_ID_COUNT=$(peer lifecycle chaincode queryinstalled --peerAddresses $CORE_PEER_ADDRESS --connTimeout 300s | grep "Label: "$CC_LABEL | wc -l)
 
  # if [ $CC_PKG_ID_COUNT != $CC_SEQUENCE_NUM ]
  # then
  #   verifyResult 1 "Failed to verify chaincode installation on $CORE_PEER_ADDRESS"
  # fi
}

installChaincode