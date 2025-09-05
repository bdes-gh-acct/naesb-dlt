#!/bin/sh

function log {
 local message="$1"
 local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
 >&2 echo -e "$timestamp $message"
}

function retry {
  local cmd="$1"
  local description="$2"

  for i in $(seq 1 30); do
    log "$description"

    # The boolean operations with the exit status are there to temporarily circumvent the "set -e" at the
    # beginning of this script which exits the script immediatelly for error status while not losing the exit status code
    output=$(eval "$cmd") && exit_status=0 || exit_status=$?
    if [[ $exit_status -eq 0 ]]; then
      echo "$output"
      return
    fi
    log "$description failed. Will sleep for 10 seconds and try again."
    sleep 10
  done;

  log "$description failed after 30 attempts."
  exit $exit_status
}

function init {
  # ROOT_TOKEN=$(vault operator init -address="http://vault:8333" -format json | jq -r '.root_token')
  ROOT=$(retry \
  "vault operator init -format json" \
  "Trying to initialize vault")
  echo "$ROOT" | jq -r '.root_token'
}

echo "******************************* Running the vault start script *******************************"

apk update \
 && cp /usr/share/zoneinfo/America/Chicago /etc/localtime \
 && echo "America/Chicago" > /etc/timezone \
 && apk add jq curl

vault server -config=/config/config.hcl &
# vault server dev
ROOT_TOKEN=$(init)
export VAULT_ADDR=http://vault:8200
vault login $ROOT_TOKEN

echo "******************************* Creating default secret store *******************************"
vault secrets enable -version=2 -path=kv/$ORG_ID kv


echo "******************************* Enabling and Configuring JWT auth method *******************************"
vault auth enable jwt
vault write auth/jwt/config \
         jwks_url="https://naesb.us.auth0.com/.well-known/jwks.json" \
         bound_issuer="https://naesb.us.auth0.com/"
echo "******************************* Setting up default reader role in vault *******************************"
vault write auth/jwt/role/reader -<<EOF
{
      "role_type": "jwt",
      "policies": "reader",
      "bound_audiences": "https://naesb.us.auth0.com/api/v2/",
      "user_claim": "sub",
      "verbose_oidc_logging": true,
      "ttl": "1h",
      "claim_mappings": { "org_id": "organization" }
}
EOF
JWT_ACCESSOR=$(vault auth list -format=json | jq -r '.["jwt/"].accessor')

vault policy write "reader" -<<EOF
# Enable key/value secrets engine at the naesb path
path "sys/mounts/kv/*" {
  capabilities = [ "update" ]
}

# Write and manage secrets in key/value secrets engine
path "kv/{{identity.entity.aliases.$JWT_ACCESSOR.metadata.organization}}/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# List enabled secrets engine
path "sys/mounts" {
  capabilities = [ "read", "list","create","update","sudo" ]
}

path "sys/mounts/*" {
  capabilities = [ "read", "list" ]
}

# Work with pki secrets engine
path "{{identity.entity.aliases.$JWT_ACCESSOR.metadata.organization}}/*" {
  capabilities = [ "create", "read", "update", "delete", "list"]
}
EOF

vault policy write "node" -<<EOF
# Write and manage secrets in key/value secrets engine
path "kv/$ORG_ID/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# List enabled secrets engine
path "sys/mounts" {
  capabilities = [ "read", "list","create","update","sudo" ]
}

path "sys/mounts/*" {
  capabilities = [ "read", "list","create","update","sudo" ]
}

# Work with pki secrets engine
path "org_Zq88NZfnjTsOu2II/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}

# Work with pki secrets engine
path "org_N3LsIPXJkZqD5QD4/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}

# Work with pki secrets engine
path "org_ZVg6j5mzxBltGrJJ/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}

# Work with pki secrets engine
path "org_5bxHHug4Gu0kk5tR/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}
EOF

echo "******************************* Enabling AWS Auth *******************************"
vault auth enable aws
vault write auth/aws/role/dev-naesbdlt-vault-user-role auth_type=iam bound_iam_principal_arn=$AWS_PRINCIPAL policies=node ttl=24h max_ttl=48h


echo "******************************* Generating Identity CA *******************************"
# vault secrets enable -path=$ORG_ID/msp pki
# vault secrets tune -max-lease-ttl=87600h $ORG_ID/msp
# MSP_CA_CERT=$(vault write -field=certificate $ORG_ID/msp/root/generate/internal \
#       common_name=$COMMON_NAME \
#       key_type=ec \
#       key_bits=256 \
#       ttl=87600h)
# vault write $ORG_ID/msp/config/urls \
#       issuing_certificates="$VAULT_ADDR/v1/$ORG_ID/msp/ca" \
#       crl_distribution_points="$VAULT_ADDR/v1/$ORG_ID/msp/crl"

# vault write $ORG_ID/msp/roles/reader \
#      allowed_domains=$ORG_NAME.$COMMON_NAME \
#      allow_subdomains=true \
#       key_type=ec \
#       key_bits=256 \
#      max_ttl="72000h"
     
# vault write $ORG_ID/msp/roles/orderer \
#      allowed_domains=$COMMON_NAME \
#      allow_subdomains=true \
#        key_type=ec \
#       key_bits=256 \
#      max_ttl="72000h"

# TODO: Make sure that I clean up the roles, should be a standard reader role and an admin role
sleep infinity