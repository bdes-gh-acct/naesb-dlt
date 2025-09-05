locals {
  vault_cluster_name = "${var.app}-${var.owner}-vault-consul"
  public_key_path    = "~/.ssh/ec2.pub"
}

data "aws_caller_identity" "current" {
}

resource "aws_key_pair" "ec2key" {
  key_name   = "${var.owner}-vault_key"
  public_key = file(local.public_key_path)
}

data "aws_region" "current" {}

data "aws_ami" "vault_consul" {
  most_recent = true

  # If we change the AWS Account in which test are run, update this value.
  owners = ["094458522773"]


  filter {
    name   = "name"
    values = ["NAESB-DLT-vault-consul-ubuntu-24.04*"]
  }
}

data "aws_kms_alias" "this" {
  name = "alias/dev-vault-unseal"
}

data "template_file" "this" {
  template = file("${path.module}/user-data-vault.sh")

  vars = {
    consul_cluster_tag_key    = var.cluster_tag_key
    consul_cluster_tag_value  = var.cluster_tag_value
    kms_key_id                = data.aws_kms_alias.this.target_key_id
    aws_region                = data.aws_region.current.name
    enable_gossip_encryption  = var.enable_gossip_encryption
    gossip_encryption_key_arn = var.gossip_encryption_key_arn
    enable_rpc_encryption     = var.enable_rpc_encryption
    ca_path                   = var.ca_path
    cert_file_path            = var.cert_file_path
    key_file_path             = var.key_file_path
  }
}

module "vault_cluster" {
  # When using these modules in your own templates, you will need to use a Git URL with a ref attribute that pins you
  # to a specific version of the modules, such as the following example:
  # source = "github.com/hashicorp/terraform-aws-vault.git//modules/vault-cluster?ref=v0.0.1"
  source = "github.com/hashicorp/terraform-aws-vault.git//modules/vault-cluster?ref=v0.17.0"

  cluster_name  = local.vault_cluster_name
  cluster_size  = 2
  instance_type = "t3.small"
  ami_id        = data.aws_ami.vault_consul.image_id
  user_data     = data.template_file.this.rendered

  vpc_id     = var.vpc_id
  subnet_ids = var.subnet_ids
  # This setting will create the AWS policy that allows the vault cluster to
  # access KMS and use this key for encryption and decryption
  enable_auto_unseal        = true
  auto_unseal_kms_key_arn   = data.aws_kms_alias.this.target_key_arn
  health_check_grace_period = 300
  # To make testing easier, we allow requests from any IP address here but in a production deployment, we *strongly*
  # recommend you limit this to the IP address ranges of known, trusted servers inside your VPC.
  health_check_type                    = "EC2"
  allowed_inbound_cidr_blocks          = var.allowed_inbound_cidr_blocks
  allowed_ssh_cidr_blocks              = []
  allowed_inbound_security_group_ids   = []
  allowed_inbound_security_group_count = 0
}

module "consul_iam_policies_servers" {
  source = "github.com/hashicorp/terraform-aws-consul.git//modules/consul-iam-policies?ref=v0.8.0"

  iam_role_id = module.vault_cluster.iam_role_id
}


module "security_group_rules" {
  source = "github.com/hashicorp/terraform-aws-consul.git//modules/consul-client-security-group-rules?ref=v0.8.0"

  security_group_id = module.vault_cluster.security_group_id

  # To make testing easier, we allow requests from any IP address here but in a production deployment, we *strongly*
  # recommend you limit this to the IP address ranges of known, trusted servers inside your VPC.

  allowed_inbound_cidr_blocks = ["0.0.0.0/0"]
}

resource "aws_cloudwatch_log_group" "admin" {
  name              = "${var.app}-${var.owner}/vault"
  retention_in_days = 30
}


data "template_file" "user_data_vault_agent" {
  template = file("${path.module}/user-data-vault-admin.sh")

  vars = {
    log_group_name            = aws_cloudwatch_log_group.admin.name
    consul_cluster_tag_key    = var.cluster_tag_key
    consul_cluster_tag_value  = var.cluster_tag_value
    kms_key_id                = data.aws_kms_alias.this.target_key_id
    aws_region                = data.aws_region.current.name
    enable_gossip_encryption  = var.enable_gossip_encryption
    gossip_encryption_key_arn = var.gossip_encryption_key_arn
    enable_rpc_encryption     = var.enable_rpc_encryption
    ca_path                   = var.ca_path
    cert_file_path            = var.cert_file_path
    key_file_path             = var.key_file_path
    account_id                = data.aws_caller_identity.current.account_id
    role_name                 = "${var.app}-${var.owner}-vault-leader"
    aws_principal             = var.peer_role_arn
    peer_role_name            = var.peer_role_name
  }
}

resource "aws_iam_instance_profile" "example_instance_profile" {
  path = "/"
  role = module.vault_cluster.iam_role_name
}



resource "aws_iam_role_policy" "vault_iam" {
  name   = "${var.app}-${var.owner}-vault_iam"
  role   = module.vault_cluster.iam_role_id
  policy = data.aws_iam_policy_document.vault_iam.json
}

resource "aws_iam_role_policy_attachment" "ssmmanagement" {
  role       = module.vault_cluster.iam_role_id
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

data "aws_iam_policy_document" "vault_iam" {
  statement {
    effect  = "Allow"
    actions = ["iam:GetRole", "iam:GetUser"]
    # List of ARNs Vault machines can query
    # For more security, it could be set to specific roles or users:
    # resources = ["${aws_iam_role.example_instance_role.arn}"]        
    resources = [
      "arn:aws:iam::*:user/*",
      "arn:aws:iam::*:role/*",
    ]
  }
  statement {
    effect    = "Allow"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.gossip_encryption_key_arn]
  }
  statement {
    effect = "Allow"
    actions = [
      "logs:GetLogEvents",
      "logs:PutLogEvents",
      "logs:CreateLogStream",
      "logs:DescribeLogStreams",
      "logs:PutRetentionPolicy",
      "logs:CreateLogGroup"
    ]
    resources = ["arn:aws:logs:*"]
  }
}

resource "aws_instance" "example_auth_to_vault" {
  depends_on    = [aws_iam_role_policy.vault_iam]
  instance_type = "t3.small"
  subnet_id     = var.subnet_ids[0]
  # Security group that opens the necessary ports for consul
  # And security group that opens the port to our simple web server
  vpc_security_group_ids = [module.vault_cluster.security_group_id]
  ami                    = data.aws_ami.vault_consul.image_id
  user_data              = data.template_file.user_data_vault_agent.rendered
  iam_instance_profile   = aws_iam_instance_profile.example_instance_profile.name

  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.app}-${var.owner}-vault-leader"
  }
  root_block_device {
    volume_size = 50
  }
}

data "aws_route53_zone" "this" {
  name         = "${var.root_domain}."
  private_zone = false
}

resource "aws_s3_bucket" "this" {
  bucket        = "${var.owner}-${var.app}-vaul-lb"
  force_destroy = true
}


resource "aws_secretsmanager_secret" "ca_key" {
  name                    = "${var.app}-${var.owner}-vault-ca-cert"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "ca_key" {
  secret_id     = aws_secretsmanager_secret.ca_key.id
  secret_string = file("../../ami/keys/dc1-client-consul-vault.pem")
}
