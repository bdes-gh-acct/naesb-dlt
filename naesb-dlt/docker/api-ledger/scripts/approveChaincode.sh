#!/bin/bash
ORDERER_ADDRESS=$1
CHANNEL_ID=$2
CC_LABEL=$3
CC_SEQUENCE_NUM=$4
CC_LABEL=$5
CC_VERSION=$6
  
echo "Approving chaincode."
peer lifecycle chaincode approveformyorg --connTimeout 300s -o $ORDERER_ADDRESS --channelID $CHANNEL_ID --name $CC_LABEL --version $CC_VERSION --signature-policy $ENDORSEMENT_POLICY --init-required --package-id $CC_PKG_ID --sequence $CC_SEQUENCE_NUM --tls true --cafile $ORDERER_CA >&log.txt
