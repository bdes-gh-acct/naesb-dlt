variable "s3_bucket" {
  description = "S3 bucket in which to store the code package"
  type        = string
}

variable "owner" {
  description = "Deployment environment"
  type        = string
}

variable "app" {
  description = "Application name"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs used by resources created"
  type        = list(string)
}

variable "vpc_id" {
  description = "VPC ID in which to deploy assets"
  type        = string
}

variable "username" {
  description = "Username for database"
  type        = string
}

variable "password" {
  description = "Password for database"
  type        = string
}

variable "host" {
  description = "Host for database"
  type        = string
}

variable "database" {
  description = "Default database"
  type        = string
}
