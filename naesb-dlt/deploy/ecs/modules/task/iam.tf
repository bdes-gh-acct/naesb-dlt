// Create the task role if create_task_role=true
resource "aws_iam_role" "task" {
  path = var.iam_role_path

  name = "${var.family}-task"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
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
    "consul.hashicorp.com.service-name" = local.service_name
  }
}

resource "aws_iam_policy" "task" {
  name        = "${var.family}-task"
  path        = var.iam_role_path
  description = "${var.family} mesh-task task policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iam:GetRole"
      ],
      "Resource": [
        "${local.task_role_arn}"
      ]
    },
    {
      "Effect" : "Allow",
      "Action" : [
      "ec2:DescribeInstances",
            "ec2:DescribeTags",
            "autoscaling:DescribeAutoScalingGroups",
            "ecr:*"
          ],
          "Resource" : "*"
        }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "task" {
  role       = aws_iam_role.task.id
  policy_arn = aws_iam_policy.task.arn
}

// Only attach extra policies if create_task_role=true.
// We have a validation to ensure additional_task_role_policies can only
// be passed when var.create_task_role=true.
resource "aws_iam_role_policy_attachment" "additional_task_policies" {
  count      = length(var.additional_task_role_policies)
  role       = local.task_role_id
  policy_arn = var.additional_task_role_policies[count.index]
}



// Create the execution role if var.create_execution_role=true
resource "aws_iam_role" "execution" {
  name = "${var.family}-execution"
  path = var.iam_role_path

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

// Only create and attach this policy if var.create_execution_role=true
resource "aws_iam_policy" "execution" {
  name        = "${var.family}-execution"
  path        = var.iam_role_path
  description = "${var.family} mesh-task execution policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": ["${var.consul_server_ca_cert_arn}"]
    },
        {
      "Effect": "Allow",
      "Action": ["ssm:GetParameters"],
      "Resource": "*"
    },
        {
      "Effect" : "Allow",
      "Action" : [
      "ec2:DescribeInstances",
            "ec2:DescribeTags",
            "autoscaling:DescribeAutoScalingGroups",
            "ecr:*"
          ],
          "Resource" : "*"
        },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": ["${var.gossip_key_secret_arn}"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect" : "Allow",
          "Action" : [
            "autoscaling:DescribeAutoScalingGroups"
          ],
          "Resource" : "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = local.execution_role_id
  policy_arn = aws_iam_policy.execution.arn
}

// Only attach extra policies if create_execution_role=true.
// We have a validation to ensure additional_execution_role_policies can only
// be passed when var.create_execution_role=true.
resource "aws_iam_role_policy_attachment" "additional_execution_policies" {
  count      = length(var.additional_execution_role_policies)
  role       = local.execution_role_id
  policy_arn = var.additional_execution_role_policies[count.index]
}

