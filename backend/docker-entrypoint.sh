#!/bin/bash
set -e

echo "Starting FoodBridge backend..."

# Run database migrations at container startup
echo "Applying database migrations..."
python manage.py migrate --noinput
echo "Migrations complete."

# Start Django-Q cluster in the background
echo "Starting Django-Q cluster..."
python manage.py qcluster &

# Start Gunicorn in the foreground to keep container running
echo "Starting Gunicorn server..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 120
