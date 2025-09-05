

resource "random_password" "password" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "agent_seed" {
  name                    = "${var.app}-${var.owner}-${var.alias}-agent-seed"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "agent_seed" {
  secret_id     = aws_secretsmanager_secret.agent_seed.id
  secret_string = var.seed == null ? random_password.password.result : var.seed
}

data "aws_vpc" "selected" {
  id = var.vpc_id
}

data "aws_region" "current" {}

data "aws_ami" "amazon-linux-2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "owner-alias"
    values = ["amazon"]
  }


  filter {
    name   = "name"
    values = ["amzn2-ami-hvm*"]
  }
}

resource "aws_security_group" "this" {
  name   = "${var.app}-${var.owner}-${var.alias}-indy-agent"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 6000
    to_port     = 6000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 10000
    to_port     = 10000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    owner = var.owner
    app   = var.app
  }
}

resource "aws_iam_role" "instance_role" {
  name               = "${var.app}-${var.owner}-${var.alias}-indy-role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "this" {
  path = "/"
  role = aws_iam_role.instance_role.name
}

resource "aws_iam_role_policy" "this" {
  name   = "${var.app}-${var.owner}-${var.alias}-indy-agent"
  role   = aws_iam_role.instance_role.name
  policy = data.aws_iam_policy_document.this.json
}

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
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.agent_seed.arn]
  }
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = ["ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:DescribeImages",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:ListImages",
    "ecr:DescribeRepositories"]
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
  depends_on             = [aws_iam_role_policy.this]
  ami                    = data.aws_ami.amazon-linux-2.id
  instance_type          = var.instance_type
  iam_instance_profile   = aws_iam_instance_profile.this.name
  subnet_id              = var.subnet_ids[1]
  vpc_security_group_ids = [aws_security_group.this.id]
  user_data              = data.template_file.this.rendered
  root_block_device {
    volume_size = 50
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.app}-${var.owner}-${var.alias}-indy-agent"
  }
}

resource "aws_cloudwatch_log_group" "admin" {
  name              = "${var.app}-${var.owner}/agent/${var.alias}"
  retention_in_days = 30
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

data "template_file" "this" {
  template = file("${path.module}/user-data.sh")
  # todo: make indy_seed use secret
  vars = {
    log_group_name        = aws_cloudwatch_log_group.admin.name
    aws_region            = data.aws_region.current.name
    compose_bucket        = var.compose_bucket
    nginx_key             = var.nginx_key
    compose_key           = var.compose_key
    agent_seed_secret_arn = aws_secretsmanager_secret.agent_seed.arn
    site_url              = "https://${lower(var.alias)}.agent.indy.${var.owner}.${var.domain}:10000"
    profile_url           = "https://${lower(var.alias)}.agent.indy.${var.owner}.${var.domain}"
    agent_label           = var.label
    pool_url              = "https://indy.${var.owner}.${var.domain}/api"
    tails_url             = "https://indy.${var.owner}.${var.domain}:6543"
    bootstrap_did         = "true"
    indy_role             = var.indy_role
  }
}

module "acm_cert" {
  source      = "../../../shared/acm_domain"
  app         = var.app
  owner       = var.owner
  root_domain = var.domain
  subdomain   = "${lower(var.alias)}.agent.indy.${var.owner}.${var.domain}"
}


resource "aws_lb" "ecs_lb" {
  name            = "${var.owner}-${var.app}-${var.alias}"
  security_groups = [aws_security_group.this.id]
  subnets         = var.subnet_ids
  internal        = false
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}


resource "aws_lb_listener" "admin" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = "6000"
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}


resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_listener" "service" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = "10000"
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.service.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group" "admin" {
  name_prefix = var.owner
  port        = 6000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/status"
    port                = "6000"
    matcher             = "200-399"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}


resource "aws_lb_target_group" "api" {
  name_prefix = var.owner
  port        = 443
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/agent/v1/health"
    port                = "443"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group" "service" {
  name_prefix = var.owner
  port        = 10000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/status"
    port                = "6000"
    matcher             = "200-399"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group_attachment" "admin" {
  target_group_arn = aws_lb_target_group.admin.arn
  target_id        = aws_instance.this.id
  port             = 6000
}

resource "aws_lb_target_group_attachment" "service" {
  target_group_arn = aws_lb_target_group.service.arn
  target_id        = aws_instance.this.id
  port             = 10000
}

resource "aws_lb_target_group_attachment" "api" {
  target_group_arn = aws_lb_target_group.api.arn
  target_id        = aws_instance.this.id
  port             = 443
}

resource "aws_route53_record" "subdomain" {
  name    = "${lower(var.alias)}.agent.indy.${var.owner}.${var.domain}"
  zone_id = module.acm_cert.zone_id
  type    = "A"
  alias {
    name                   = aws_lb.ecs_lb.dns_name
    zone_id                = aws_lb.ecs_lb.zone_id
    evaluate_target_health = true
  }
}


