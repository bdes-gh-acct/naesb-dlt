
variable "vpc_id" {
  description = "The ID of the VPC in which the nodes will be deployed.  Uses default VPC if not supplied."
  type        = string
  default     = null
}

variable "subnet_ids" {
  description = "List of subnet IDs used by database subnet group created"
  type        = list(string)
  default     = []
}


variable "owner" {
  description = "Environment tag"
  default     = "Dev"
}

variable "seed" {
  description = "Seed used for agent wallet"
  type        = string
  default     = null
}

variable "alias" {
  description = "alias for DNS and naming"
  type        = string
}

variable "label" {
  description = "Label for DID on indy ledger"
  type        = string
}

variable "compose_bucket" {
  description = "S3 bucket holding docker-compose file"
  type        = string
}

variable "compose_key" {
  description = "S3 bucket holding docker-compose file"
  type        = string
}

variable "nginx_key" {
  description = "S3 bucket holding nginx file"
  type        = string
}

variable "app" {
  type = string
}

variable "instance_type" {
  description = "type for aws EC2 instance"
  default     = "t3.small"
}

variable "indy_role" {
  description = "Role for DID on indy ledger"
  type        = string
}

variable "domain" {
  type = string
}
