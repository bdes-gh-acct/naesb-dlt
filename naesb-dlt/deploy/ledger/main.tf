locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-dlt"
  domain = "naesbdlt.org"
}

data "terraform_remote_state" "consul" {
  backend = "s3"
  config = {
    bucket  = "naesb-dlt-deploy"
    region  = "us-east-1"
    profile = "naesb"
    key     = "consul-vault/env/${terraform.workspace}/global.tfstate"
  }
}

data "terraform_remote_state" "db" {
  backend = "s3"
  config = {
    bucket  = "naesb-dlt-deploy"
    region  = "us-east-1"
    profile = "naesb"
    key     = "db/env/${terraform.workspace}/global.tfstate"
  }
}

data "terraform_remote_state" "broker" {
  backend = "s3"
  config = {
    bucket  = "naesb-dlt-deploy"
    region  = "us-east-1"
    profile = "naesb"
    key     = "broker/env/${terraform.workspace}/global.tfstate"
  }
}

module "naesb-ca" {
  source                      = "./modules/ledger-ca"
  admin                       = true
  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  app                         = local.app
  bucket_id                   = aws_s3_bucket.this.id
  bootstrap_brokers           = data.terraform_remote_state.broker.outputs.bootstrap_brokers
  ca_key_secret_arn           = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key             = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value           = data.terraform_remote_state.consul.outputs.cluster_tag_value
  compose_key                 = aws_s3_bucket_object.this.key
  consul_security_group_id    = data.terraform_remote_state.consul.outputs.security_group_id
  db_host                     = data.terraform_remote_state.db.outputs.cluster_endpoint
  db_password_arn             = data.terraform_remote_state.db.outputs.db_secret_arn
  domain                      = local.domain
  gossip_key_secret_arn       = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  indy_role                   = "STEWARD"
  label                       = "NAESB"
  msp_id                      = "D000000000"
  nginx_key                   = aws_s3_bucket_object.nginx.key
  org_id                      = "org_Zq88NZfnjTsOu2II"
  org_name                    = "naesb"
  owner                       = local.owner
  role_id                     = data.terraform_remote_state.consul.outputs.peer_role_id
  role_name                   = data.terraform_remote_state.consul.outputs.peer_role_name
  seed                        = "bw7kLcQ+L80tq8lwk+QosmbyHawwyvx8"
  subnet_ids                  = data.terraform_remote_state.consul.outputs.public_subnet_ids
  vpc_id                      = data.terraform_remote_state.consul.outputs.vpc_id
}

module "tva-ca" {
  source                      = "./modules/ledger-ca"
  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  app                         = local.app
  bootstrap_brokers           = data.terraform_remote_state.broker.outputs.bootstrap_brokers
  bucket_id                   = aws_s3_bucket.this.id
  ca_key_secret_arn           = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key             = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value           = data.terraform_remote_state.consul.outputs.cluster_tag_value
  compose_key                 = aws_s3_bucket_object.this.key
  consul_security_group_id    = data.terraform_remote_state.consul.outputs.security_group_id
  db_host                     = data.terraform_remote_state.db.outputs.cluster_endpoint
  db_password_arn             = data.terraform_remote_state.db.outputs.db_secret_arn
  domain                      = local.domain
  gossip_key_secret_arn       = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  indy_role                   = "ENDORSER"
  label                       = "TVA"
  msp_id                      = "D001883032"
  nginx_key                   = aws_s3_bucket_object.nginx.key
  org_id                      = "org_ZVg6j5mzxBltGrJJ"
  org_name                    = "tva"
  owner                       = local.owner
  role_id                     = data.terraform_remote_state.consul.outputs.peer_role_id
  role_name                   = data.terraform_remote_state.consul.outputs.peer_role_name
  seed                        = "77zStCIpojgAHqhfLQhOy31qRmJLRpCl"
  subnet_ids                  = data.terraform_remote_state.consul.outputs.public_subnet_ids
  vpc_id                      = data.terraform_remote_state.consul.outputs.vpc_id
}

module "spire-ca" {
  source                      = "./modules/ledger-ca"
  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  app                         = local.app
  bootstrap_brokers           = data.terraform_remote_state.broker.outputs.bootstrap_brokers
  bucket_id                   = aws_s3_bucket.this.id
  ca_key_secret_arn           = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key             = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value           = data.terraform_remote_state.consul.outputs.cluster_tag_value
  compose_key                 = aws_s3_bucket_object.this.key
  consul_security_group_id    = data.terraform_remote_state.consul.outputs.security_group_id
  db_host                     = data.terraform_remote_state.db.outputs.cluster_endpoint
  db_password_arn             = data.terraform_remote_state.db.outputs.db_secret_arn
  domain                      = local.domain
  gossip_key_secret_arn       = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  indy_role                   = "ENDORSER"
  label                       = "Spire"
  msp_id                      = "D188779862"
  nginx_key                   = aws_s3_bucket_object.nginx.key
  org_id                      = "org_N3LsIPXJkZqD5QD4"
  org_name                    = "spire"
  owner                       = local.owner
  role_id                     = data.terraform_remote_state.consul.outputs.peer_role_id
  role_name                   = data.terraform_remote_state.consul.outputs.peer_role_name
  seed                        = "ggLvjdtGngQkSuDBmqVyNl7lNe7yTm1g"
  subnet_ids                  = data.terraform_remote_state.consul.outputs.public_subnet_ids
  vpc_id                      = data.terraform_remote_state.consul.outputs.vpc_id
}

