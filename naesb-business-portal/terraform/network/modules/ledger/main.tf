locals {
  path = var.owner == "prod" ? "indy.${var.domain}" : "indy.${var.owner}.${var.domain}"
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
  name   = "${var.app}-${var.owner}-indy"
  vpc_id = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 6543
    to_port     = 6543
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9700
    to_port     = 9710
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
  name               = "${var.app}-${var.owner}-ec2-role"
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
  name   = "${var.app}-${var.owner}-indy-network"
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

resource "aws_s3_bucket" "this" {
  bucket        = "${var.owner}-${var.app}"
  acl           = "private"
  force_destroy = true
  tags = {
    Name  = "${var.owner}-${var.app}"
    owner = var.owner
    app   = var.app
  }
}

resource "aws_s3_bucket_object" "this" {
  bucket = aws_s3_bucket.this.id
  key    = "${var.owner}-${var.app}-ca"
  source = "${path.module}/docker-compose.yaml"

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5("${path.module}/docker-compose.yaml")
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_instance" "this" {
  depends_on             = [aws_iam_role_policy.this]
  ami                    = data.aws_ami.amazon-linux-2.id
  instance_type          = var.instance_type
  iam_instance_profile   = aws_iam_instance_profile.this.name
  subnet_id              = var.subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.this.id]
  user_data              = data.template_file.this.rendered
  root_block_device {
    volume_size = 50
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.app}-${var.owner}-indy-network"
  }
}

resource "aws_cloudwatch_log_group" "admin" {
  name              = "${var.app}-${var.owner}/ledger"
  retention_in_days = 30
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

data "template_file" "this" {
  template = file("${path.module}/user-data.sh")

  vars = {
    log_group_name = aws_cloudwatch_log_group.admin.name
    aws_region     = data.aws_region.current.name
    compose_bucket = aws_s3_bucket.this.id
    compose_key    = aws_s3_bucket_object.this.key
  }
}

module "acm_cert" {
  source      = "../../../shared/acm_domain"
  app         = var.app
  owner       = var.owner
  root_domain = var.domain
  subdomain   = local.path
}


resource "aws_lb" "ecs_lb" {
  name            = "${var.owner}-${var.app}"
  security_groups = [aws_security_group.this.id]
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
    target_group_arn = aws_lb_target_group.lb_group.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_listener" "tails_listener" {
  load_balancer_arn = aws_lb.ecs_lb.arn
  port              = "6543"
  protocol          = "HTTPS"
  certificate_arn   = module.acm_cert.acm_cert_arn
  ssl_policy        = "ELBSecurityPolicy-2016-08"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tails.arn
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group" "lb_group" {
  name_prefix = var.owner
  port        = 443
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/api/nodes"
    port                = "443"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}"
  }
}

resource "aws_lb_target_group" "tails" {
  name_prefix = var.owner
  port        = 6543
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/"
    port                = "6543"
    matcher             = "200-499"
  }
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "${var.owner}-${var.app}-tails"
  }
}

resource "aws_lb_target_group_attachment" "test" {
  target_group_arn = aws_lb_target_group.lb_group.arn
  target_id        = aws_instance.this.id
  port             = 443
}

resource "aws_lb_target_group_attachment" "tails" {
  target_group_arn = aws_lb_target_group.tails.arn
  target_id        = aws_instance.this.id
  port             = 6543
}

resource "aws_route53_record" "subdomain" {
  name    = local.path
  zone_id = module.acm_cert.zone_id
  type    = "A"
  alias {
    name                   = aws_lb.ecs_lb.dns_name
    zone_id                = aws_lb.ecs_lb.zone_id
    evaluate_target_health = true
  }
}

