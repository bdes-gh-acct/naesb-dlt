variable "cidr_vpc" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}
variable "cidr_subnet_1" {
  description = "CIDR block for the public subnet"
  default     = "10.0.2.0/24"
}

variable "cidr_subnet_2" {
  description = "CIDR block for the public subnet"
  default     = "10.0.1.0/24"
}

variable "cidr_subnet_3" {
  description = "CIDR block for the private subnet"
  default     = "10.0.3.0/24"
}

variable "cidr_subnet_4" {
  description = "CIDR block for the private subnet"
  default     = "10.0.4.0/24"
}

variable "availability_zone" {
  description = "availability zone to create subnet"
  default     = "us-east-1a"
}

variable "availability_zone_2" {
  description = "availability zone to create subnet"
  default     = "us-east-1b"
}

variable "owner" {
  description = "Environment tag"
  default     = "Dev"
}

variable "app" {
  type = string
}