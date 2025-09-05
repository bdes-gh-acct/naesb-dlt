provider "aws" {
  region  = "us-east-1"
  profile = var.profile
}

terraform {
  backend "s3" {
    encrypt              = true
    bucket               = "naesb-dlt-deploy"
    dynamodb_table       = "Terraform-Lock"
    region               = "us-east-1"
    key                  = "global.tfstate"
    profile              = "naesb"
    workspace_key_prefix = "network/env"
  }
}
