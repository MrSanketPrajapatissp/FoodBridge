#!/bin/bash
set -euxo pipefail

echo "=== FoodBridge Web Server Setup ==="
echo "AWS CLI pre-installed on Amazon Linux 2023 — skipping."

# Update and install Docker
dnf update -y
dnf install -y docker
systemctl start docker
systemctl enable docker

# Configuration variables
AWS_REGION=ap-south-1
ECR_URI=231101979896.dkr.ecr.ap-south-1.amazonaws.com

# Login to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Create environment configuration directory
mkdir -p /etc/foodbridge

# Retrieve Internal Load Balancer DNS dynamically from AWS Parameter Store
echo "Retrieving Internal ALB DNS from Parameter Store..."
echo "BACKEND_ALB_DNS=$(aws ssm get-parameter --name /foodbridge/BACKEND_ALB_DNS --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" > /etc/foodbridge/frontend.env

# Pull latest frontend image
docker pull $ECR_URI/foodbridge-frontend:latest

# Run Nginx Frontend Container
docker run -d \
  --name foodbridge-frontend \
  --restart unless-stopped \
  -p 80:80 \
  --env-file /etc/foodbridge/frontend.env \
  $ECR_URI/foodbridge-frontend:latest

echo "FoodBridge frontend container started."
echo "Web Server setup complete."
