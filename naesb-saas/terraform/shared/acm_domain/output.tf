output "zone_id" {
  value = data.aws_route53_zone.this.id
}

output "acm_cert_arn" {
  value = aws_acm_certificate.this.arn
}
