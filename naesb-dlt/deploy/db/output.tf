output "db_secret_arn" {
  value = aws_secretsmanager_secret.password_key.arn
}

output "cluster_endpoint" {
  description = "Writer endpoint for the cluster"
  value       = module.db.cluster_endpoint
}
