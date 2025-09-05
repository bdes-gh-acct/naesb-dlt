locals {
  path      = "../../packages/db-migration/build/main.zip"
  etag_path = "../../packages/db-migration/build/main.js"
}

resource "aws_s3_bucket_object" "package" {
  bucket = var.s3_bucket
  key    = "deployment/lambda/${var.owner}-${var.app}.zip"
  source = local.path

  # The filemd5() function is available in Terraform 0.11.12 and later
  # For Terraform 0.11.11 and earlier, use the md5() function and the file() function:
  # etag = "${md5(file("path/to/file"))}"
  etag = filemd5(local.etag_path)
}

resource "aws_lambda_function" "this" {
  function_name     = "${var.app}-${var.owner}-db-migration"
  s3_bucket         = var.s3_bucket
  s3_key            = aws_s3_bucket_object.package.key
  s3_object_version = aws_s3_bucket_object.package.version_id
  runtime           = "nodejs18.x"
  handler           = "main.handler"
  timeout           = 600
  role              = aws_iam_role.role.arn
  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [aws_security_group.this.id]

  }
  environment {
    variables = {
      PGUSER     = var.username
      PGHOST     = var.host
      PGPASSWORD = var.password
      PGDATABASE = var.database
    }
  }
}

resource "aws_lambda_invocation" "example" {
  function_name = aws_lambda_function.this.function_name

  triggers = {
    redeployment = sha1(jsonencode([
      aws_lambda_function.this.environment
    ]))
  }

  input = jsonencode({
    key1 = "value1"
    key2 = "value2"
  })
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = [
        "apigateway.amazonaws.com",
        "lambda.amazonaws.com",
      ]
    }
  }
}

data "aws_iam_policy_document" "policy" {
  statement {
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_function.this.arn]
  }
}

resource "aws_iam_role_policy_attachment" "iam_role_policy_attachment_lambda_vpc_access_execution" {
  role       = aws_iam_role.role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}


resource "aws_iam_role" "role" {
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  description        = "access for db migration lambda"
  name               = "${var.app}-${var.owner}-dbmigration"
  path               = "/"
}

resource "aws_iam_role_policy" "policy" {
  name   = "${var.app}-${var.owner}-db-lambda"
  policy = data.aws_iam_policy_document.policy.json
  role   = aws_iam_role.role.id
}

resource "aws_security_group" "this" {
  name        = "${var.app}-${var.owner}-db-lambda"
  description = "Secure db migration lambda"
  vpc_id      = var.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "allow_tls"
  }
}