module "miq-ca" {
  source                      = "./modules/ledger-ca"
  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  app                         = local.app
  bootstrap_brokers           = data.terraform_remote_state.broker.outputs.bootstrap_brokers
  bucket_id                   = aws_s3_bucket.this.id
  ca_key_secret_arn           = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key             = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value           = data.terraform_remote_state.consul.outputs.cluster_tag_value
  compose_key                 = aws_s3_bucket_object.this.key
  consul_security_group_id    = data.terraform_remote_state.consul.outputs.security_group_id
  db_host                     = data.terraform_remote_state.db.outputs.cluster_endpoint
  db_password_arn             = data.terraform_remote_state.db.outputs.db_secret_arn
  domain                      = local.domain
  gossip_key_secret_arn       = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  indy_role                   = "ENDORSER"
  label                       = "MiQ"
  msp_id                      = "D111111111"
  nginx_key                   = aws_s3_bucket_object.nginx.key
  org_id                      = "org_fpKvMZIpYNRTAABP"
  org_name                    = "miq"
  owner                       = local.owner
  role_id                     = data.terraform_remote_state.consul.outputs.peer_role_id
  role_name                   = data.terraform_remote_state.consul.outputs.peer_role_name
  seed                        = "wn7N5NSPzSS09nAi8atVKNcMQBMjuRxQ"
  subnet_ids                  = data.terraform_remote_state.consul.outputs.public_subnet_ids
  vpc_id                      = data.terraform_remote_state.consul.outputs.vpc_id
}


module "eqt-ca" {
  source                      = "./modules/ledger-ca"
  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  app                         = local.app
  bootstrap_brokers           = data.terraform_remote_state.broker.outputs.bootstrap_brokers
  bucket_id                   = aws_s3_bucket.this.id
  ca_key_secret_arn           = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key             = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value           = data.terraform_remote_state.consul.outputs.cluster_tag_value
  compose_key                 = aws_s3_bucket_object.this.key
  consul_security_group_id    = data.terraform_remote_state.consul.outputs.security_group_id
  db_host                     = data.terraform_remote_state.db.outputs.cluster_endpoint
  db_password_arn             = data.terraform_remote_state.db.outputs.db_secret_arn
  domain                      = local.domain
  gossip_key_secret_arn       = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  indy_role                   = "ENDORSER"
  label                       = "EQT"
  msp_id                      = "D272727272"
  nginx_key                   = aws_s3_bucket_object.nginx.key
  org_id                      = "org_5bxHHug4Gu0kk5tR"
  org_name                    = "eqt"
  owner                       = local.owner
  role_id                     = data.terraform_remote_state.consul.outputs.peer_role_id
  role_name                   = data.terraform_remote_state.consul.outputs.peer_role_name
  seed                        = "MzEPfpHEoi2yC2U/2yvt0SZOB49y3NxY"
  subnet_ids                  = data.terraform_remote_state.consul.outputs.public_subnet_ids
  vpc_id                      = data.terraform_remote_state.consul.outputs.vpc_id
}


module "consul_iam_policies_servers" {
  source      = "github.com/hashicorp/terraform-aws-consul.git//modules/consul-iam-policies?ref=v0.8.0"
  iam_role_id = data.terraform_remote_state.consul.outputs.peer_role_id
}

resource "aws_s3_bucket" "this" {
  bucket        = "${local.owner}-${local.app}-deployment-resources"
  acl           = "private"
  force_destroy = true
  tags = {
    Name  = "${local.owner}-${local.app}-deployment-resources"
    owner = local.owner
    app   = local.app
  }
}

resource "aws_s3_bucket_object" "this" {
  bucket = aws_s3_bucket.this.id
  key    = "${local.owner}-${local.app}-ca"
  source = "${path.module}/docker-compose.yaml"

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5("${path.module}/docker-compose.yaml")
}

resource "aws_s3_bucket_object" "nginx" {
  bucket = aws_s3_bucket.this.id
  key    = "${local.owner}-${local.app}-nginx-conf"
  source = "${path.module}/nginx.conf"

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5("${path.module}/nginx.conf")
  tags = {
    owner = local.owner
    app   = local.app
  }
}
