variable "profile" {
  type    = string
  default = "naesb"
}

variable "vpc_id" {
  description = "id of the VPC to deploy resources into"
  type        = string
}

variable "client_id" {
  description = "id of the OIDC authentication client"
  type        = string
}

variable "client_secret" {
  description = "secret of the OIDC authentication client"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs used by resources created"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs used by resources created"
  type        = list(string)
}

variable "private_cidr_blocks" {
  description = "List of private CIDR blocks in VPC"
  type        = list(string)
}

variable "public_cidr_blocks" {
  description = "List of public CIDR blocks in VPC"
  type        = list(string)
}
