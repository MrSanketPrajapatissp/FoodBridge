#!/bin/bash
set -euxo pipefail

echo "=== FoodBridge App Server Setup ==="
echo "AWS CLI pre-installed on Amazon Linux 2023 — skipping."

# Update and install Docker and JQ
dnf update -y
dnf install -y docker jq
systemctl start docker
systemctl enable docker

# Configuration variables
AWS_REGION=ap-south-1
ECR_URI=123456789012.dkr.ecr.ap-south-1.amazonaws.com

# Login to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Create environment configuration directory
mkdir -p /etc/foodbridge

# Retrieve all parameters from AWS Parameter Store to inject at runtime
echo "Retrieving Parameter Store values..."
echo "SECRET_KEY=$(aws ssm get-parameter --name /foodbridge/SECRET_KEY --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "DATABASE_URL=$(aws ssm get-parameter --name /foodbridge/DATABASE_URL --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "ALLOWED_HOSTS=$(aws ssm get-parameter --name /foodbridge/ALLOWED_HOSTS --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "CORS_ALLOWED_ORIGINS=$(aws ssm get-parameter --name /foodbridge/CORS_ALLOWED_ORIGINS --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "CLOUDINARY_CLOUD_NAME=$(aws ssm get-parameter --name /foodbridge/CLOUDINARY_CLOUD_NAME --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "CLOUDINARY_API_KEY=$(aws ssm get-parameter --name /foodbridge/CLOUDINARY_API_KEY --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "CLOUDINARY_API_SECRET=$(aws ssm get-parameter --name /foodbridge/CLOUDINARY_API_SECRET --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "EMAIL_HOST_USER=$(aws ssm get-parameter --name /foodbridge/EMAIL_HOST_USER --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "EMAIL_HOST_PASSWORD=$(aws ssm get-parameter --name /foodbridge/EMAIL_HOST_PASSWORD --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "FRONTEND_URL=$(aws ssm get-parameter --name /foodbridge/FRONTEND_URL --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "EMAIL_BACKEND_TYPE=$(aws ssm get-parameter --name /foodbridge/EMAIL_BACKEND_TYPE --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env
echo "DEBUG=$(aws ssm get-parameter --name /foodbridge/DEBUG --with-decryption --query Parameter.Value --output text --region $AWS_REGION)" >> /etc/foodbridge/backend.env

# Pull latest backend image
docker pull $ECR_URI/foodbridge-backend:latest

# Run Django Backend Container
docker run -d \
  --name foodbridge-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file /etc/foodbridge/backend.env \
  $ECR_URI/foodbridge-backend:latest

echo "FoodBridge backend container started."

# Verify internal health check (using /api/health/ route mapping)
echo "Waiting for health check..."
sleep 15
curl -s http://localhost:8000/api/health/ || echo "Health check failed — check container logs"
echo "App Server setup complete."
