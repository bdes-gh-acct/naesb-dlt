#!/bin/bash
# This script is meant to be run in the User Data of each EC2 Instance while it's booting. The script uses the
# run-consul script to configure and start Consul in client mode and then the run-vault script to configure
# the auto unsealing on server init


set -e

readonly EC2_INSTANCE_METADATA_URL="http://169.254.169.254/latest/meta-data"

function get_imds_v2_token {
  curl --silent --show-error --fail --retry 3 \
    -X PUT "http://169.254.169.254/latest/api/token" \
    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
}

function lookup_path_in_instance_metadata {
  local -r path="$1"
  local -r token=$(get_imds_v2_token)

  curl --silent --show-error \
    -H "X-aws-ec2-metadata-token: $token" \
    --location "$EC2_INSTANCE_METADATA_URL/$path/"
}

function get_instance_ip_address {
  lookup_path_in_instance_metadata "local-ipv4"
}

function getContainerLogs {
  container_names=$(docker ps -a --filter "name=dev-peer0.peer-naesb.naesb.com-NAESB_SMART_TRADE_CONTRACT*" --format '{{.Names}}')
  echo $container_names
  if ( ! docker logs $container_names ); then
  echo "bad_command flagged an error."
fi
  
}

function get_instance_id {
  lookup_path_in_instance_metadata "instance-id"
}

instance_ip_address=$(get_instance_ip_address)
ec2_instance_id=$(get_instance_id)

# Send the log output from this script to user-data.log, syslog, and the console
# From: https://alestic.com/2010/12/ec2-user-data-output/
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

# Wait until dpkg lock is released
echo "Waiting for dpkg lock to be released..."
while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || sudo fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do
  sleep 1
done


MAX_ATTEMPTS=10
SLEEP_TIME=5
ATTEMPT=1

while ! sudo apt-get update -y; do
  if [ "$ATTEMPT" -ge "$MAX_ATTEMPTS" ]; then
    echo "apt-get update failed after $MAX_ATTEMPTS attempts. Exiting."
    exit 1
  fi

  echo "apt-get update failed, possibly due to lock. Attempt $ATTEMPT/$MAX_ATTEMPTS. Retrying in $SLEEP_TIME seconds..."
  sleep "$SLEEP_TIME"
  ATTEMPT=$((ATTEMPT + 1))
done

# Wait until dpkg lock is released
echo "Waiting for dpkg lock to be released..."
while sudo fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1 || sudo fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do
  sleep 1
done
sudo apt-get install -y curl gnupg software-properties-common apt-transport-https jq unzip docker.io docker-compose dnsmasq

curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

mkdir -p /var/log/consul
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
            "log_stream_name": "{instance_id}"
          },     
          {
            "file_path": "/var/log/consul/*",
            "log_group_name": "${log_group_name}",
            "log_stream_name": "{instance_id}-consul"
          }
        ]
      }
    }
  }
}
EOF
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

# echo "Configuring Docker to use local DNSMasq for DNS resolution (Enabling *.service.consul resolutions inside containers)"
# sudo tee /etc/docker/daemon.json <<EOF
# {
#   "dns": ["169.254.1.1"]
# }
# EOF


echo "*********************************** creating dummy address ***********************************************"
# sudo mkdir -p /etc/systemd/resolved.conf.d
# cat << EOF >/etc/systemd/resolved.conf.d/consul.conf
# [Resolve]
# DNS=127.0.0.1:8600
# DNSSEC=false
# Domains=~consul
# DNSStubListener=yes
# DNSStubListenerExtra=169.254.1.1
# EOF

# systemctl restart systemd-resolved

# systemctl is-active systemd-resolved

# resolvectl domain

# resolvectl query consul.service.consul
# mkdir /etc/systemd/network/
cat << EODMCF >/etc/systemd/network/dummy0.netdev
[NetDev]
Name=dummy0
Kind=dummy
EODMCF

cat << EODMCF >/etc/systemd/network/dummy0.network
[Match]
Name=dummy0

[Network]
Address=169.254.1.1/32
EODMCF

if [ -z "${vpc_cidr_dns}" ]; then
  vpc_cidr_dns=""
fi

echo "Creating DNS server with VPC IDs"

sudo tee /etc/dnsmasq.d/consul.conf > /dev/null <<EOF
server=/consul/169.254.1.1#8600
listen-address=127.0.0.1
listen-address=169.254.1.1
${vpc_cidr_dns}
EOF


