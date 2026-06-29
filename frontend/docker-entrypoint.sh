#!/bin/sh
set -e

echo "Starting FoodBridge frontend..."
echo "Backend ALB DNS: $BACKEND_ALB_DNS"

# Replace placeholder variables in Nginx template
envsubst '${BACKEND_ALB_DNS}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

echo "Nginx configuration generated."

# Run Nginx in the foreground
exec nginx -g 'daemon off;'
