provider "aws" {
  region = "us-east-1"
}

# 1. Default VPC and Subnets for the Load Balancer
resource "aws_default_vpc" "default" {}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [aws_default_vpc.default.id]
  }
}

# 2. Security Group for the Load Balancer (Allows HTTP 80)
resource "aws_security_group" "alb_sg" {
  name        = "ALB-SG"
  description = "Allow HTTP inbound traffic"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
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

# 3. Security Group for EC2 (Only allows traffic from the ALB)
resource "aws_security_group" "foodexpress_sg" {
  name   = "FoodExpress-App-SG"
  vpc_id = aws_default_vpc.default.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
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

# 4. Application Load Balancer
resource "aws_lb" "app_lb" {
  name               = "foodexpress-load-balancer"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

# 5. Target Group (Routes traffic to port 3000)
resource "aws_lb_target_group" "app_tg" {
  name     = "foodexpress-target-group"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_default_vpc.default.id

  health_check {
    path = "/"
    port = "3000"
  }
}

# 6. ALB Listener (Listens on port 80 and forwards to Target Group)
resource "aws_lb_listener" "app_listener" {
  load_balancer_arn = aws_lb.app_lb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

# 7. Launch Template for Auto Scaling
resource "aws_launch_template" "app_lt" {
  name_prefix   = "foodexpress-lt-"
  image_id      = "ami-091138d0f0d41ff90"
  instance_type = "t3.medium"
  key_name      = "cloud3"

  network_interfaces {
    security_groups             = [aws_security_group.foodexpress_sg.id]
    associate_public_ip_address = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    docker pull sreytoch12/foodexpress-api:latest
    docker run -d --name foodexpress-api -p 3000:3000 sreytoch12/foodexpress-api:latest
  EOF
  )
}

# 8. Auto Scaling Group
resource "aws_autoscaling_group" "app_asg" {
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.app_tg.arn]
  min_size           = 1
  max_size           = 2
  desired_capacity   = 1

  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }
}

# 9. Output the Load Balancer URL (Requirement K)
output "website_url" {
  value = "http://${aws_lb.app_lb.dns_name}"
}