variable "profile" {
  type    = string
  default = "naesb"
}

variable "root_organization_name" {
  description = "Root organization to use for CA"
  type        = string
  default     = "NAESB"
}

variable "vpc_id" {
  description = "id of the VPC to deploy resources into"
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
