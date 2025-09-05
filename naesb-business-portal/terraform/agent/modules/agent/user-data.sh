#!/bin/bash
# This script is meant to be run in the User Data of each EC2 Instance while it's booting. The script uses the
# run-consul script to configure and start Consul in client mode and then the run-vault script to configure
# the auto unsealing on server init
set -e

readonly EC2_INSTANCE_METADATA_URL="http://169.254.169.254/latest/meta-data"

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

instance_ip_address=$(get_instance_ip_address)
ec2_instance_id=$(get_instance_id)

# Send the log output from this script to user-data.log, syslog, and the console
# From: https://alestic.com/2010/12/ec2-user-data-output/
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
sudo yum install -q -y amazon-cloudwatch-agent yum-utils consul docker dnsmasq systemd-networkd unzip
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
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
          }
        ]
      }
    }
  }
}
EOF
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json -s

echo "*********************************** configuring docker ***********************************************"

sudo service docker start
sudo usermod -a -G docker ec2-user
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

aws s3api get-object --bucket ${compose_bucket} --key ${compose_key} docker-compose.yaml
mkdir /tmp/nginx
aws s3api get-object --bucket ${compose_bucket} --key ${nginx_key} /tmp/nginx/nginx.conf

indy_seed=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${agent_seed_secret_arn} --query SecretString --output text)

echo "*********************************** pulling images ***********************************************"
mkdir /tmp/user
$(aws ecr get-login --no-include-email --region ${aws_region})
sleep 30
echo "*********************************** initializing network ***********************************************"
sudo tee .env &>/dev/null <<EOF
ACAPY_ADMIN_PORT=6000
ACAPY_ENDPOINT=${site_url}
ACAPY_GENESIS_URL='${pool_url}/genesis'
ACAPY_LABEL=${agent_label}
ACAPY_PROFILE_ENDPOINT='${profile_url}/info'
ACAPY_SERVICE_PORT=10000
ACAPY_TAILS_SERVER_BASE_URL=${tails_url}
BOOTSTRAP_DID=${bootstrap_did}
DOCKERHOST='172.17.0.1'
INDY_ROLE=${indy_role}
INSTANCE_ADDRESS=$instance_ip_address
INSTANCE_ID=$ec2_instance_id
LOG_GROUP=${log_group_name}
POOL_URL=${pool_url}
EOF
export ACAPY_WALLET_SEED=$indy_seed

echo "*********************************** initializing docker-compose ***********************************************"

docker-compose -p indy-agent up -d --quiet-pull

