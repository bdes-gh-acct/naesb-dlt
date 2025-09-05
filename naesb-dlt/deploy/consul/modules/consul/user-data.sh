#!/bin/bash

set -e
# Send the log output from this script to user-data.log, syslog, and the console
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# These variables are passed in via Terraform template interplation
if [[ "${enable_gossip_encryption}" == "true" && ! -z "${gossip_encryption_key}" ]]; then
  # Note that setting the encryption key in plain text here means that it will be readable from the Terraform state file
  # and/or the EC2 API/console. We're doing this for simplicity, but in a real production environment you should pass an
  # encrypted key to Terraform and decrypt it before passing it to run-consul with something like KMS.
  gossip_encryption_configuration="--enable-gossip-encryption --gossip-encryption-key ${gossip_encryption_key}"
fi

if [[ "${enable_rpc_encryption}" == "true" && ! -z "${ca_path}" && ! -z "${cert_file_path}" && ! -z "${key_file_path}" ]]; then
  rpc_encryption_configuration="--enable-rpc-encryption --ca-path ${ca_path} --cert-file-path ${cert_file_path} --key-file-path ${key_file_path}"
fi

sudo tee /opt/consul/config/my-custom.json<<EOF
{
  "verify_incoming": true,
  "verify_outgoing": true,
  "verify_server_hostname": true,
  "auto_encrypt": {
    "allow_tls": true
  }
}
EOF

/opt/consul/bin/run-consul --server --datacenter dc1 --cluster-tag-key "${cluster_tag_key}" --cluster-tag-value "${cluster_tag_value}" $gossip_encryption_configuration $rpc_encryption_configuration