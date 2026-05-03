provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "foodexpress_server" {
  ami           = "ami-0ec10929233384c7f"
  instance_type = "t3.micro"
  key_name      = "final"  

  vpc_security_group_ids = [aws_security_group.allow_web.id]

  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    docker pull sreytoch12/foodexpress-api:latest
    docker run -d --name foodexpress-api \
      -p 3000:3000 sreytoch12/foodexpress-api:latest
  EOF

  tags = {
    Name = "FoodExpress-Server"
  }
}

resource "aws_security_group" "allow_web" {
  name = "allow_web_traffic"

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

output "public_ip" {
  value = aws_instance.foodexpress_server.public_ip
}