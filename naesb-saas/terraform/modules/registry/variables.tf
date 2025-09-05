
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

variable "app" {
  type = string
}

variable "instance_type" {
  description = "type for aws EC2 instance"
  default     = "t3.small"
}

variable "domain" {
  type = string
}

variable "client_id" {
  description = "id of the OIDC authentication client"
  type        = string
}

variable "client_secret" {
  description = "secret of the OIDC authentication client"
  type        = string
}
