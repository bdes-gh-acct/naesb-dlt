#!/bin/sh

if [ ! -d "/opt/vault/tls/" ]; then
  mkdir -p "/opt/vault/tls/"
fi

if [ ! -d "/tmp/token" ]; then
  mkdir -p "/tmp/token"
fi

if [ ! -f "$VAULT_CACERT" ]; then
  echo "$VAULT_CACERT_PEM" > $VAULT_CACERT
fi

echo "$VAULT_CACERT_PEM" | grep "BEGIN CERTIFICATE" || echo "ERROR: VAULT_CACERT_PEM is empty or invalid"


ls -l "$VAULT_CACERT"
cat "$VAULT_CACERT"

env | grep VAULT

mkdir /tmp/config
tee /tmp/config/vault-agent.hcl &>/dev/null <<EOF
pid_file = "./pidfile"
auto_auth {
  method "aws" {
      mount_path = "auth/aws"
      config = {
          type = "iam"
          role = "$VAULT_ROLE"
      }
  }

  sink "file" {
      config = {
          path = "/tmp/token/vault-token-via-agent"
      }
  }
}

vault {
  address = "$VAULT_ADDR"
  ca_cert = "$VAULT_CACERT"
}
EOF

HEALTH=$(curl --cacert $VAULT_CACERT $VAULT_ADDR/v1/sys/health)
echo $HEALTH
sleep 10
vault agent -config=/tmp/config/vault-agent.hcl -log-level=debug -address=$VAULT_ADDR