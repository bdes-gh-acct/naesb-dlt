output "gossip_key_secret_arn" {
  value = aws_secretsmanager_secret.gossip_key.arn
}

output "ca_key_secret_arn" {
  value = aws_secretsmanager_secret.ca_key.arn
}

output "cluster_tag_key" {
  value = local.consul_cluster_tag_key
}

output "cluster_tag_value" {
  value = local.consul_cluster_tag_value
}

output "security_group_id" {
  value = module.consul_cluster.security_group_id
}

output "gossip_encryption_key" {
  value     = random_id.gossip_encryption_key.b64_std
  sensitive = true
}
