#!/bin/bash

set -e

# Send the log output from this script to user-data.log, syslog, and the console
# From: https://alestic.com/2010/12/ec2-user-data-output/
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
sudo tee /opt/aws/amazon-cloudwatch-agent/bin/config.json<<EOF
{
  "agent": {
    "run_as_user": "root"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}-system"
          },
          {
            "file_path": "/var/log/vault_audit.log",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}-audit"
          }
        ]
      }
    }
  }
}
EOF
sudo apt -y install jq
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s
readonly VAULT_TLS_CERT_FILE="/opt/vault/tls/vault.crt.pem"
readonly VAULT_TLS_KEY_FILE="/opt/vault/tls/vault.key.pem"
if [[ "${enable_gossip_encryption}" == "true" ]]; then
  GOSSIP_KEY=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${gossip_encryption_key_arn} --query SecretString --output text)
  echo $GOSSIP_KEY > /var/log/echoSecret.txt
  gossip_encryption_configuration="--enable-gossip-encryption --gossip-encryption-key $GOSSIP_KEY"
fi

if [[ "${enable_rpc_encryption}" == "true" && ! -z "${ca_path}" && ! -z "${cert_file_path}" && ! -z "${key_file_path}" ]]; then
  rpc_encryption_configuration="--enable-rpc-encryption --ca-path ${ca_path} --cert-file-path ${cert_file_path} --key-file-path ${key_file_path}"
fi
# The cluster_tag variables below are filled in via Terraform interpolation
/opt/consul/bin/run-consul --client  --datacenter dc1 --cluster-tag-key "${consul_cluster_tag_key}" --cluster-tag-value "${consul_cluster_tag_value}" $gossip_encryption_configuration $rpc_encryption_configuration

/opt/vault/bin/run-vault \
  --tls-cert-file "$VAULT_TLS_CERT_FILE" \
  --tls-key-file "$VAULT_TLS_KEY_FILE" \
  --enable-auto-unseal \
  --auto-unseal-kms-key-id "${kms_key_id}" \
  --auto-unseal-kms-key-region "${aws_region}"

sudo tee /opt/vault/config/reader.hcl<<EOF
# Enable key/value secrets engine at the naesb path
path "sys/mounts/kv/*" {
  capabilities = [ "update" ]
}

# Write and manage secrets in key/value secrets engine
path "kv/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# enable secrets engine
path "sys/mounts/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# List enabled secrets engine
path "sys/mounts" {
  capabilities = [ "read", "list" ]
}


# Create policies to permit apps to read secrets
path "sys/policies/acl/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# Create tokens for verification & test
path "auth/token/create" {
  capabilities = [ "create", "update", "sudo" ]
}

# Work with pki secrets engine
path "naesb*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo" ]
}
EOF

# When you ssh to one of the instances in the vault cluster and initialize the server
# You will notice it will now boot unsealed
function log {
 local -r message="$1"
 local -r timestamp=$(date +"%Y-%m-%d %H:%M:%S")
 >&2 echo -e "$timestamp $message"
}


function retry {
  local -r cmd="$1"
  local -r description="$2"

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
  "/opt/vault/bin/vault operator init -format json" \
  "Trying to initialize vault")
  echo "$ROOT" | jq -r '.root_token'
}


log "intializing vault..."
ROOT_TOKEN=$(init)
sleep 40
vault login -no-print $ROOT_TOKEN



vault secrets enable -path="secrets" kv

# Enable JWT Authentication
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

path "secrets/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "kv/secrets/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "kv/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
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
path "kv/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "secrets/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "kv/secrets/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

path "sys/mounts/*" {
  capabilities = [ "create", "read", "update", "delete", "list" ]
}

# List enabled secrets engine
path "sys/mounts" {
  capabilities = [ "read", "list" ]
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
path "org_fpKvMZIpYNRTAABP/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}

# Work with pki secrets engine
path "org_5bxHHug4Gu0kk5tR/*" {
  capabilities = [ "create", "read", "update", "delete", "list", "sudo"]
}
EOF

echo "******************************* Enabling AWS Auth *******************************"
vault auth enable aws
vault write auth/aws/role/${peer_role_name} auth_type=iam bound_iam_principal_arn="${aws_principal}" policies=node ttl=24h max_ttl=48h

sudo touch /var/log/vault_audit.log
sudo chown -R vault:vault /var/log
sudo chown vault:vault /var/log/vault_audit.log
sudo chmod 600 /var/log/vault_audit.log
vault audit enable file file_path=/var/log/vault_audit.log