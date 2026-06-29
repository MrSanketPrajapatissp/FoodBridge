FROM python:3.11.9-slim

ENV DJANGO_SETTINGS_MODULE=config.settings \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies first (Docker cache optimization)
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend codebase
COPY . /app/

# Run collectstatic during build time
RUN python manage.py collectstatic --noinput

# Copy and prepare entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
