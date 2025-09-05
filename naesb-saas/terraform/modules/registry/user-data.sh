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

function get_public_ip_address {
  lookup_path_in_instance_metadata "public-ipv4"
}

function get_instance_id {
  lookup_path_in_instance_metadata "instance-id"
}

instance_ip_address=$(get_instance_ip_address)
public_ip_address=$(get_public_ip_address)
ec2_instance_id=$(get_instance_id)

# Send the log output from this script to user-data.log, syslog, and the console
# From: https://alestic.com/2010/12/ec2-user-data-output/
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1
sudo yum install -q -y amazon-cloudwatch-agent yum-utils consul docker dnsmasq systemd-networkd unzip jq
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

mkdir /tmp/certs
sudo curl -L https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem -o /tmp/certs/cert.pem

aws s3api get-object --bucket ${compose_bucket} --key ${compose_key} docker-compose.yaml
mkdir /tmp/nginx
aws s3api get-object --bucket ${compose_bucket} --key ${nginx_key} /tmp/nginx/nginx.conf

echo "*********************************** pulling images ***********************************************"
mkdir /tmp/user
$(aws ecr get-login --no-include-email --region ${aws_region})
sleep 30
echo "*********************************** initializing network ***********************************************"

DB_SECRET=$(aws secretsmanager get-secret-value --region ${aws_region} --secret-id ${db_secret_arn} --query SecretString --output text)
APP_DB_USERNAME=$(echo $DB_SECRET | jq -r ".username")
APP_DB_PASSWORD=$(echo $DB_SECRET | jq -r ".password")
APP_DB_PORT=$(echo $DB_SECRET | jq -r ".port")
APP_DB_HOST=$(echo $DB_SECRET | jq -r ".host")

sudo tee .env &>/dev/null <<EOF
LOG_GROUP=${log_group_name}
DOCKERHOST='172.17.0.1'
AUTH0_BASE_URL=${auth0_base_url}
CLIENT_ID=${client_id}
CLIENT_SECRET=${client_secret}
INSTANCE_ID=$ec2_instance_id
INSTANCE_ADDRESS=$instance_ip_address
IP=$public_ip_address
APP_DB_PORT=$APP_DB_PORT
APP_DB_HOST=$APP_DB_HOST
APP_DB_USERNAME=$APP_DB_USERNAME
APP_DB_PASSWORD=$APP_DB_PASSWORD
APP_DB_DATABASE='registry'
EOF
docker-compose -p naesb-registry up -d --quiet-pull

