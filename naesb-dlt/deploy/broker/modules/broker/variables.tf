variable "broker_count" {
  description = "number of broker nodes"
  type        = number
  default     = 2
}

variable "broker_instance_type" {
  description = "broker node instance type"
  type        = string
  default     = "kafka.t3.small"
}

variable "subnet_ids" {
  description = "List of subnet IDs used by database subnet group created"
  type        = list(string)
  default     = []
}

variable "allowed_cidr_blocks" {
  description = "A list of CIDR blocks which are allowed to access the database"
  type        = list(string)
  default     = []
}

variable "vpc_id" {
  description = "ID of the VPC where to create security group"
  type        = string
}

variable "name" {
  description = "name for the kafka cluster"
  type        = string
}

variable "owner" {
  description = "owner for the kafka cluster"
  type        = string
}

variable "app" {
  description = "application for the kafka cluster"
  type        = string
}
