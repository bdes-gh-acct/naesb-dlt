variable "profile" {
  type    = string
  default = "naesb"
}



variable "name" {
  type    = string
  default = "test"
}

variable "family" {
  type    = string
  default = "test"
}

variable "environment" {
  type    = string
  default = "dev"
}



variable "root_organization_name" {
  description = "Root organization to use for CA"
  type        = string
  default     = "NAESB"
}
