locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-registry"
  domain = "naesbdlt.org"
}

module "registry" {
  source     = "./modules/registry"
  owner      = local.owner
  domain     = local.domain
  app        = local.app
  vpc_id     = var.vpc_id
  subnet_ids = var.public_subnet_ids
  client_id = var.client_id
  client_secret = var.client_secret
}