# sudo tee /etc/dnsmasq.d/consul.conf <<EOF
# server=/consul/169.254.1.1#8600
# listen-address=127.0.0.1
# listen-address=169.254.1.1
# EOF

sudo systemctl restart systemd-networkd

echo "Waiting for dummy0 interface to be ready..."
for i in {1..10}; do
  if ip a show dummy0 | grep -q '169.254.1.1'; then
    echo "dummy0 is up."
    break
  fi
  echo "dummy0 not ready yet... retrying in 1s"
  sleep 1
done

sudo systemctl restart dnsmasq.service
sudo systemctl enable dnsmasq.service


echo "*********************************** configuring docker ***********************************************"

systemctl restart systemd-resolved

sudo service docker start
sudo usermod -a -G docker ubuntu
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

sudo systemctl start docker
sudo systemctl enable docker

# Wait for Docker daemon to be up
until docker info >/dev/null 2>&1; do
    echo "Waiting for Docker to start..."
    sleep 2
done

# sudo mkdir --parents /etc/consul.d
# sudo touch /etc/consul.d/consul.hcl
# sudo chown --recursive consul:consul /etc/consul.d
# sudo chmod 640 /etc/consul.d/consul.hcl
CONSUL_CACERT=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${consul_server_ca_cert_arn} --query SecretString --output text)
mkdir -p /opt/consul/tls
echo "$CONSUL_CACERT" > /opt/consul/tls/consul-ca-cert.pem
aws s3api get-object --bucket ${compose_bucket} --key ${compose_key} docker-compose.yaml
mkdir /tmp/nginx
aws s3api get-object --bucket ${compose_bucket} --key ${nginx_key} /tmp/nginx/nginx.conf

echo "*********************************** configuring consul ***********************************************"

mkdir /etc/consul.d

org=$org_name
org_id=$org_id
org_name=$org_name
sudo tee /opt/consul/config/my-consul.hcl &>/dev/null <<EOF
services {
  id      = "ca-${org_name}"
  name    = "ca-${org_name}"
  tags = ["${org_id}"]
  port    = 8080
  check {
    name     = "${org_name} CA Operations Health"
    http = "http://localhost:8080/api/ca/v1/health"
    interval = "5s"
    timeout  = "1s"
    failures_before_critical = 3
  }
}

