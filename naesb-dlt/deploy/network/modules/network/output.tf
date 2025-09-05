output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "private_sn_1" {
  value = aws_subnet.subnet_private_1.id
}

output "private_sn_2" {
  value = aws_subnet.subnet_private_2.id
}

output "public_sn_1" {
  value = aws_subnet.subnet_public_1.id
}

output "public_sn_2" {
  value = aws_subnet.subnet_public_2.id
}

output "sg_name" {
  value = aws_security_group.sg.name
}

output "sg_id" {
  value = aws_security_group.sg.id
}