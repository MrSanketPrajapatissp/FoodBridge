# FoodBridge AWS Deployment Project Context Document

This document serves as the comprehensive history, configuration state, and troubleshooting log for the AWS 3-tier production deployment of the **FoodBridge** application. It contains all context required for AI mentors and developers to understand the project architecture, files, changes, errors resolved, and current live status.

---

## 1. Project Overview

*   **Project Name**: FoodBridge
*   **Description**: A full-stack food rescue platform designed to connect food donors (restaurants, events, homes) with verified NGOs to reduce food waste.
*   **Student/Engineer**: Sanket Sanjay Prajapati
*   **GitHub Repository**: [https://github.com/MrSanketPrajapatissp/FoodBridge](https://github.com/MrSanketPrajapatissp/FoodBridge)
*   **Production Subdomain**: `https://foodbridge.sanketdevs.online`
*   **Root Domain**: `sanketdevs.online` (Registered at BigRock)
*   **Deployment Target**: AWS `ap-south-1` (Mumbai Region)

---

## 2. Tech Stack

*   **Backend Framework**: Django 5.0.3 & Django REST Framework (DRF)
*   **Backend WSGI/Server**: Gunicorn (WSGI HTTP Server)
*   **Frontend Framework**: React 18, Vite 8, TailwindCSS 3.4, React Router v7
*   **Frontend Web Server**: Nginx (compiled statically inside Docker container)
*   **Production Database**: Amazon RDS PostgreSQL 16 (`db.t4g.micro`)
*   **Containerization**: Docker (multi-stage builds) & private Amazon Elastic Container Registry (ECR)
*   **CI/CD Pipeline**: GitHub Actions
*   **Remote Server Management**: AWS Systems Manager (SSM) Agent (run-command shell scripts)
*   **Media/Image Storage**: Cloudinary Cloud Storage Integration
*   **Email Gateway**: Gmail SMTP / SendGrid API for transactional notification emails

---

## 3. Deployment Architecture (3-Tier)

The application is deployed inside a custom VPC with a multi-tier subnet structure to guarantee isolation and security:

```
[Internet]
    │
    ▼ (HTTPS: 443 with SSL)
[External Application Load Balancer] (WebALB-SG)
    │
    ▼ (HTTP: 80)
[Public Subnets (ap-south-1a / ap-south-1b)]
    └── Web Servers (React + Nginx) inside Auto Scaling Group (Web-SG)
    └── Public NAT Gateway (inside ap-south-1a)
    │
    ▼ (HTTP: 8000 via Internal ALB)
[Private App Subnets (ap-south-1a / ap-south-1b)]
    └── App Servers (Django + Gunicorn) inside Auto Scaling Group (App-SG)
    │
    ▼ (PostgreSQL: 5432)
[Private Database Subnets (ap-south-1a / ap-south-1b)]
    └── Amazon RDS PostgreSQL Database (Database-SG)
```

### Security Groups Specification (Defense-In-Depth)
1.  **`WebALB-SG` (External ALB Security Group)**:
    *   Ingress: Port 80 (HTTP) and Port 443 (HTTPS) from `0.0.0.0/0`.
2.  **`Web-SG` (Web Servers Security Group)**:
    *   Ingress: Port 80 (HTTP) from `WebALB-SG` only.
3.  **`AppALB-SG` (Internal ALB Security Group)**:
    *   Ingress: Port 8000 (Gunicorn) from `Web-SG` only.
4.  **`App-SG` (App Servers Security Group)**:
    *   Ingress: Port 8000 from `AppALB-SG` only.
    *   Egress: Allow all outbound (outbound traffic routed to NAT Gateway).
5.  **`Database-SG` (Database Security Group)**:
    *   Ingress: Port 5432 (PostgreSQL) from `App-SG` only.

---

## 4. All Files Generated & Modified

Below is the list of all files created or modified during the AWS 3-Tier production deployment:

### Backend Dockerization
*   **`backend/Dockerfile`**: Multi-stage Python 3.11 build to install dependencies, run collectstatic, and expose Gunicorn on port 8000.
*   **`backend/.dockerignore`**: Excludes virtual environments (`venv/`), local sqlite database, logs, and credentials from backend Docker builds.
*   **`backend/docker-entrypoint.sh`**: Automated entrypoint script that runs migrations, collects static assets, and automatically seeds default credentials (Admin, Donor, NGO) on container startup.
*   **`backend/donations/views.py`**: Added `/api/health/` endpoints returning `{"status": "ok"}` for target group health checks.
*   **`backend/config/urls.py`**: Configured health check path `/api/health/` andStats routes in URL mapping.
*   **`backend/config/settings.py`**: Configured settings to load database URLs via `dj-database-url`, dynamically parse `CORS_ALLOWED_ORIGINS` from environment, and override `ALLOWED_HOSTS = ['*']` in production to prevent container routing failures.

### Frontend Dockerization & Server Proxy
*   **`frontend/Dockerfile`**: Multi-stage Node.js (Node 22) build compiling Vite static assets and copying them to an Nginx server image.
*   **`frontend/.dockerignore`**: Excludes `node_modules/`, `.git`, and environment files from frontend build context.
*   **`frontend/nginx.conf.template`**: Configures Nginx to serve React client router index and proxy all `/api/` traffic internally to the Backend Load Balancer (`$BACKEND_ALB_DNS`).
*   **`frontend/docker-entrypoint.sh`**: Substitutes `$BACKEND_ALB_DNS` inside Nginx configuration files dynamically at container startup before launching Nginx.

### User Data & Automations
*   **`scripts/app-server-userdata.sh`**: App Server EC2 bootstrap script that downloads Docker, logs in to ECR, pulls credentials from SSM Parameter Store, writes to `/etc/foodbridge/backend.env`, and starts the backend container.
*   **`scripts/web-server-userdata.sh`**: Web Server EC2 bootstrap script that pulls `$BACKEND_ALB_DNS` from SSM Parameter Store dynamically, writes to `/etc/foodbridge/frontend.env`, and boots Nginx container.

### GitOps CI/CD Pipelines
*   **`.github/workflows/deploy.yml`**: GitHub Actions pipeline triggering on main branch pushes. Compiles and pushes backend/frontend images to ECR, and executes remote container reload via SSM Agent.
*   **`.github/workflows/rollback.yml`**: Manual roll-back workflow allowing the user to input a specific Git commit SHA to pull and roll back Web/App servers via SSM Agent.

---

## 5. Git & Deployment History

*   **Primary Git Commit SHA**: `83302b5` (latest snapshot state).
*   **Deploy Workflow Status**: 100% Successful.
*   **Docker Container Status**: Frontend Nginx (port 80) and Backend Gunicorn (port 8000) are fully running.
*   **Target Group Health**: Both Web Target Group (`foodbridge-web-tg`) and App Target Group (`foodbridge-app-tg`) show `Healthy` status (Green).

---

## 6. All Errors Encountered & Resolved

### Error 1: Database Connection Refused (`FATAL: database "foodbridge" does not exist`)
*   **Context**: Backend container failed to connect to PostgreSQL on RDS.
*   **Cause**: The database connection URL was pointing to `/foodbridge`, but the default database name on RDS (without custom name overrides) is `/postgres`.
*   **Resolution**: Updated `DATABASE_URL` in SSM Parameter Store and `.env` files to point to `/postgres`.

### Error 2: Vite Frontend Build Failure during CI/CD (`ReferenceError: CustomEvent is not defined`)
*   **Context**: GitHub Actions failed during the frontend compilation stage.
*   **Cause**: The base Docker image in `frontend/Dockerfile` was using an outdated Node 18 version, which lacks modern API support required by Vite.
*   **Resolution**: Upgraded the builder base image in `frontend/Dockerfile` to `node:22-alpine`.

### Error 3: Health Check returns `400 Bad Request` on AWS ALB
*   **Context**: EC2 Instance targets showed `Unhealthy` status in `foodbridge-app-tg`.
*   **Cause**: AWS ALBs perform health checks by sending requests using the target EC2's private IP as the Host header (e.g. `192.168.128.119`). Django's security middleware blocks requests with unauthorized Host headers. Standard hostname lookup inside Docker returns the container bridge IP (e.g. `172.17.0.2`), not the EC2 host private IP.
*   **Resolution**: Configured `/foodbridge/ALLOWED_HOSTS` in SSM Parameter Store and `settings.py` to allow `*` (wildcard) in production since the instances are private and secure behind ALBs.

### Error 4: GitHub Actions Workflow Startup Failure (`Unrecognized named-value: 'secrets'`)
*   **Context**: Workflow failed immediately with syntax errors in `deploy.yml`.
*   **Cause**: GitHub Actions parser does not allow direct evaluation of `secrets` inside step-level `if:` conditionals due to security policies.
*   **Resolution**: Mapped the AWS secret keys to step-level environment variables first, and then checked `if: ${{ env.APP_SERVER_INSTANCE_ID != '' }}`.

### Error 5: Subdomain Resolving to `NXDOMAIN` (Site Not Reachable)
*   **Context**: `foodbridge.sanketdevs.online` failed to load in browsers.
*   **Cause**: In BigRock domain settings, the user added CNAME host names as `foodbridge.sanketdevs.online`. BigRock automatically appends the root domain name, causing the DNS server to register `foodbridge.sanketdevs.online.sanketdevs.online`.
*   **Resolution**: Deleted the old CNAME records and added them with Host names stripped of the root domain: `foodbridge` and `_cb51cfb591083724dd252be04f17716e.foodbridge`.

---

## 7. Key Conversations & Q&A

### Q1: Can I select custom Availability Zones and subnets for my ALB?
*   **Answer**: Yes, Application Load Balancers (ALBs) require at least two subnets in different Availability Zones (AZs) for high availability. In our VPC structure:
    *   **External ALB** was placed in Public subnets (`foodbridge-public-a` in `ap-south-1a` and `foodbridge-public-b` in `ap-south-1b`).
    *   **Internal ALB** was placed in Private App subnets (`foodbridge-app-a` and `foodbridge-app-b`).

### Q2: Why is the website loading on the External ALB DNS but not on my subdomain?
*   **Answer**: This is a classic DNS propagation delay or browser caching issue. Local ISP resolvers can take 10-30 minutes to update CNAME caches. Flushing the local DNS (`ipconfig /flushdns` in Windows CMD), testing on mobile network cellular data (Wi-Fi turned off), or changing local DNS servers to Google DNS (`8.8.8.8`) bypasses this cache.

---

## 8. Portfolio Resume Highlights (DevOps Engineer Profile)

Below is the structured experience highlights written for Sanket Sanjay Prajapati to demonstrate competence as an AWS Cloud DevOps Engineer:

*   **VPC Design**: Architected a secure, multi-AZ VPC environment with isolated public, private application, and database subnets using AWS NAT Gateways and Internet Gateways.
*   **High Availability**: Deployed stateless application layers inside Auto Scaling Groups (ASG) backed by Application Load Balancers (ALBs) ensuring zero downtime.
*   **Secrets & Security**: Implemented secure Parameter Store credentials loading, avoiding hardcoded keys. Isolated layers using restricted security group policies.
*   **GitOps & CI/CD**: Authored complete GitHub Actions workflows compiling multi-stage optimized Docker containers, pushing to private ECR registries, and auto-deploying via SSM Agent commands.

---

## 9. Current Project Status

*   **Status**: **100% COMPLETE & LIVE**
*   **Production URL**: `https://foodbridge.sanketdevs.online`
*   **Active Resources**:
    *   VPC with NAT Gateway and Elastic IP.
    *   Multi-AZ EC2 instances managed by ASG.
    *   Dual Application Load Balancers (Internal & External).
    *   SSL Certificate validated and active on HTTPS port 443.
    *   SSM Parameter Store variables synced.
    *   ECR Private Registries populated.
    *   GitHub Actions workflow fully operational.
    *   Database fully migrated and auto-seeded on Amazon RDS.

---

## 10. AI Mentor's Teaching Notes

*   **Parameter Store**: Storing secrets in AWS Parameter Store with decryption (`SecureString`) prevents credentials from leaking into Git repositories and enables central configuration management.
*   **3-Tier Isolation**: Keeping application and database nodes in private subnets with no public IPs prevents direct external attack vectors. NAT Gateways allow private nodes to query packages or ECR securely.
*   **Dual Load Balancing**: Web Servers proxy requests to Backend Gunicorn nodes using an Internal ALB. This hides Gunicorn from the public, ensures SSL offloading at the External ALB, and creates clean routing boundaries.
*   **Nginx Template Proxy**: React is served as static code. The backend API URLs must be proxied dynamically. Using `envsubst` to replace `$BACKEND_ALB_DNS` inside Nginx configuration on container startup allows running identical frontend images in development, staging, or production.
*   **Cost Management**: Standard NAT Gateway pricing is `$0.045/hour` (~$32/month) and ALBs cost `$0.0225/hour` (~$16/month). For testing projects, these resources should be deleted via ASG scaling down and terminating nodes when not active.

---

## 11. Infrastructure Details Collected

Below are the 18 infrastructure data points tracked in this project:

1.  **VPC ID**: `vpc-040d36291ea97611e`
2.  **Public Subnet A**: `subnet-0bd1c08918472c219`
3.  **Public Subnet B**: `subnet-008d77a988c0fb4e0`
4.  **Private App Subnet A**: `subnet-0c9cd0c51e8c18a5e`
5.  **Private App Subnet B**: `subnet-0900b947aa4482c3c`
6.  **Private DB Subnet A**: `subnet-002507787cdd138ca`
7.  **Private DB Subnet B**: `subnet-0580b40019ff95fcb`
8.  **NAT Gateway ID**: `nat-075e8d9fdc98e4d7c`
9.  **Internet Gateway ID**: `igw-0df30b35588383182`
10. **IAM Instance Profile / Role**: `FoodBridgeEC2Role`
11. **ECR Registry URI**: `231101979896.dkr.ecr.ap-south-1.amazonaws.com`
12. **ECR Repositories**: `foodbridge-backend` and `foodbridge-frontend`
13. **Internal ALB DNS**: `internal-foodbridge-internal-alb-1296614138.ap-south-1.elb.amazonaws.com`
14. **External ALB DNS**: `foodbridge-external-alb-1206640853.ap-south-1.elb.amazonaws.com`
15. **Target Groups**: `foodbridge-app-tg` (port 8000) and `foodbridge-web-tg` (port 80)
16. **App Server Instance ID**: `i-01b7a4c4e983f4ddd` (Managed by ASG)
17. **Web Server Instance ID**: `i-0c7c777ac0561078b` (Managed by ASG)
18. **GitHub Secrets**:
    *   `AWS_ACCESS_KEY_ID`
    *   `AWS_SECRET_ACCESS_KEY`
    *   `AWS_REGION` (`ap-south-1`)
    *   `APP_SERVER_INSTANCE_ID`
    *   `WEB_SERVER_INSTANCE_ID`

---

## 12. Faculty's Original Instruction (Summary)

*   Deploy a multi-tier web application using standard Cloud and DevOps practices.
*   Isolate web traffic from the application database layer using network subnets.
*   Enforce security policies using Security Groups.
*   Use Application Load Balancers for routing and SSL termination.
*   Store secrets and configurations inside a secure configuration management service.
*   Establish continuous integration and continuous deployment (CI/CD) pipelines to push updates on git commits.
