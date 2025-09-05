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

module "broker" {
  source = "./modules/broker"
  app    = local.app
  owner  = local.owner
  name   = "${local.owner}-${local.app}"

  vpc_id              = var.vpc_id
  subnet_ids          = [var.private_subnet_ids[0], var.private_subnet_ids[1]]
  allowed_cidr_blocks = concat(var.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
}

