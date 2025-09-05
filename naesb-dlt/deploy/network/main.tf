locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-dlt"
  domain = "naesbdlt.org"
}

module "network" {
  source = "./modules/network"
  owner  = local.owner
  app    = local.app
}
