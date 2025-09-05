locals {
  owner = lower(terraform.workspace)
  app   = "naesb-dlt"
  log_config = {
    logDriver = "awslogs"
    options = {
      awslogs-group         = aws_cloudwatch_log_group.ecs.name
      awslogs-region        = data.aws_region.current.name
      awslogs-stream-prefix = "app"
    }
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "${local.app}-${local.owner}/${var.name}"
  retention_in_days = 30
}

data "aws_region" "current" {}

data "terraform_remote_state" "consul" {
  backend = "s3"
  config = {
    bucket  = "naesb-dlt-deploy"
    region  = "us-east-1"
    profile = "naesb"
    key     = "consul-vault/env/${terraform.workspace}/global.tfstate"
  }
}

resource "aws_ecs_service" "example_client_app" {
  name            = var.name
  cluster         = aws_ecs_cluster.this.arn
  task_definition = module.task.task_definition_arn
  desired_count   = 1
  network_configuration {
    subnets = data.terraform_remote_state.consul.outputs.private_subnet_ids
  }
  launch_type    = "FARGATE"
  propagate_tags = "TASK_DEFINITION"
  load_balancer {
    target_group_arn = aws_lb_target_group.example_client_app.arn
    container_name   = "consul"
    container_port   = 8500
  }
  enable_execute_command = true
}

resource "aws_lb_target_group" "example_client_app" {
  name                 = "${var.name}-example-client-app"
  port                 = 8500
  protocol             = "HTTP"
  vpc_id               = data.terraform_remote_state.consul.outputs.vpc_id
  target_type          = "ip"
  deregistration_delay = 10
  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 10
    timeout             = 30
    interval            = 60
  }
}


resource "aws_lb" "example_client_app" {
  name               = "${var.name}-example-client-app"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.example_client_app_alb.id]
  subnets            = data.terraform_remote_state.consul.outputs.public_subnet_ids
}

resource "aws_lb_listener" "example_client_app" {
  load_balancer_arn = aws_lb.example_client_app.arn
  port              = "8500"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.example_client_app.arn
  }
}


resource "aws_security_group" "example_client_app_alb" {
  name   = "${var.name}-example-client-app-alb"
  vpc_id = data.terraform_remote_state.consul.outputs.vpc_id

  ingress {
    description = "Access to example client application."
    from_port   = 0
    to_port     = 0
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "security_group_rules" {
  source            = "github.com/hashicorp/terraform-aws-consul.git//modules/consul-client-security-group-rules?ref=v0.8.0"
  security_group_id = aws_security_group.example_client_app_alb.id
  # To make testing easier, we allow requests from any IP address here but in a production deployment, we *strongly*
  # recommend you limit this to the IP address ranges of known, trusted servers inside your VPC.

  allowed_inbound_cidr_blocks = concat(data.terraform_remote_state.consul.outputs.private_cidr_blocks, data.terraform_remote_state.consul.outputs.public_cidr_blocks)
}

resource "aws_ecs_cluster" "this" {
  name               = var.name
  capacity_providers = ["FARGATE"]
}


module "task" {
  owner                     = local.owner
  app                       = local.app
  gossip_key_secret_arn     = data.terraform_remote_state.consul.outputs.gossip_key_secret_arn
  consul_server_ca_cert_arn = data.terraform_remote_state.consul.outputs.ca_key_secret_arn
  cluster_tag_key           = data.terraform_remote_state.consul.outputs.cluster_tag_key
  cluster_tag_value         = data.terraform_remote_state.consul.outputs.cluster_tag_value
  source                    = "./modules/task"
  family                    = "${local.app}-${local.owner}"
  port                      = "443"
  log_configuration         = local.log_config
  # consul_server_client_cert_arn = aws_secretsmanager_secret.client_cert.arn
  # consul_server_client_key_arn  = aws_secretsmanager_secret.client_key.arn
  memory = 2048
  cpu    = 1024
  container_definitions = [{
    name             = var.name
    image            = "094458522773.dkr.ecr.us-east-1.amazonaws.com/naesb-dlt/vault-agent:latest"
    essential        = true
    logConfiguration = local.log_config
    secrets = [
      {
        name      = "VAULT_CACERT_PEM",
        valueFrom = "${data.terraform_remote_state.consul.outputs.vault_ca_key_secret_arn}"
    }]
    environment = [
      {
        name  = "VAULT_ADDR",
        value = "http://vault.service.consul:8200"
      },
      {
        name  = "VAULT_ROLE",
        value = "dev-naesbdlt-vault-user-role"
      },
      {
        name  = "VAULT_CACERT",
        value = "/opt/vault/tls/ca.crt.pem"
      },
    ],
    portMappings = [
      {
        containerPort = 443
        hostPort      = 443
        protocol      = "tcp"
      }
    ]
    cpu    = 512
    memory = 512
    # An ECS health check. This will be automatically synced into Consul.
    # healthCheck = {
    #   command = [
    #     "CMD-SHELL",
    #     "curl -f http://localhost:443/api/tsp/v1/health || exit 1"
    #   ]
    #   interval    = 30
    #   retries     = 3
    #   timeout     = 5
    #   startPeriod = null
    # }
  }]
  # checks = [
  #   {
  #     checkId  = "server-http"
  #     name     = "HTTP health check"
  #     http     = "http://localhost:443/api/tsp/v1/health"
  #     method   = "GET"
  #     timeout  = "10s"
  #     interval = "5s"
  #   }
  # ]
  additional_execution_role_policies = [aws_iam_policy.execution.arn]
  additional_task_role_policies      = [aws_iam_policy.execution.arn]
}


resource "aws_iam_policy" "execution" {
  name        = "${local.app}-${local.owner}-vault"
  path        = "/"
  description = "${local.app}-${local.owner}-vault"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "${data.terraform_remote_state.consul.outputs.vault_ca_key_secret_arn}"
      ]
    }
  ]
}
EOF
}
