variable "owner" {
  description = "Environment tag"
  type        = string
  default     = "Dev"
}

variable "root_domain" {
  description = "Hosted zone domain (e.g. naesbdlt.org)"
  type        = string
}

variable "app" {
  type = string
}

variable "subdomain" {
  type = string
}
