
resource "aws_kms_key" "kafka_kms_key" {
  description = "Key for Apache Kafka"
}

resource "aws_cloudwatch_log_group" "kafka_log_group" {
  name = "${var.app}-${var.owner}/kafka"
}

resource "aws_msk_configuration" "kafka_config" {
  kafka_versions    = ["3.4.0"]
  name              = "${var.app}-${var.owner}-config"
  server_properties = <<EOF
auto.create.topics.enable = true
delete.topic.enable = true
EOF
}

resource "aws_msk_cluster" "kafka" {
  cluster_name           = var.name
  kafka_version          = "3.4.0"
  number_of_broker_nodes = var.broker_count
  broker_node_group_info {
    instance_type = var.broker_instance_type # default value
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
    client_subnets  = var.subnet_ids
    security_groups = [aws_security_group.kafka.id]
  }
  encryption_info {
    encryption_in_transit {
      client_broker = "PLAINTEXT"
    }
    encryption_at_rest_kms_key_arn = aws_kms_key.kafka_kms_key.arn
  }
  configuration_info {
    arn      = aws_msk_configuration.kafka_config.arn
    revision = aws_msk_configuration.kafka_config.latest_revision
  }
  open_monitoring {
    prometheus {
      jmx_exporter {
        enabled_in_broker = true
      }
      node_exporter {
        enabled_in_broker = true
      }
    }
  }
  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.kafka_log_group.name
      }
    }
  }
}

################################################################################
# Security groups
################################################################################

resource "aws_security_group" "kafka" {
  name   = "${var.app}-${var.owner}-kafka"
  vpc_id = var.vpc_id
  ingress {
    from_port   = 0
    to_port     = 9092
    protocol    = "TCP"
    cidr_blocks = var.allowed_cidr_blocks
  }
  ingress {
    from_port   = 0
    to_port     = 9092
    protocol    = "TCP"
    cidr_blocks = var.allowed_cidr_blocks
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
