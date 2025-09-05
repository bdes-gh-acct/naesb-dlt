#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

# set global variables
CHANNEL_NAME=$CHANNEL_NAME
NUM_ORGS_IN_CHANNEL=$NUM_ORGS_IN_CHANNEL
PEERORGLIST=$PEERORGLIST
DELAY=3
COUNTER=1
MAX_RETRY=5

CC_LANGUAGE=node
CC_PATH=$CC_PATH
CC_LABEL=${CC_LABEL}
CC_VERSION=${CC_VERSION}
CC_PKG_FILE=${CC_LABEL}_${CC_VERSION}.tar.gz

verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute Chaincode Installation Scenario ==========="
    echo
    exit 1
  fi
}

packageChaincode() {
  echo $CC_PKG_FILE
  set -x
  peer lifecycle chaincode package $CC_PKG_FILE --path $CC_PATH --lang $CC_LANGUAGE --label $CC_LABEL >&log.txt
  res=$?
  set +x
  cat log.txt
  peer lifecycle chaincode calculatepackageid $CC_PKG_FILE
  if [ ! -f $CC_PKG_FILE ]
  then
    res=1
  fi
  verifyResult $res "Chaincode packaging failed"
  echo "===================== Chaincode packaged ===================== "
  echo
}

packageChaincode