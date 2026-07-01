# FoodBridge — Production-Grade 3-Tier AWS Architecture & Platform

> **A High-Availability, Secure, and Automated Food Waste Reduction Platform Connecting Donors with Verified NGOs.**
> 
> **Production Live URL**: [https://foodbridge.sanketdevs.online](https://foodbridge.sanketdevs.online)
> 
> **Stack**: Django 5 (REST API Backend) + React 18 & Vite (Nginx Frontend) + Amazon RDS PostgreSQL (Database) + AWS ECR (Container Registry) + GitHub Actions (CI/CD)

---

## 🏗️ Production Architecture Overview

This project is deployed using a production-ready **3-Tier AWS Architecture** to ensure security, scalability, high availability, and zero single-points-of-failure. 

### 🖼️ System Architecture Diagram
*(Below is the conceptual architecture diagram of the deployment)*

![AWS 3-Tier Architecture Diagram](AWS_cloud_architecture_diagram_.jpeg)

### Key Architectural Pillars

*   **Multi-AZ High Availability**: Deployed across two Availability Zones (`ap-south-1a` and `ap-south-1b`) in the Mumbai region.
*   **Isolated Subnet Security**: 
    *   **Public Web Tier**: Hosts the Internet-facing Application Load Balancer (ALB) and Nginx/React Web servers.
    *   **Private Application Tier**: Django REST API servers run in private subnets, shielded from direct internet access.
    *   **Private Database Tier**: Amazon RDS PostgreSQL instance runs in isolated database subnets, accessible only from the App Tier.
*   **Outbound Internet Gateway Protection**: Private App EC2 instances communicate with the outer internet (e.g., ECR login, SMTP mailers) through a **NAT Gateway** in the public subnet.
*   **Auto Scaling Groups (ASG)**: Both the Web (Nginx) and App (Django) tiers are managed by independent Auto Scaling Groups, configured to scale between 1 and 2 instances based on demand.
*   **Dual Load Balancing**: 
    *   **External ALB**: Terminates public SSL/TLS (HTTPS) traffic on port 443 via an AWS Certificate Manager (ACM) SSL certificate and forwards it to the Web Tier.
    *   **Internal ALB**: Acts as a private proxy, forwarding API requests securely from Nginx to Gunicorn/Django on port 8000.

---

## 🛠️ Infrastructure Configuration (VPC Spec)

| Component | Resource Name | Details |
|-----------|---------------|---------|
| **Region** | `ap-south-1` | Asia Pacific (Mumbai) |
| **VPC** | `foodbridge-vpc-vpc` | CIDR: `192.168.0.0/16` |
| **Public Subnets** | `foodbridge-public-a`, `foodbridge-public-b` | `192.168.0.0/24`, `192.168.16.0/24` (Hosts Web ALB & Frontend) |
| **Private App Subnets** | `foodbridge-app-a`, `foodbridge-app-b` | `192.168.128.0/24`, `192.168.176.0/24` (Hosts Django API Backend) |
| **Private DB Subnets** | `foodbridge-db-a`, `foodbridge-db-b` | `192.168.160.0/24`, `192.168.144.0/24` (Hosts RDS PostgreSQL) |
| **NAT Gateway** | `foodbridge-vpc-nat...` | Associated with Elastic IP, deployed in `ap-south-1a` |
| **RDS Instance** | `foodbridge-db` | Engine: `PostgreSQL 16`, Instance: `db.t4g.micro` |

---

## 🚀 CI/CD GitOps Pipeline & Automation

The application uses an automated **GitHub Actions** deployment pipeline that executes on every push to the `main` branch:

1.  **Build & Containerize**: Compiles Docker images for both frontend (`frontend/Dockerfile`) and backend (`backend/Dockerfile`).
2.  **ECR Registry Push**: Authenticates with AWS and pushes compiled images to private **Amazon Elastic Container Registry (ECR)** repositories tagged with the specific git commit SHA and `latest`.
3.  **SSM Auto-Deploy**: Triggers deployment commands securely using the **AWS Systems Manager (SSM) Agent** on the target EC2 instances. It pulls the latest ECR images, stops old containers, loads environment configurations from the SSM Parameter Store, and launches the updated containers dynamically without exposing SSH keys to GitHub.

---

## 📸 AWS Infrastructure Evidence (Proofs)

Below are the snapshots from the AWS Console proving the complete setup and successful deployment of the platform.

### 🌐 VPC & Networking
| Resource | Screenshot | Description |
|---|---|---|
| **VPC Dashboard** | ![VPC Dashboard](SS/01_vpc_dashboard.png) | VPC resources allocated in the ap-south-1 region. |
| **VPC Resource Map** | ![VPC Resource Map](SS/02_vpc_resource_map.png) | Map showing route tables, Internet Gateway, and NAT Gateway routing paths. |
| **Subnet Allocations** | ![Subnet Allocations](SS/03_vpc_subnets_list.png) | 6 subnets mapped across ap-south-1a and ap-south-1b. |
| **NAT Gateway** | ![NAT Gateway](SS/04_nat_gateway.png) | Public NAT Gateway configured with Elastic IP for private subnets outbound traffic. |
| **Elastic IP List** | ![Elastic IP](SS/05_elastic_ip_addresses.png) | Static IPs allocated for NAT Gateway and Load Balancer endpoints. |

### 🔒 Security & Database
| Resource | Screenshot | Description |
|---|---|---|
| **Security Groups** | ![Security Groups](SS/06_security_groups_list.png) | Least-privilege ingress configurations (Web-SG, App-SG, AppALB-SG, WebALB-SG, Database-SG). |
| **Inbound Rules Spec** | ![Security Group Rules](SS/07_vpc_security_groups_inbound_rules.png) | Detailed list showing port 8000 and database port 5432 security bounds. |
| **Amazon RDS Summary** | ![RDS PostgreSQL](SS/08_rds_database_summary.png) | Active PostgreSQL database running in the private db subnet. |

### ⚙️ Compute, Scaling & Load Balancing
| Resource | Screenshot | Description |
|---|---|---|
| **Initial EC2 Instances** | ![Initial Instances](SS/09_ec2_instances_running_initial.png) | Initial running instances of App Server and Web Server. |
| **Autoscaled Instances** | ![Autoscaled Instances](SS/10_ec2_instances_running_autoscaled.png) | Multiple instances running simultaneously under Auto Scaling Group management. |
| **Load Balancers** | ![Load Balancers](SS/11_load_balancers_list.png) | Active Internal (App) and External (Web) Application Load Balancers. |
| **Target Groups Overview** | ![Target Groups](SS/12_target_groups_list.png) | Mapped Target Groups directing traffic to port 8000 (Backend) and port 80 (Frontend). |
| **Web Target Group Health** | ![Web Target Health](SS/13_web_target_group_state.png) | Active targets serving React frontend behind the external load balancer. |
| **App Target Group Health** | ![App Target Health](SS/14_app_target_group_healthy_state.png) | Django backend servers showing `Healthy` status on port 8000. |
| **Auto Scaling Dashboard** | ![Auto Scaling](SS/15_auto_scaling_groups_dashboard.png) | ASG policies maintaining high availability of both tiers. |

### 🧬 DevOps Automation & Configuration
| Resource | Screenshot | Description |
|---|---|---|
| **SSM Parameter Store** | ![SSM Parameter Store](SS/16_ssm_parameter_store.png) | Environment variables, database URL, credentials, and settings stored securely. |
| **ACM SSL Certificate** | ![ACM Certificate](SS/17_acm_ssl_certificate_details.png) | AWS Certificate Manager issued certificate for `foodbridge.sanketdevs.online` validation. |
| **GitHub Repository** | ![GitHub Repo](SS/18_github_repository_main.png) | Master repository code, Actions workflow, and project scripts. |
| **CI/CD Workflow Runs** | ![GitHub Actions Pipeline](SS/19_github_actions_workflow_runs.png) | Successful Git-triggered builds pushing images to ECR and deploying via SSM. |

### 🌐 Live Platform Screenshots
| Screen | Screenshot | Description |
|---|---|---|
| **NGO Web Dashboard** | ![NGO Dashboard](SS/20_live_app_ngo_dashboard.png) | Authenticated dashboard showing available food claims, SSL verified (Padlock active). |
| **Admin Control Dashboard** | ![Admin Dashboard](SS/21_live_app_admin_dashboard.png) | Admin dashboard monitoring organization verifications and transaction email logs. |

---

## 🛠️ Local Development Setup Guide

For testing, debugging, or running the application locally on your machine, follow the steps below.

### Local Setup Prerequisites
*   Python 3.11.x
*   Node.js v18+ (Node 20 or 24 recommended)
*   SQLite (default local database)

### Terminal 1 — Django Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py runserver
```
*Backend runs locally at: **http://localhost:8000***

### Terminal 2 — React Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs locally at: **http://localhost:5173***

---

## 🔑 Pre-Configured Test Credentials

Use these pre-seeded accounts to explore the platform features locally or in production:

| Role | Email / Username | Password | Access Level |
|---|---|---|---|
| **Admin** | `foodbridge.admin.connect@gmail.com` | `pass@123` | Django Admin & Organization Verifications |
| **Donor** | `prajapatisanketssp321@gmail.com` | `pass@123` | Creating food donations & verifying OTPs |
| **NGO** | `sanketprajapatipdp@gmail.com` | `pass@123` | Claiming donations (NGO: *Sanket Welfare*) |

---

*FoodBridge — Reducing food waste, one meal at a time. 🌿*
