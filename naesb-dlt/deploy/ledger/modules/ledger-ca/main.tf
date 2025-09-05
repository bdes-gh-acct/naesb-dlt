locals {
  public_key_path = "~/.ssh/ec2.pub"
}

resource "random_password" "password" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "agent_seed" {
  name                    = "${var.app}-${var.owner}-${var.org_name}-agent-seed"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "agent_seed" {
  secret_id     = aws_secretsmanager_secret.agent_seed.id
  secret_string = var.seed == null ? random_password.password.result : var.seed
}


resource "aws_iam_instance_profile" "this" {
  path = "/"
  role = var.role_name
}

data "aws_vpc" "target" {
  id = var.vpc_id
}
# This gets pretty ugly, but the idea is to add enhanced DNS for connectivity beyond consul. Required for RDS connection.
# It would ideally be handled in the start up script, but the templatefile runs into many errors when it comes to dynamic IP ranges.
locals {
  vpc_cidrs = data.aws_vpc.target.cidr_block_associations[*].cidr_block

  vpc_dns_ips = [for cidr in local.vpc_cidrs : cidrhost(cidr, 2)]

  vpc_dns_ips_string  = join(" ", local.vpc_dns_ips)
  vpc_dns_ips_list = split(" ", local.vpc_dns_ips_string)
  vpc_dns_server_lines = join("\n", [for ip in local.vpc_dns_ips_list : "server=${ip}"])
}

output "vpc_dns_ips" {
  value = local.vpc_dns_ips
}

data "aws_ami" "vault_consul" {
  most_recent = true

  # If we change the AWS Account in which test are run, update this value.
  owners = ["094458522773"]


  filter {
    name   = "name"
    values = ["NAESB-DLT-vault-consul-ubuntu-24.04*"]
  }
}

resource "aws_iam_role_policy" "this" {
  name   = "${var.app}-${var.owner}-${var.org_name}-ca-vault_iam"
  role   = var.role_id
  policy = data.aws_iam_policy_document.this.json
}

data "aws_region" "current" {}

data "aws_iam_policy_document" "this" {
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
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.bucket_id}/*", "arn:aws:s3:::naesb-smart-contracts/*"]
  }
  statement {
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [var.gossip_key_secret_arn, var.ca_key_secret_arn, var.db_password_arn, aws_secretsmanager_secret.agent_seed.arn]
  }
  statement {
    effect    = "Allow"
    actions   = ["ecr:*"]
    resources = ["*"]
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





resource "aws_instance" "this" {
  depends_on    = [aws_iam_role_policy.this]
  instance_type = var.instance_type
  subnet_id     = var.subnet_ids[0]
  # Security group that opens the necessary ports for consul
  # And security group that opens the port to our simple web server
  vpc_security_group_ids = [aws_security_group.sg.id]
  ami                    = data.aws_ami.vault_consul.image_id
  user_data              = data.template_file.this.rendered
  iam_instance_profile   = aws_iam_instance_profile.this.name
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.app}-${var.owner}-ca-${var.org_name}-${var.peer_name}"
  }
  root_block_device {
    volume_size = 50
  }

  lifecycle {
    ignore_changes = [
      user_data,
      ami,
    ]

    replace_triggered_by = [
      terraform_data.user_data,
    ]
  }
}

data "aws_caller_identity" "current" {
}


resource "aws_cloudwatch_log_group" "admin" {
  name              = "${var.app}-${var.owner}/organization/${var.org_name}"
  retention_in_days = 30
}

data "template_file" "this" {
  template = templatefile("${path.module}/user-data.sh", {
    account_id                = data.aws_caller_identity.current.account_id
    admin                     = var.admin
    aws_principal             = var.role_id
    bootstrap_brokers         = var.bootstrap_brokers
    aws_region                = data.aws_region.current.name
    ca_path                   = var.ca_path
    cert_file_path            = var.cert_file_path
    compose_bucket            = var.bucket_id
    compose_key               = var.compose_key
    consul_cluster_tag_key    = var.cluster_tag_key
    consul_cluster_tag_value  = var.cluster_tag_value
    consul_server_ca_cert_arn = var.ca_key_secret_arn
    db_host                   = var.db_host
    db_password_arn           = var.db_password_arn
    domain                    = var.domain
    enable_gossip_encryption  = true
    enable_rpc_encryption     = true
    gossip_encryption_key_arn = var.gossip_key_secret_arn
    key_file_path             = var.key_file_path
    log_group_name            = aws_cloudwatch_log_group.admin.name
    msp_id                    = var.msp_id
    nginx_key                 = var.nginx_key
    orderer_id                = var.orderer_name
    org_id                    = var.org_id
    org_name                  = var.org_name
    peer_id                   = var.peer_name
    role_name                 = var.role_name
    agent_seed_secret_arn     = aws_secretsmanager_secret.agent_seed.arn
    site_url                  = var.owner == "prod" ? "https://${lower(var.org_name)}.${var.domain}:${var.acapy_service_port}" : "https://${lower(var.org_name)}.${var.owner}.${var.domain}:${var.acapy_service_port}"
    profile_url               = var.owner == "prod" ? "https://${lower(var.org_name)}.${var.domain}" : "https://${lower(var.org_name)}.${var.owner}.${var.domain}"
    agent_label               = var.label
    pool_url                  = var.owner == "prod" ? "https://indy.${var.domain}/api" : "https://indy.${var.owner}.${var.domain}/api"
    tails_url                 = var.owner == "prod" ? "https://indy.${var.domain}:6543" : "https://indy.${var.owner}.${var.domain}:6543"
    registry_address          = var.owner == "prod" ? "https://registry.${var.domain}" : "https://registry.${var.owner}.${var.domain}"
    docker_registry_address   = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com"
    bootstrap_did             = "false"
    bootstrap_brokers         = var.bootstrap_brokers
    indy_role                 = var.indy_role
    acapy_admin_port          = var.acapy_admin_port
    acapy_service_port        = var.acapy_service_port
    genesis_url               = var.owner == "prod" ? "https://indy.${var.domain}/api/genesis" : "https://indy.${var.owner}.${var.domain}/api/genesis"
    vpc_cidr_dns              = local.vpc_dns_server_lines
  })
  /*
  vars = {
    
  }*/
}

