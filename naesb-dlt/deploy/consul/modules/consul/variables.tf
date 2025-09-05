
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

variable "enable_gossip_encryption" {
  description = "Encrypt gossip traffic between nodes. Must also specify encryption key."
  type        = bool
  default     = true
}

variable "enable_rpc_encryption" {
  description = "Encrypt RPC traffic between nodes. Must also specify TLS certificates and keys."
  type        = bool
  default     = true
}

variable "ca_path" {
  description = "Path to the directory of CA files used to verify outgoing connections."
  type        = string
  default     = "/opt/consul/tls/ca"
}

variable "cert_file_path" {
  description = "Path to the certificate file used to verify incoming connections."
  type        = string
  default     = "/opt/consul/tls/consul.crt.pem"
}

variable "key_file_path" {
  description = "Path to the certificate key used to verify incoming connections."
  type        = string
  default     = "/opt/consul/tls/consul.key.pem"
}

variable "owner" {
  description = "Environment tag"
  default     = "Dev"
}

variable "app" {
  type = string
}

variable "domain" {
  type = string
}

variable "iam_permissions_boundary" {
  description = "If set, restricts the created IAM role to the given permissions boundary"
  type        = string
  default     = null
}

