resource "aws_vpc" "vpc" {
  cidr_block           = var.cidr_vpc
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    owner = var.owner
    app   = var.app
    NAME  = "${var.owner}-${var.app}"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}"
  }
}

resource "aws_subnet" "subnet_public_1" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.cidr_subnet_1
  map_public_ip_on_launch = "true"
  availability_zone       = var.availability_zone
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}-public-1"
  }
}

resource "aws_subnet" "subnet_public_2" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.cidr_subnet_2
  map_public_ip_on_launch = "true"
  availability_zone       = var.availability_zone_2
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}-public-2"
  }
}

resource "aws_subnet" "subnet_private_1" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.cidr_subnet_3
  map_public_ip_on_launch = "true"
  availability_zone       = var.availability_zone
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}-private-1"
  }
}

resource "aws_subnet" "subnet_private_2" {
  vpc_id                  = aws_vpc.vpc.id
  cidr_block              = var.cidr_subnet_4
  availability_zone       = var.availability_zone_2
  map_public_ip_on_launch = true
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}-private-2"
  }
}

resource "aws_route_table" "rtb_public" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    owner = var.owner
    app   = var.app
  }
}

resource "aws_route_table_association" "rta_subnet_public" {
  subnet_id      = aws_subnet.subnet_public_1.id
  route_table_id = aws_route_table.rtb_public.id
}

resource "aws_route_table_association" "rta_subnet_public_2" {
  subnet_id      = aws_subnet.subnet_public_2.id
  route_table_id = aws_route_table.rtb_public.id
}

resource "aws_security_group" "sg" {
  name   = "${var.owner}-api-sg-1"
  vpc_id = aws_vpc.vpc.id

  tags = {
    owner = var.owner
    app   = var.app
  }
}

resource "aws_security_group_rule" "out" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}

resource "aws_security_group_rule" "ssl" {
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.sg.id
}


resource "aws_eip" "nat_gateway" {
  vpc = true
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_gateway.id
  subnet_id     = aws_subnet.subnet_public_1.id
  tags = {
    owner = var.owner
    app   = var.app
    Name = "${var.owner}-${var.app}"
  }
}
