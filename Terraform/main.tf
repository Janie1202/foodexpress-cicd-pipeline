provider "aws" {
  region = "us-east-1" 
}

resource "aws_instance" "foodexpress_server" {
  ami           = "ami-0ec10929233384c7f" #Ubuntu
  instance_type = "t2.micro"
  key_name      = "mykey" 
  tags = { Name = "FoodExpress-Production" }

  # This opens port 80/3000 for your web app
  vpc_security_group_ids = [aws_security_group.allow_web.id]
}

resource "aws_security_group" "allow_web" {
  name = "allow_web_traffic"
  ingress {
    from_port   = 3000 # local host
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