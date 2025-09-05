variable "vpc_id" {
  description = "Id for the VPC"
}

variable "subnet_ids" {
  description = "Subnet Ids for the VPC"
}

variable "allowed_inbound_cidr_blocks" {
  description = "Allowed inbound cidr blocks to access resources"
}

variable "bucket_id" {
  description = "Bucket for storing configuration files"
}

variable "seed" {
  description = "Seed used for agent wallet"
  type        = string
  default     = null
}

variable "bootstrap_brokers" {
  description = "Bootstrap brokers"
  type        = string
}

variable "label" {
  description = "Label for DID on indy ledger"
  type        = string
}

variable "indy_role" {
  description = "Role for DID on indy ledger"
  type        = string
}

variable "acapy_admin_port" {
  description = "Port for ACAPY Admin API"
  type        = number
  default     = 6002
}

variable "acapy_service_port" {
  description = "Port for ACAPY Agent Service"
  type        = number
  default     = 10000
}

variable "db_password_arn" {
  description = "ARN of secret containing DB Password"
}


variable "owner" {
  description = "Environment tag"
  default     = "Dev"
}

variable "nginx_key" {
  type = string
}

variable "compose_key" {
  description = "Key for docker-compose file"
}

variable "instance_type" {
  description = "Size of the peer ec2 instance"
  default     = "t3.large"
}

variable "peer_name" {
  description = "Name of the peer"
  default     = "peer0"
}

variable "org_id" {
  description = "Org ID from Identity provider"
}

variable "msp_id" {
  description = "MSP ID for CA"
}

variable "org_name" {
  description = "Name of organization"
}

variable "app" {
  type = string
}

variable "orderer_name" {
  type     = string
  default  = "orderer"
  nullable = true
}

variable "admin" {
  type    = bool
  default = false
}

variable "role_id" {
  type = string
}

variable "role_name" {
  type = string
}

variable "domain" {
  type = string
}

variable "gossip_key_secret_arn" {
  type = string
}
variable "ca_key_secret_arn" {
  type = string
}

variable "cluster_tag_key" {
  type = string
}

variable "cluster_tag_value" {
  type = string
}

variable "consul_security_group_id" {
  type = string
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

variable "db_host" {
  description = "Host of the database"
}
