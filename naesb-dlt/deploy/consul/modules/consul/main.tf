locals {
  consul_cluster_name      = "${var.app}-${var.owner}-consul-cluster"
  consul_cluster_tag_key   = "${var.app}-${var.owner}-consul-cluster"
  consul_cluster_tag_value = "${var.app}-${var.owner}-consul"
  path                     = var.owner == "prod" ? "consul.${var.domain}" : "consul.${var.owner}.${var.domain}"
}

// Generate a gossip encryption key if a secure installation.
resource "random_id" "gossip_encryption_key" {
  byte_length = 32
}

resource "aws_secretsmanager_secret" "gossip_key" {
  name                    = "${var.app}-${var.owner}-consul-gossip-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "gossip_key" {
  secret_id     = aws_secretsmanager_secret.gossip_key.id
  secret_string = random_id.gossip_encryption_key.b64_std
}

resource "aws_secretsmanager_secret" "ca_key" {
  name                    = "${var.app}-${var.owner}-consul-ca-cert"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "ca_key" {
  secret_id     = aws_secretsmanager_secret.ca_key.id
  secret_string = file("../../ami/keys/dc1-server-consul-0.pem")
}

data "aws_ami" "consul" {
  most_recent = true

  # If we change the AWS Account in which test are run, update this value.
  owners = ["094458522773"]


  filter {
    name   = "name"
    values = ["NAESB-DLT-Consul-ubuntu-24.04*"]
  }
}

module "consul_cluster" {
  # TODO: update this to the final URL
  # Use version v0.0.5 of the consul-cluster module
  source = "github.com/hashicorp/terraform-aws-consul//modules/consul-cluster?ref=v0.11.0"
  user_data = templatefile("${path.module}/user-data.sh", {
    enable_rpc_encryption    = var.enable_rpc_encryption
    cluster_tag_key          = local.consul_cluster_tag_key
    cluster_tag_value        = local.consul_cluster_tag_value
    enable_gossip_encryption = var.enable_gossip_encryption
    gossip_encryption_key    = random_id.gossip_encryption_key.b64_std
    ca_path                  = var.ca_path
    cert_file_path           = var.cert_file_path
    key_file_path            = var.key_file_path
  })
  cluster_name = local.consul_cluster_name
  # enable_iam_setup = false
  # iam_instance_profile_name = aws_iam_instance_profile.instance_profile.name
  # Specify the ID of the Consul AMI. You should build this using the scripts in the install-consul module.
  ami_id                      = data.aws_ami.consul.image_id
  instance_type               = "t2.micro"
  vpc_id                      = var.vpc_id
  allowed_inbound_cidr_blocks = ["0.0.0.0/0"]
  cluster_size                = 1
  # Add this tag to each node in the cluster
  cluster_tag_key             = local.consul_cluster_tag_key
  cluster_tag_value           = local.consul_cluster_tag_value
  subnet_ids                  = var.subnet_ids
  associate_public_ip_address = true
  enable_https_port           = true

  # Configure and start Consul during boot. It will automatically form a cluster with all nodes that have that same tag.

  # ... See variables.tf for the other parameters you must define for the consul-cluster module
}

resource "aws_iam_role_policy_attachment" "ssmmanagement" {
  role       = module.consul_cluster.iam_role_id
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}


module "acm_cert" {
  source      = "../acm_domain"
  app         = var.app
  owner       = var.owner
  root_domain = var.domain
  subdomain   = local.path
}

resource "aws_route53_record" "subdomain" {
  name    = local.path
  zone_id = module.acm_cert.zone_id
  type    = "A"
  alias {
    name                   = aws_lb.ecs_lb.dns_name # Position 0 because we only have one Fargate service (api)
    zone_id                = aws_lb.ecs_lb.zone_id  # Same here
    evaluate_target_health = true
  }
}


resource "aws_security_group" "sg" {
  name   = "${var.owner}-consul-lb"
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


resource "aws_security_group_rule" "ssl" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_lb" "ecs_lb" {
  name            = "consul-${var.owner}-${var.app}"
  security_groups = [aws_security_group.sg.id]
  subnets         = var.subnet_ids
  internal        = false
  tags = {
    owner = var.owner
    app   = var.app
    Name  = "consul-${var.owner}-${var.app}"
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
}

resource "aws_lb_target_group" "lb_group" {
  name_prefix = var.owner
  port        = 8500
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 10
    interval            = 60
    path                = "/"
    port                = "8500"
    matcher             = "200,301"
  }
}

resource "aws_autoscaling_attachment" "this" {
  autoscaling_group_name = module.consul_cluster.asg_name
  alb_target_group_arn   = aws_lb_target_group.lb_group.arn
}

