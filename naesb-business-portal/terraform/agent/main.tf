locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-indy"
  domain = "naesbdlt.org"
}


resource "aws_s3_bucket" "this" {
  bucket        = "${local.owner}-${local.app}-agent"
  acl           = "private"
  force_destroy = true
  tags = {
    Name  = "${local.owner}-${local.app}"
    owner = local.owner
    app   = local.app
  }
}

resource "aws_s3_bucket_object" "this" {
  bucket = aws_s3_bucket.this.id
  key    = "${local.owner}-${local.app}-agent"
  source = "${path.module}/docker-compose.yaml"

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5("${path.module}/docker-compose.yaml")
  tags = {
    owner = local.owner
    app   = local.app
    Name  = "${local.owner}-${local.app}"
  }
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

module "naesb-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "STEWARD"
  alias          = "NAESB"
  label          = "NAESB"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "bw7kLcQ+L80tq8lwk+QosmbyHawwyvx8"
}

module "swn-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "ENDORSER"
  alias          = "SWN"
  label          = "SWN"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "ggLvjdtGngQkSuDBmqVyNl7lNe7yTm1g"
}

module "tva-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "ENDORSER"
  alias          = "TVA"
  label          = "TVA"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "77zStCIpojgAHqhfLQhOy31qRmJLRpCl"
}

module "canary-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "ENDORSER"
  alias          = "Canary"
  label          = "Project Canary"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "bN5L2/ryUX715MK0M88iZyF+m+/JcAje"
}

module "miq-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "ENDORSER"
  alias          = "MiQ"
  label          = "MiQ"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "wn7N5NSPzSS09nAi8atVKNcMQBMjuRxQ"
}

module "eo-agent" {
  source         = "./modules/agent"
  compose_bucket = aws_s3_bucket.this.id
  compose_key    = aws_s3_bucket_object.this.key
  nginx_key      = aws_s3_bucket_object.nginx.key
  owner          = local.owner
  domain         = local.domain
  app            = local.app
  indy_role      = "ENDORSER"
  alias          = "EO"
  label          = "Equitable Origin"
  vpc_id         = var.vpc_id
  subnet_ids     = var.public_subnet_ids
  seed           = "AOfrk/NdnKhDWmoW4vpcegRX16rV7OHl"
}
