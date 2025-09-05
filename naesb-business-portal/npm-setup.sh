#!/bin/bash

TOKEN=$(aws codeartifact get-authorization-token --domain naesb --domain-owner 094458522773 --query authorizationToken --output text)
tee ./.npmrc &>/dev/null <<EOF
@naesb:registry=https://naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:_authToken=$TOKEN
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:always-auth=true
EOF

tee ./packages/model/.npmrc &>/dev/null <<EOF
@naesb:registry=https://naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:_authToken=$TOKEN
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:always-auth=true
EOF

tee ./packages/agent-client/.npmrc &>/dev/null <<EOF
@naesb:registry=https://naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:_authToken=$TOKEN
//naesb-094458522773.d.codeartifact.us-east-1.amazonaws.com/npm/naesb/:always-auth=true
EOF