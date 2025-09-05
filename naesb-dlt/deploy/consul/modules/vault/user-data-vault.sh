#!/bin/bash
# This script is meant to be run in the User Data of each EC2 Instance while it's booting. The script uses the
# run-consul script to configure and start Consul in client mode and then the run-vault script to configure
# the auto unsealing on server init


set -e

# Send the log output from this script to user-data.log, syslog, and the console
# From: https://alestic.com/2010/12/ec2-user-data-output/
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# The Packer template puts the TLS certs in these file paths
readonly VAULT_TLS_CERT_FILE="/opt/vault/tls/vault.crt.pem"
readonly VAULT_TLS_KEY_FILE="/opt/vault/tls/vault.key.pem"
if [[ "${enable_gossip_encryption}" == "true" ]]; then
  # Note that setting the encryption key in plain text here means that it will be readable from the Terraform state file
  # and/or the EC2 API/console. We're doing this for simplicity, but in a real production environment you should pass an
  # encrypted key to Terraform and decrypt it before passing it to run-consul with something like KMS.
  GOSSIP_KEY=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${gossip_encryption_key_arn} --query SecretString --output text)
  echo $GOSSIP_KEY > /var/log/echoSecret.txt
  gossip_encryption_configuration="--enable-gossip-encryption --gossip-encryption-key $GOSSIP_KEY"
fi

if [[ "${enable_rpc_encryption}" == "true" && ! -z "${ca_path}" && ! -z "${cert_file_path}" && ! -z "${key_file_path}" ]]; then
  rpc_encryption_configuration="--enable-rpc-encryption --ca-path ${ca_path} --cert-file-path ${cert_file_path} --key-file-path ${key_file_path}"
fi

# The cluster_tag variables below are filled in via Terraform interpolation
/opt/consul/bin/run-consul --client --datacenter dc1 --cluster-tag-key "${consul_cluster_tag_key}" --cluster-tag-value "${consul_cluster_tag_value}" $gossip_encryption_configuration $rpc_encryption_configuration

/opt/vault/bin/run-vault \
  --tls-cert-file "$VAULT_TLS_CERT_FILE" \
  --tls-key-file "$VAULT_TLS_KEY_FILE" \
  --enable-auto-unseal \
  --auto-unseal-kms-key-id "${kms_key_id}" \
  --auto-unseal-kms-key-region "${aws_region}"

# When you ssh to one of the instances in the vault cluster and initialize the server
# You will notice it will now boot unsealed
# /opt/vault/bin/vault operator init
# /opt/vault/bin/vault status
#
# If the enterprise license isn't applied, it will however reseal after 30 minutes
# This is how you apply the license, please note that the VAULT_TOKEN environment
# variable needs to be set with the root token obtained when you initialized the server
# /opt/vault/bin/vault write /sys/license "text=<vault_enterprise_license_key>"