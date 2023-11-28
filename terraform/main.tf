provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "techwebsite_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "techwebsite"
  }
}

resource "aws_internet_gateway" "techwebsite_igw" {
  vpc_id = aws_vpc.techwebsite_vpc.id

  tags = {
    Name = "techwebsite"
  }
}

resource "aws_route_table" "techwebsite_rt" {
  vpc_id = aws_vpc.techwebsite_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.techwebsite_igw.id
  }

  tags = {
    Name = "techwebsite"
  }
}

resource "aws_route_table_association" "techwebsite_rta" {
  subnet_id      = aws_subnet.techwebsite_subnet.id
  route_table_id = aws_route_table.techwebsite_rt.id
}

resource "aws_route_table_association" "techwebsite_rta2" {
  subnet_id      = aws_subnet.techwebsite_subnet_2.id
  route_table_id = aws_route_table.techwebsite_rt.id
}

resource "aws_subnet" "techwebsite_subnet" {
  vpc_id                  = aws_vpc.techwebsite_vpc.id
  cidr_block              = "10.0.0.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "techwebsite"
  }
}

resource "aws_subnet" "techwebsite_subnet_2" {
  vpc_id                  = aws_vpc.techwebsite_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
  tags = {
    Name = "techwebsite"
  }
}

resource "aws_db_instance" "techwebsite_db" {
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "mysql"
  engine_version         = "5.7"
  instance_class         = "db.t2.micro"
  identifier             = "techwebsite-db"
  username               = "admin"
  password               = "password"
  parameter_group_name   = "default.mysql5.7"
  skip_final_snapshot    = true
  db_subnet_group_name   = aws_db_subnet_group.techwebsite_subnet.name
  vpc_security_group_ids = [aws_security_group.techwebsite_sg.id]
  publicly_accessible    = true
  tags = {
    Name = "techwebsite"
  }
}

resource "aws_security_group" "techwebsite_sg" {
  name        = "techwebsiteSG"
  description = "Allow incoming database traffic"
  vpc_id      = aws_vpc.techwebsite_vpc.id
  tags = {
    Name = "techwebsite"
  }

  ingress {
    from_port        = 3306
    to_port          = 3306
    protocol         = "tcp"
    cidr_blocks      = ["70.130.160.218/32"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_db_subnet_group" "techwebsite_subnet" {
  name       = "techwebsite-subnet-group"
  subnet_ids = [aws_subnet.techwebsite_subnet.id, aws_subnet.techwebsite_subnet_2.id]
  tags = {
    Name = "techwebsite"
  }
}