services {
  id      = "peer-${org_name}"
  tags = ["${peer_id}","${org_id}"],
  name    = "peer-${org_name}"
  port    = 9051
  check {
    name     = "${peer_id} Operations Health"
    http = "http://localhost:9043/healthz"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}

services {
  id      = "ledger-${org_name}"
  name    = "ledger-${org_name}"
  tags = ["${org_id}"]
  port    = 8081
  check {
    name     = "${org_name} Ledger API Health"
    http = "http://localhost:8081/api/ledger/v1/health"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}

services {
  id      = "aries-admin-${org_name}"
  name    = "aries-admin-${org_name}"
  tags = ["${org_id}"]
  port    = ${acapy_admin_port}
  check {
    name     = "${org_name} Aries Admin API Health"
    http = "http://localhost:${acapy_admin_port}/status"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}

services {
  id      = "acapy-${org_name}"
  name    = "acapy-${org_name}"
  tags = ["${org_id}"]
  port    = ${acapy_service_port}
  check {
    name     = "${org_name} Acapy Service Health"
    http = "http://localhost:${acapy_admin_port}/status"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}

services {
  id      = "aries-${org_name}"
  name    = "aries-${org_name}"
  tags = ["${org_id}"]
  port    = ${acapy_service_port}
  check {
    name     = "${org_name} Aries Service API Health"
    http = "http://localhost:8085/api/agent/v1/health"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}
EOF

if [[ "${org_name}" == "naesb" ]]; then
sudo tee /opt/consul/config/admin-consul.hcl &>/dev/null <<EOF
services {
  id      = "orderer-${org_name}"
  name    = "orderer-${org_name}"
  port    = 7050
  tags = ["${org_id}","${orderer_id}"]
  check {
    name     = "${org_name} Orderer Operations Health"
    http = "http://localhost:8443/healthz"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}

services {
  id      = "admin"
  name    = "admin"
  port    = 8083
  tags = ["${org_id}"]
  check {
    name     = "${org_name} Admin API Health"
    http = "http://localhost:8083/api/admin/v1/health"
    interval = "5s"
    timeout  = "10s"
    failures_before_critical = 3
  }
}
EOF
fi

# export VAULT_ROLE=${aws_principal}
export DOMAIN="naesbdlt.org"
aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${docker_registry_address}
echo "*********************************** starting consul ***********************************************"
if [[ "${enable_gossip_encryption}" == "true" ]]; then
  GOSSIP_KEY=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${gossip_encryption_key_arn} --query SecretString --output text)
  echo $GOSSIP_KEY > /var/log/echoSecret.txt
  gossip_encryption_configuration="--enable-gossip-encryption --gossip-encryption-key $GOSSIP_KEY"
fi

if [[ "${enable_rpc_encryption}" == "true" && ! -z "${ca_path}" && ! -z "${cert_file_path}" && ! -z "${key_file_path}" ]]; then
  rpc_encryption_configuration="--enable-rpc-encryption --ca-path ${ca_path} --cert-file-path ${cert_file_path} --key-file-path ${key_file_path}"
fi
/opt/consul/bin/run-consul --client  --datacenter dc1 --cluster-tag-key "${consul_cluster_tag_key}" --cluster-tag-value "${consul_cluster_tag_value}" $gossip_encryption_configuration $rpc_encryption_configuration

mkdir /tmp/user
echo "*********************************** initializing vault agent ***********************************************"
COMPOSE_PROFILES="--profile peer"
echo "First Test"
if [[ "${admin}" == "true"  ]]; then
  COMPOSE_PROFILES="--profile peer --profile admin"
fi
echo "Second Test"
DB_PASSWORD=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${db_password_arn} --query SecretString --output text)
echo "Third Test"
echo $DOCKER_HOST

# TODO try running without dns, then try network host mode
sudo tee .env &>/dev/null <<EOF
ACAPY_ADMIN_PORT=${acapy_admin_port}
ACAPY_ENDPOINT=${site_url}
ACAPY_GENESIS_URL='${pool_url}/genesis'
ACAPY_LABEL=${agent_label}
ACAPY_PROFILE_ENDPOINT='${profile_url}'
ACAPY_SERVICE_PORT=${acapy_service_port}
ACAPY_TAILS_SERVER_BASE_URL=${tails_url}
ACAPY_WALLET_NAME=${org_name}_wallet
BOOTSTRAP_DID=${bootstrap_did}
CA_ADDRESS=http://ca:8080
COUCHDB_PASSWORD=do_not_use_this
COUCHDB_USERNAME=couchdb
DB_DATABASE=${org_name}
DB_HOST=${db_host}
DOCKERHOST='172.17.0.1'
DOMAIN=${domain}
IDENTITY_CLIENT_ID=3X8zaHSVELt3LYFED54Dq6bc2xRn2NKR
IDENTITY_DOMAIN=naesb.us.auth0.com
IDENTITY_SECRET_ID=uZEYOvNzZ9Cm9GEIj3sXFt6iW4becVUB6T33XZ2ExUd_mv4bmGUzN6dbh4ZiGPo7
INDY_ROLE=${indy_role}
INSTANCE_ADDRESS=$instance_ip_address
INSTANCE_ID=$ec2_instance_id
LOG_GROUP=${log_group_name}
MSP_ID=${msp_id}
ORDERER_ID=${orderer_id}
BOOTSTRAP_BROKERS=${bootstrap_brokers}
ORG_ID=${org_id}
ORG_NAME=${org_name}
PEER_ID=${peer_id}
POOL_URL=${pool_url}
PRICE_API_URL='http://price.naesbdlt.org:8080/api/price/v1'
TOKEN_AUDIENCE=https://naesb.us.auth0.com/api/v2/
TOKEN_ISSUER_URL=https://naesb.us.auth0.com/
VAULT_ADDR=https://vault.service.consul:8200
VAULT_CACERT=/opt/vault/tls/ca.crt.pem
VAULT_ROLE=${role_name}
REGISTRY_ADDRESS=${registry_address}
GENESIS_URL=${genesis_url}
VAULT_TLS=true
EOF

indy_seed=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${agent_seed_secret_arn} --query SecretString --output text)
export DB_PASSWORD=$DB_PASSWORD
export ACAPY_WALLET_SEED=$indy_seed

docker-compose --env-file .env -p peer config
docker-compose --env-file .env -p peer $COMPOSE_PROFILES up -d --quiet-pull
# while true; do docker container ls -a --format='{{.Names}}: {{.State}}'; sleep 10; done
while true; do getContainerLogs; sleep 10; done