resource "terraform_data" "user_data" {
  input = data.template_file.this.rendered
}

resource "aws_security_group" "sg" {
  name   = "${var.owner}-ca-${var.org_name}"
  vpc_id = var.vpc_id

  tags = {
    owner = var.owner
    app   = var.app
  }
}

resource "aws_security_group_rule" "out" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "gossip" {
  type              = "ingress"
  from_port         = 50000
  to_port           = 70000
  protocol          = "-1"
  cidr_blocks       = var.allowed_inbound_cidr_blocks
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "grpcs" {
  type              = "ingress"
  from_port         = 9051
  to_port           = 9051
  protocol          = "tcp"
  cidr_blocks       = var.allowed_inbound_cidr_blocks
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "agent" {
  type              = "ingress"
  from_port         = var.acapy_service_port
  to_port           = var.acapy_service_port
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "agent-admin" {
  type              = "ingress"
  from_port         = var.acapy_admin_port
  to_port           = var.acapy_admin_port
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "ca" {
  type              = "ingress"
  from_port         = 8080
  to_port           = 8080
  protocol          = "tcp"
  cidr_blocks       = var.allowed_inbound_cidr_blocks
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "https" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

module "security_group_rules" {
  source            = "github.com/hashicorp/terraform-aws-consul.git//modules/consul-client-security-group-rules?ref=v0.8.0"
  security_group_id = aws_security_group.sg.id
  # To make testing easier, we allow requests from any IP address here but in a production deployment, we *strongly*
  # recommend you limit this to the IP address ranges of known, trusted servers inside your VPC.

  allowed_inbound_cidr_blocks = var.allowed_inbound_cidr_blocks
}

module "acm_cert" {
  source      = "../../../shared/acm_domain"
  app         = var.app
  owner       = var.owner
  root_domain = var.domain
  subdomain   = var.owner == "prod" ? "${var.org_name}.${var.domain}" : "${var.org_name}.${var.owner}.${var.domain}"
}

resource "aws_route53_record" "subdomain" {
  name    = var.owner == "prod" ? "${var.org_name}.${var.domain}" : "${var.org_name}.${var.owner}.${var.domain}"
  zone_id = module.acm_cert.zone_id
  type    = "A"
  alias {
    name                   = aws_lb.ecs_lb.dns_name # Position 0 because we only have one Fargate service (api)
    zone_id                = aws_lb.ecs_lb.zone_id  # Same here
    evaluate_target_health = true
  }
}


resource "aws_lb" "ecs_lb" {
  name            = "${var.owner}-${var.app}-${var.org_name}"
  security_groups = [aws_security_group.sg.id]
  subnets         = var.subnet_ids
  internal        = false
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_listener" "lb_listener" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.client.arn
  }
}

resource "aws_lb_listener" "agent_listener" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = var.acapy_service_port
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service.arn
  }
}

resource "aws_lb_target_group" "service" {
  name_prefix = var.owner
  port        = var.acapy_service_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/status"
    port                = var.acapy_admin_port
    matcher             = "200-399"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_listener" "aries_admin" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = var.acapy_admin_port
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.aries_admin.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group" "aries_admin" {
  name_prefix = var.owner
  port        = var.acapy_admin_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/status"
    port                = var.acapy_admin_port
    matcher             = "200-399"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group_attachment" "aries_admin" {
  target_group_arn = aws_lb_target_group.aries_admin.arn
  target_id        = aws_instance.this.id
  port             = var.acapy_admin_port
}

resource "aws_lb_target_group_attachment" "aries_service" {
  target_group_arn = aws_lb_target_group.service.arn
  target_id        = aws_instance.this.id
  port             = var.acapy_service_port
}


resource "aws_lb_listener_rule" "ledger" {
  listener_arn = aws_lb_listener.lb_listener.arn
  priority     = 3

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ledger.arn
  }

  condition {
    path_pattern {
      values = ["/api/ledger/*"]
    }
  }
}

resource "aws_lb_listener_rule" "ca" {
  listener_arn = aws_lb_listener.lb_listener.arn
  priority     = 2

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ca.arn
  }

  condition {
    path_pattern {
      values = ["/api/ca/*"]
    }
  }
}

