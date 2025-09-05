output "gossip_key_secret_arn" {
  value = module.consul.gossip_key_secret_arn
}

output "security_group_id" {
  value = module.consul.security_group_id
}

output "ca_key_secret_arn" {
  value = module.consul.ca_key_secret_arn
}

output "vault_ca_key_secret_arn" {
  value = module.vault.ca_key_secret_arn
}

output "cluster_tag_key" {
  value = module.consul.cluster_tag_key
}

output "cluster_tag_value" {
  value = module.consul.cluster_tag_value
}

output "peer_role_id" {
  value = aws_iam_role.peer_role.id
}

output "peer_role_name" {
  value = aws_iam_role.peer_role.name
}

output "peer_role_arn" {
  value = aws_iam_role.peer_role.arn
}

output "public_subnet_ids" {
  value = var.public_subnet_ids
}

output "vpc_id" {
  value = var.vpc_id
}

output "private_subnet_ids" {
  value = var.private_subnet_ids
}

output "private_cidr_blocks" {
  value = var.private_cidr_blocks
}

output "public_cidr_blocks" {
  value = var.public_cidr_blocks
}
