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

module "db" {
  source = "./modules/db"
  app    = local.app
  owner  = local.owner
  name   = "${local.owner}-${local.app}"
  tags = {
    owner = local.owner
    app   = local.app
  }
  engine      = "aurora-postgresql"
  engine_mode = "provisioned"
  instance_class = "db.serverless"
  storage_encrypted               = true
  db_subnet_group_name            = "${local.owner}-${local.app}-db"
  vpc_id                          = var.vpc_id
  subnet_ids                      = var.private_subnet_ids
  allowed_cidr_blocks             = concat(var.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
  monitoring_interval             = 60
  apply_immediately               = true
  skip_final_snapshot             = true
  db_parameter_group_name         = aws_db_parameter_group.this.id
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.this.id
  # enabled_cloudwatch_logs_exports = # NOT SUPPORTED
  create_random_password = false
  s3_bucket              = aws_s3_bucket.this.id
  master_password        = random_password.password.result
  #  scaling_configuration = {
  #    auto_pause               = true
  #    min_capacity             = 2
  #    max_capacity             = 16
  #    seconds_until_auto_pause = 300
  #    timeout_action           = "ForceApplyCapacityChange"
  #  }
  serverlessv2_scaling_configuration = {
    min_capacity             = 2
    max_capacity             = 16
    #seconds_until_auto_pause = 300
  }
}

resource "aws_db_parameter_group" "this" {
  name        = "${local.owner}-${local.app}-aurora-db-postgres-parameter-group"
  family      = "aurora-postgresql16"
  description = "${local.owner}-${local.app}-aurora-db-postgres-parameter-group"
  tags = {
    owner = local.owner
    app   = local.app
  }
}

resource "aws_rds_cluster_parameter_group" "this" {
  name        = "${local.owner}-${local.app}-aurora-postgres-cluster-parameter-group"
  family      = "aurora-postgresql16"
  description = "${local.owner}-${local.app}-aurora-postgres-cluster-parameter-group"
  tags = {
    owner = local.owner
    app   = local.app
  }
}

resource "random_password" "password" {
  length  = 16
  special = false
}

resource "aws_secretsmanager_secret" "password_key" {
  name                    = "${local.app}-${local.owner}-db"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "password_key" {
  secret_id     = aws_secretsmanager_secret.password_key.id
  secret_string = random_password.password.result
}

resource "aws_s3_bucket" "this" {
  bucket = "${local.owner}-${local.app}-db-deployment-resources"
  acl    = "private"

  tags = {
    Name  = "${local.owner}-${local.app}-db-deployment-resources"
    owner = local.owner
    app   = local.app
  }
  versioning {
    enabled = true
  }
}

