output "cluster_endpoint" {
  description = "Writer endpoint for the cluster"
  value       = try(aws_rds_cluster_instance.this["reece"].endpoint, "")
}