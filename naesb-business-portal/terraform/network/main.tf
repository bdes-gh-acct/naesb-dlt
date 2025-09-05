locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-indy"
  domain = "naesbdlt.org"
}

module "ledger" {
  source     = "./modules/ledger"
  owner      = local.owner
  domain     = local.domain
  app        = local.app
  vpc_id     = var.vpc_id
  subnet_ids = var.public_subnet_ids
}
