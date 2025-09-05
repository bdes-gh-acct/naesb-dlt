locals {
  owner  = lower(terraform.workspace)
  app    = "naesb-dlt"
  domain = "naesbdlt.org"
}

module "consul" {
  source     = "./modules/consul"
  owner      = local.owner
  domain     = local.domain
  app        = local.app
  vpc_id     = var.vpc_id
  subnet_ids = var.public_subnet_ids
}

resource "aws_iam_role" "peer_role" {
  name = "${local.owner}-${local.app}-peer"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    tag-key = "tag-value"
  }
}

resource "aws_iam_role_policy_attachment" "ssmmanagement" {
  role       = aws_iam_role.peer_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

module "vault" {
  source                      = "./modules/vault"
  allowed_inbound_cidr_blocks = concat(var.private_cidr_blocks, var.public_cidr_blocks)
  owner                       = local.owner
  app                         = local.app
  vpc_id                      = var.vpc_id
  subnet_ids                  = var.private_subnet_ids
  gossip_encryption_key_arn   = module.consul.gossip_key_secret_arn
  cluster_tag_key             = module.consul.cluster_tag_key
  cluster_tag_value           = module.consul.cluster_tag_value
  root_domain                 = local.domain
  peer_role_arn               = aws_iam_role.peer_role.arn
  peer_role_name              = aws_iam_role.peer_role.name
}