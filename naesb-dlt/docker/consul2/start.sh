#!/bin/sh

readonly EC2_INSTANCE_METADATA_URL="http://169.254.169.254/latest/meta-data"

ECS_IPV4=$(curl -s $ECS_CONTAINER_METADATA_URI_V4 | jq -r '.Networks[0].IPv4Addresses[0]')

function lookup_path_in_instance_metadata {
  local -r path="$1"
  curl --silent --show-error --location "$EC2_INSTANCE_METADATA_URL/$path/"
}

function get_instance_ip_address {
  lookup_path_in_instance_metadata "local-ipv4"
}

function get_instance_id {
  lookup_path_in_instance_metadata "instance-id"
}

mkdir -p /opt/consul/tls
echo "$CONSUL_CACERT_PEM" > /opt/consul/tls/consul-ca-cert.pem

echo "*********************************** configuring consul ***********************************************"

mkdir /etc/consul.d

tee /etc/consul.d/consul.hcl <<EOF
advertise_addr = "$ECS_IPV4"
client_addr = "0.0.0.0"
leave_on_terminate = true
auto_encrypt {
  tls = true
  ip_san = ["$ECS_IPV4"]
}
tls {
  defaults {
    verify_incoming = false
    ca_file = "/opt/consul/tls/consul-ca-cert.pem"
    verify_outgoing = true
  }
}
retry_join = [
    "provider=aws region=$AWS_REGION tag_key=$CLUSTER_TAG_KEY tag_value=$CLUSTER_TAG_VALUE"
]
EOF

echo "*********************************** starting consul ***********************************************"
# The cluster_tag variables below are filled in via Terraform interpolation
consul agent -dns-port=53 -recursor 8.8.8.8 -encrypt $CONSUL_GOSSIP_ENCRYPTION_KEY -config-file /etc/consul.d/consul.hcl -data-dir /consul/data -datacenter $CONSUL_DATACENTER