resource "aws_lb_listener_rule" "admin" {
  count        = var.admin ? 1 : 0
  listener_arn = aws_lb_listener.lb_listener.arn
  priority     = 4

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin[count.index].arn
  }

  condition {
    path_pattern {
      values = ["/api/admin/*"]
    }
  }
}

resource "aws_lb_listener_rule" "core" {
  listener_arn = aws_lb_listener.lb_listener.arn
  priority     = 5

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.core.arn
  }

  condition {
    path_pattern {
      values = ["/api/core/*"]
    }
  }
}

resource "aws_lb_listener_rule" "agent" {
  listener_arn = aws_lb_listener.lb_listener.arn
  priority     = 6

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.agent.arn
  }

  condition {
    path_pattern {
      values = ["/api/agent/*"]
    }
  }
}

resource "aws_lb_target_group" "client" {
  name_prefix = var.owner
  port        = 6000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/index.html"
    port                = "6000"
  }
}

resource "aws_lb_target_group_attachment" "client" {
  target_group_arn = aws_lb_target_group.client.arn
  target_id        = aws_instance.this.id
  port             = 6000
}

resource "aws_lb_target_group" "ca" {
  name_prefix = var.owner
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/ca/v1/health"
    port                = "8080"
  }
}

resource "aws_lb_target_group_attachment" "ca" {
  target_group_arn = aws_lb_target_group.ca.arn
  target_id        = aws_instance.this.id
  port             = 8080
}


resource "aws_lb_target_group" "ledger" {
  name_prefix = var.owner
  port        = 8081
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/ledger/v1/health"
    port                = "8081"
  }
}

resource "aws_lb_target_group_attachment" "ledger" {
  target_group_arn = aws_lb_target_group.ledger.arn
  target_id        = aws_instance.this.id
  port             = 8081
}

resource "aws_lb_target_group" "admin" {
  count       = var.admin ? 1 : 0
  name_prefix = var.owner
  port        = 8083
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/admin/v1/health"
    port                = "8083"
  }
}

resource "aws_lb_target_group_attachment" "admin" {
  count            = var.admin ? 1 : 0
  target_group_arn = aws_lb_target_group.admin[count.index].arn
  target_id        = aws_instance.this.id
  port             = 8083
}

resource "aws_lb_target_group" "core" {
  name_prefix = var.owner
  port        = 8082
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/core/v1/health"
    port                = "8082"
  }
}

resource "aws_lb_target_group" "agent" {
  name_prefix = var.owner
  port        = 8085
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 10
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/agent/v1/health"
    port                = "8085"
  }
}

resource "aws_lb_target_group_attachment" "core" {
  target_group_arn = aws_lb_target_group.core.arn
  target_id        = aws_instance.this.id
  port             = 8082
}

resource "aws_lb_target_group_attachment" "agent" {
  target_group_arn = aws_lb_target_group.agent.arn
  target_id        = aws_instance.this.id
  port             = 8085
}
