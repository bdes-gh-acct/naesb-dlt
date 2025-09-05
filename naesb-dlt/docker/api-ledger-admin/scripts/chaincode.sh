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
ORDERER_HOST=orderer.orderer-naesb.service.consul
ORDERER_PORT=7050
ORDERER_CA=/tmp/msp/naesb/tls/tls.cert.pem

CC_LANGUAGE=node
CC_PATH=$CC_PATH
CC_LABEL=${CC_LABEL}
CC_VERSION=${CC_VERSION}
CC_PKG_FILE=${CC_LABEL}_${CC_VERSION}.tar.gz
CC_SEQUENCE_NUM=1
CC_FUNC=${CC_FUNC}
CC_ARGS=${CC_ARGS}
ORGANIZATION=${ORGANIZATION}

# verify the result of the end-to-end test
verifyResult() {
  if [ $1 -ne 0 ]; then
    echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
    echo "========= ERROR !!! FAILED to execute Chaincode Installation Scenario ==========="
    echo
    exit 1
  fi
}

spire_PORT=9051
tva_PORT=9051
naesb_PORT=9051
eqt_port=9051

setOrganization() {
  if [[ $# -lt 1 ]]
  then
    echo "Run: setOrganizations <org> [<user>]"
    exit 1
  fi
  ORG=$1
  USER=Admin
  if [[ $# -eq 2 ]]
  then
    USER=$2
  fi
  MSP=
  if [[ "$ORG" == "spire" ]]
  then
    MSP=D188779862
    PORT=$spire_PORT
  elif [[ "$ORG" == "tva" ]]
  then
    MSP=D001883032
    PORT=$tva_PORT
  elif [[ "$ORG" == "naesb" ]]
  then
    MSP=D000000000
    PORT=$naesb_PORT
  elif [[ "$ORG" == "eqt" ]]
  then
    MSP=D272727272
    PORT=$eqt_port
  else
    echo "Unknown Org: "$ORG
    exit 1
  fi
  ORG_NAME=$ORG
  LOCALMSPID=$MSP
  PEER_ID="peer0"
  export CORE_PEER_LOCALMSPID=$LOCALMSPID
  export CORE_PEER_MSPCONFIGPATH="/tmp/msp/$ORG_NAME/mspca"
  export CORE_PEER_ADDRESS="$PEER_ID.peer-$ORG_NAME.service.consul:$PORT"
  export CORE_PEER_TLS_ROOTCERT_FILE="/tmp/msp/$ORG_NAME/tls/tls.cert.pem"
  export CORE_PEER_TLS_CERT_FILE="/tmp/msp/$ORG_NAME/tls/cert.pem"
  export CORE_PEER_TLS_KEY_FILE="/tmp/msp/$ORG_NAME/tls/key.pem"
}

packageChaincode() {
  setOrganization naesb

  set -x
  peer lifecycle chaincode package $CC_PKG_FILE --path $CC_PATH --lang $CC_LANGUAGE --label $CC_LABEL >&log.txt
  res=$?
  set +x
  cat log.txt
  if [ ! -f $CC_PKG_FILE ]
  then
    res=1
  fi
  verifyResult $res "Chaincode packaging failed"
  echo "===================== Chaincode packaged ===================== "
  echo
}

installChaincodeInOrg() {
  ORG=$1

  echo $ORG
  setOrganization $ORG
  if [ ! -f $CC_PKG_FILE ]
  then
    res=1
  else

    peer lifecycle chaincode install --connTimeout 500s $CC_PKG_FILE >&log.txt
    res=$?
  fi
  cat log.txt
  verifyResult $res "Failed to install chaincode on peer '$CORE_PEER_ADDRESS' for channel '$CHANNEL_NAME' "

  CC_PKG_ID_COUNT=$(peer lifecycle chaincode queryinstalled --peerAddresses $PEER_ID.peer-$ORG_NAME.service.consul:$PORT --tlsRootCertFiles /tmp/msp/$ORG/tls/tls.cert.pem --connTimeout 300s | grep "Label: "$CC_LABEL | wc -l)
 
  if [ $CC_PKG_ID_COUNT != $CC_SEQUENCE_NUM ]
  then
    verifyResult 1 "Failed to verify chaincode installation on peer0.${ORG}.naesb.com for channel '$CHANNEL_NAME' "
  fi
}

installChaincode() {
  setOrganization naesb
  echo "$PEER_ID.peer-$ORG_NAME.service.consul:$PORT"
  set -x
  OLD_CC_PKG_IDS=$(peer lifecycle chaincode queryinstalled --peerAddresses $PEER_ID.peer-$ORG_NAME.service.consul:$PORT --tlsRootCertFiles /tmp/msp/$ORG/tls/tls.cert.pem --connTimeout 300s | grep -v "Installed\ chaincodes\ on\ peer" | awk '{print $3}')
  set +x
  for org in $PEERORGLIST; do
    installChaincodeInOrg $org
    echo "===================== Installed chaincode on peer0.${org}.naesb.com for channel '$CHANNEL_NAME' ===================== "
    echo
  done
}

approveChaincodeDefinitionForOrg() {
  ORG=$1
  setOrganization $ORG
  set -x
  peer lifecycle chaincode approveformyorg --connTimeout 300s -o orderer.orderer-naesb.service.consul:$ORDERER_PORT --channelID $CHANNEL_NAME --name $CC_LABEL --version $CC_VERSION --signature-policy $ENDORSEMENT_POLICY --init-required --package-id $CC_PKG_ID --sequence $CC_SEQUENCE_NUM --tls true --cafile $ORDERER_CA >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Failed to approve chaincode definition for ${ORG} for channel '$CHANNEL_NAME' "
}

approveChaincodeDefinitions() {
  ENDORSEMENT_POLICY=
  for org in $PEERORGLIST; do
    setOrganization $org
    if [ "$ENDORSEMENT_POLICY" == "" ]
    then
      ENDORSEMENT_POLICY="AND('"$MSP.member"'"
    else
      ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY,"'"$MSP.member"'"
    fi
    CC_PKG_ID_COUNT=$(peer lifecycle chaincode queryinstalled --connTimeout 300s | grep "Label: "$CC_LABEL | wc -l)
    if [ $CC_PKG_ID_COUNT != $CC_SEQUENCE_NUM ]
    then
      verifyResult 1 "Failed to verify chaincode installation on peer0.$org.naesb.com for channel '$CHANNEL_NAME' "
    fi
  done
  ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY")"

  # Get the package ID from an org peer that is guaranteed to run all of our chaincodes
  setOrganization naesb
  peer lifecycle chaincode queryinstalled --connTimeout 300s | grep -v "Installed\ chaincodes\ on\ peer" | grep $CC_LABEL > install.tmp
  if [ "$OLD_CC_PKG_IDS" != "" ]
  then
    for OLD_CC_PKG_ID in $OLD_CC_PKG_IDS
    do
      grep -v $OLD_CC_PKG_ID install.tmp > install1.tmp
      mv install1.tmp install.tmp
    done
  fi
  CC_PKG_ID=$(cat install.tmp | awk '{print $3}')
  rm install.tmp
  CC_PKG_ID=${CC_PKG_ID:0:${#CC_PKG_ID}-1}	# Remove the comma at the end

  # Approve definition by each peer on the channel
  ORG_LIST="naesb tva spire eqt"
  for org in $ORG_LIST; do
    approveChaincodeDefinitionForOrg $org
    echo "===================== Approved chaincode definitions for ${org} for channel '$CHANNEL_NAME' ===================== "
    echo
  done
}

commitChaincodeDefinition() {
  setOrganization naesb

  ORG_PEER_CONNECTION=""
  READINESS=$(peer lifecycle chaincode checkcommitreadiness --connTimeout 300s --channelID $CHANNEL_NAME --name $CC_LABEL --version $CC_VERSION --init-required --sequence $CC_SEQUENCE_NUM --tls true --cafile $ORDERER_CA --output json)
  ORG_LIST="naesb spire tva eqt"
  for org in $ORG_LIST; do
    READINESS_FOR_ORG=$(echo $READINESS | jq .approvals.${org})
    if [ ! $READINESS_FOR_ORG ]
    then
      verifyResult 1 "${org} has not approved the chaincode definition for channel '$CHANNEL_NAME' yet"
    fi
    port_key=${org}_PORT
    echo "Chaincode definition approved by ${org}"
    ORG_PEER_CONNECTION=$ORG_PEER_CONNECTION" --peerAddresses peer0.peer-${org}.service.consul:9051 --tlsRootCertFiles /tmp/msp/${org}/tls/tls.cert.pem"
  done

  ENDORSEMENT_POLICY=
  for org in $PEERORGLIST; do
    setOrganization $org
    if [ "$ENDORSEMENT_POLICY" == "" ]
    then
      ENDORSEMENT_POLICY="AND('"$MSP.member"'"
    else
      ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY,"'"$MSP.member"'"
    fi
  done
  ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY")"

  set -x
  peer lifecycle chaincode commit --connTimeout 300s -o $ORDERER_HOST:$ORDERER_PORT --ordererTLSHostnameOverride $ORDERER_HOST --channelID $CHANNEL_NAME --name $CC_LABEL --version $CC_VERSION --sequence $CC_SEQUENCE_NUM --signature-policy $ENDORSEMENT_POLICY --init-required --tls true --cafile $ORDERER_CA $ORG_PEER_CONNECTION >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Failed to commit chaincode definition for channel '$CHANNEL_NAME' "

  CC_COMMITMENT_MESSAGE="Committed chaincode definition for chaincode '${CC_LABEL}' on channel '${CHANNEL_NAME}'"
  CC_COMMITMENT=$(peer lifecycle chaincode querycommitted --connTimeout 300s --channelID $CHANNEL_NAME --name $CC_LABEL --cafile $ORDERER_CA | grep "$CC_COMMITMENT_MESSAGE" | wc -l)
  if [ $CC_COMMITMENT != 1 ]
  then
    verifyResult 1 "Failed to verify chaincode definition commitment on channel '$CHANNEL_NAME' "
  fi
  echo "===================== Committed chaincode definition on channel '$CHANNEL_NAME' ===================== "
}

initializeChaincode() {
  setOrganization naesb User1

  ORG_PEER_CONNECTION=""
  for org in $PEERORGLIST; do
    port_key=${org}_PORT
    ORG_PEER_CONNECTION=$ORG_PEER_CONNECTION" --peerAddresses peer0.peer-${org}.service.consul:9051 --tlsRootCertFiles /tmp/msp/${org}/tls/tls.cert.pem"
  done

  set -x
  peer chaincode invoke --connTimeout 300s -o $ORDERER_HOST:$ORDERER_PORT --ordererTLSHostnameOverride $ORDERER_HOST -C $CHANNEL_NAME -n $CC_LABEL --isInit --tls true --waitForEvent --cafile $ORDERER_CA $ORG_PEER_CONNECTION -c '{"function":"'$CC_FUNC'","Args":['"$CC_ARGS"']}' >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Failed to initialize chaincode on channel '$CHANNEL_NAME' "
  echo "===================== Initialized chaincode on channel '$CHANNEL_NAME' ===================== "
}

installAndApproveContractOnNewOrg() {
  # First, install and approve contract on new org peer
  setOrganization exportingentityorg

  # Use the old chaincode version to install the contract on the new org's peer
  TEMP_CC_VERSION=$CC_VERSION
  CC_VERSION=$OLD_CC_VERSION
  CC_PKG_FILE=${CC_LABEL}_${CC_VERSION}.tar.gz
  packageChaincode
  installChaincodeInOrg exportingentityorg

  ENDORSEMENT_POLICY=
  for org in $PEERORGLIST; do
    setOrganization $org
    if [ "$ENDORSEMENT_POLICY" == "" ]
    then
      ENDORSEMENT_POLICY="AND('"$MSP.member"'"
    else
      ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY,"'"$MSP.member"'"
    fi
  done
  ENDORSEMENT_POLICY=$ENDORSEMENT_POLICY")"
  CC_PKG_ID=$(peer lifecycle chaincode queryinstalled --connTimeout 300s | grep -v "Installed\ chaincodes\ on\ peer" | grep $CC_LABEL)
  CC_PKG_ID=$(echo $CC_PKG_ID | awk '{print $3}')
  CC_PKG_ID=${CC_PKG_ID:0:${#CC_PKG_ID}-1}	# Remove the comma at the end
  approveChaincodeDefinitionForOrg exportingentityorg

  # Use the new chaincode version now, for the upgrade
  CC_VERSION=$TEMP_CC_VERSION
  CC_PKG_FILE=${CC_LABEL}_${CC_VERSION}.tar.gz
}

upgradeContract() {
  # First, install and approve contract on new org peer
  installAndApproveContractOnNewOrg

  # Now increment the sequence number and update the contract on 5 peers in 5 different orgs
  PEERORGLIST=$PEERORGLIST" exportingentityorg"
  CC_SEQUENCE_NUM=2
  packageChaincode
  installChaincode
  approveChaincodeDefinitions
  commitChaincodeDefinition
  initializeChaincode
}

invokeChaincode() {
  setOrganization $ORGANIZATION User1

  ORG_PEER_CONNECTION=""
  for org in $PEERORGLIST; do
    ORG_PEER_CONNECTION=$ORG_PEER_CONNECTION" --peerAddresses peer0.${org}.naesb.com:${${org}_PORT} --tlsRootCertFiles /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/${org}.naesb.com/peers/peer0.${org}.naesb.com/tls/ca.crt"
  done

  set -x
  peer chaincode invoke --connTimeout 300s -o $ORDERER_HOST:$ORDERER_PORT --ordererTLSHostnameOverride $ORDERER_HOST -C $CHANNEL_NAME -n $CC_LABEL --tls true --waitForEvent --cafile $ORDERER_CA $ORG_PEER_CONNECTION -c '{"function":"'$CC_FUNC'","Args":['"$CC_ARGS"']}' >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Failed to invoke chaincode transaction on channel '$CHANNEL_NAME' "
  echo "===================== Invoked chaincode transaction on channel '$CHANNEL_NAME' ===================== "
}

queryChaincode() {
  setOrganization $ORGANIZATION User1

  set -x
  echo $CHANNEL_NAME
  echo $CC_LABEL
  echo $CC_FUNC
  echo $CC_ARGS
  peer chaincode query --connTimeout 300s -C $CHANNEL_NAME -n $CC_LABEL -c '{"function":"'$CC_FUNC'","Args":['"$CC_ARGS"']}' >&log.txt
  res=$?
  set +x
  cat log.txt
  verifyResult $res "Failed to query chaincode function on channel '$CHANNEL_NAME' "
  echo "===================== Queried chaincode function on channel '$CHANNEL_NAME' ===================== "
}


if [[ $# -ne 1 ]]
then
  echo "Run: chaincode.sh [package|install|approve|commit|init|upgrade|invoke|query]"
  exit 1
fi
echo $1
if [ "$1" == "package" ]
then
  ## Package chaincode
  echo "Packaging chaincode..."
  packageChaincode
  echo "========= Chaincode packaging completed =========== "
elif [ "$1" == "install" ]
  then
  ## Install chaincode on org peers
  echo "Installing chaincode on org peers..."
  installChaincode
  echo "========= Chaincode installations completed =========== "
elif [ "$1" == "approve" ]
  then
  ## Approve chaincode definition for orgs
  echo "Approving chaincode definition for orgs..."
  approveChaincodeDefinitions
  echo "========= Chaincode definitions approved =========== "
elif [ "$1" == "commit" ]
  then
  ## Commit chaincode definition to channel ledger
  echo "Committing chaincode definition..."
  commitChaincodeDefinition
  echo "========= Chaincode definition committed =========== "
elif [ "$1" == "init" ]
  then
  ## Initialize chaincode by calling an init function (doesn't have to be named "init")
  echo "Initializing chaincode..."
  initializeChaincode
  echo "========= Chaincode initialized =========== "
elif [ "$1" == "upgrade" ]
  then
  ## Upgrade chaincode by calling package, install, approve, commit, and init
  echo "Upgrading chaincode..."
  upgradeContract
  echo "========= Chaincode upgraded =========== "
elif [ "$1" == "invoke" ]
  then
  ## Invoke chaincode transaction
  echo "Invoking chaincode..."
  invokeChaincode
  echo "========= Chaincode invoked =========== "
elif [ "$1" == "query" ]
  then
  ## Query chaincode function
  echo "Querying chaincode..."
  queryChaincode
  echo "========= Chaincode queried =========== "
else
  echo "Unsupported chaincode operation: "$1
fi

echo

exit 0
