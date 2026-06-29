# Stage 1: Build React assets using Vite
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Set VITE_API_URL to relative '/api' path. 
# Nginx reverse proxy will catch this and route to AWS Internal ALB.
ENV VITE_API_URL=/api

RUN npm run build

# Stage 2: Serve static build assets with Nginx
FROM nginx:alpine

RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy configurations
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
