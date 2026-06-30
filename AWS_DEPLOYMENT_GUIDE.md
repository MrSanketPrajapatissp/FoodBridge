# FoodBridge — AWS 3-Tier Production Deployment Guide

**Student:** Sanket Sanjay Pajarapati  
**Domain:** sanketdevs.online (BigRock)  
**Region:** ap-south-1 (Mumbai)  
**GitHub:** https://github.com/MrSanketPrajapatissp/FoodBridge  
**AMI:** Amazon Linux 2023 (AWS CLI v2 pre-installed)

---

## 🎯 Quick Architecture Overview

```
INTERNET USERS
     ↓
EXTERNAL ALB (Public, HTTPS:443 with ACM cert)
     ↓
WEB SERVER EC2 (Public subnet, Nginx + React, t2.micro)
     ↓ proxies /api/, /admin/, /static/, /media/
INTERNAL ALB (Private, HTTP:80)
     ↓
APP SERVER EC2 (Private subnet, Django + Gunicorn + Q-Cluster, t2.micro)
     ↓
RDS POSTGRESQL (Private subnet, db.t3.micro, port 5432)

Cloudinary (External) — handles media uploads
BigRock DNS — manages domain records (sanketdevs.online)
AWS ACM — free SSL certificate (auto-renews)
GitHub Actions — CI/CD pipeline (push → auto-deploy)
```

---

## 📋 TABLE OF CONTENTS

- [PHASE 1: Infrastructure Creation](#phase-1-infrastructure-creation)
  - Step 1: Create VPC + Subnets (Auto method)
  - Step 2: Create Internet Gateway + NAT Gateway
  - Step 3: Create 5 Security Groups
  - Step 4: Create IAM Roles + IAM User
  - Step 4.5: Collect All Credentials (Pre-Deployment Checklist)
  - Step 5: Store Secrets in Parameter Store
  - Step 6: Create RDS PostgreSQL
  - Step 7: Create ECR Repositories
  - Step 8: Push First Images to ECR
  - Step 9: Launch App Server + Internal ALB
  - Step 10: Launch Web Server + External ALB
  - Step 11: Setup ASG (Auto Scaling Groups)
  - Step 12: ACM Certificate + HTTPS
  - Step 13: BigRock DNS Configuration
  - Step 14: Cloudinary CORS Update
- [PHASE 2: CI/CD Setup](#phase-2-cicd-setup)
- [PHASE 3: Testing & Verification](#phase-3-testing--verification)
- [PHASE 4: Rollback Procedure](#phase-4-rollback-procedure)
- [PHASE 5: Cleanup / Delete Everything](#phase-5-cleanup--delete-everything)
- [PHASE 6: Screenshots for Resume/Recruiter](#phase-6-screenshots-for-resumerecruiter)

---

# PHASE 1: Infrastructure Creation

## STEP 1: Create VPC (Auto Method)

**Why:** VPC = isolated network for our entire app. Subnets = smaller network segments within VPC.

1. Login to AWS Console → Search bar → type **`VPC`** → Click **`VPC`**
2. **Region check:** Top-right → confirm **`ap-south-1 (Mumbai)`**
3. Left sidebar → click **`Your VPCs`** → click **`Create VPC`**
4. Settings:

| Field | Value |
|-------|-------|
| Resources to create | **`VPC and more`** (auto-creates subnets, route tables, IGW, NAT!) |
| Name tag | `foodbridge-vpc` |
| IPv4 CIDR block | `192.168.0.0/16` |
| IPv6 CIDR block | `No IPv6 CIDR block` |
| Tenancy | `Default` |
| Number of Availability Zones | `2` |
| Number of public subnets | `2` |
| Number of private subnets | `4` |
| Public subnets CIDR | `192.168.0.0/24`, `192.168.1.0/24` (auto) |
| Private subnets CIDR | `192.168.10.0/24`, `192.168.11.0/24`, `192.168.20.0/24`, `192.168.21.0/24` (auto) |
| NAT gateways | **`In 1 AZ`** (we'll use 1 NAT in ap-south-1a to minimize cost) |
| VPC endpoints | `None` (not needed — saves cost) |

5. Click **`Create VPC`**
6. **Rename subnets** (important for clarity):
   - Left sidebar → **`Subnets`** → click each subnet → Edit name:
     - `foodbridge-vpc-subnet-public1-ap-south-1a` → `foodbridge-public-a`
     - `foodbridge-vpc-subnet-public2-ap-south-1b` → `foodbridge-public-b`
     - `foodbridge-vpc-subnet-private1-ap-south-1a` → `foodbridge-app-a`
     - `foodbridge-vpc-subnet-private2-ap-south-1a` → `foodbridge-db-a`
     - `foodbridge-vpc-subnet-private1-ap-south-1b` → `foodbridge-app-b`
     - `foodbridge-vpc-subnet-private2-ap-south-1b` → `foodbridge-db-b`

---

## STEP 2: Verify Internet Gateway + NAT Gateway (Auto-created)

1. Left sidebar → **`Internet gateways`** → verify `foodbridge-vpc-igw` exists.
2. Left sidebar → **`NAT gateways`** → verify 1 NAT Gateway is running in `foodbridge-public-a` subnet.

---

## STEP 3: Create 5 Security Groups

**Why:** Virtual firewalls. Each tier gets its own SG with specific allowed traffic.

### 3.1 Create WebALB-SG (External ALB)
1. **`Security groups`** → **`Create security group`**:
   - **Name:** `WebALB-SG`
   - **Description:** `External ALB - accepts HTTP/HTTPS from internet`
   - **VPC:** Select `foodbridge-vpc`
2. **Inbound rules:**
   - Type: `HTTP`, Port: `80`, Source: `Custom 0.0.0.0/0`
   - Type: `HTTPS`, Port: `443`, Source: `Custom 0.0.0.0/0`

### 3.2 Create Web-SG (Web Server EC2)
1. **`Create security group`**:
   - **Name:** `Web-SG`
   - **Description:** `Web Server - accepts HTTP/HTTPS from WebALB only`
   - **VPC:** `foodbridge-vpc`
2. **Inbound rules:**
   - Type: `HTTP`, Port: `80`, Source: `Custom` → select `WebALB-SG` ID
   - Type: `HTTPS`, Port: `443`, Source: `Custom` → select `WebALB-SG` ID

### 3.3 Create AppALB-SG (Internal ALB)
1. **`Create security group`**:
   - **Name:** `AppALB-SG`
   - **Description:** `Internal ALB - accepts HTTP from Web-SG only`
   - **VPC:** `foodbridge-vpc`
2. **Inbound rules:**
   - Type: `HTTP`, Port: `80`, Source: `Custom` → select `Web-SG` ID

### 3.4 Create App-SG (App Server EC2)
1. **`Create security group`**:
   - **Name:** `App-SG`
   - **Description:** `App Server - accepts port 8000 from AppALB only`
   - **VPC:** `foodbridge-vpc`
2. **Inbound rules:**
   - Type: `Custom TCP`, Port: `8000`, Source: `Custom` → select `AppALB-SG` ID

### 3.5 Create Database-SG (RDS)
1. **`Create security group`**:
   - **Name:** `Database-SG`
   - **Description:** `RDS - accepts PostgreSQL from App-SG only`
   - **VPC:** `foodbridge-vpc`
2. **Inbound rules:**
   - Type: `PostgreSQL`, Port: `5432`, Source: `Custom` → select `App-SG` ID

---

## STEP 4: Create IAM Roles + IAM User

**Why:** Access permissions. EC2 needs to pull Docker images & access Parameter Store. GitHub needs access to deploy via SSM.

### 4.1 Create IAM Role for EC2 Instances
1. **IAM Console** → **`Roles`** → **`Create role`**:
   - Trusted entity: `AWS service` → Use case: `EC2`
2. Attach policies:
   - `AmazonEC2ContainerRegistryReadOnly`
   - `AmazonSSMManagedInstanceCore`
3. Role name: **`FoodBridgeEC2Role`** → Create.
4. **Add Parameter Store inline policy**:
   - Click `FoodBridgeEC2Role` → **`Add permissions`** → **`Create inline policy`** → **`JSON`** tab → paste:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [{
         "Effect": "Allow",
         "Action": ["ssm:GetParameter", "ssm:GetParameters"],
         "Resource": "arn:aws:ssm:ap-south-1:*:parameter/foodbridge/*"
       }, {
         "Effect": "Allow",
         "Action": ["kms:Decrypt"],
         "Resource": "*"
       }]
     }
     ```
   - Policy Name: `ParameterStoreAccess` → **`Create policy`**

### 4.2 Create IAM User for GitHub Actions
1. **IAM Console** → **`Users`** → **`Create user`**:
   - Username: `foodbridge-github-deployer`
2. Attach policies directly:
   - `AmazonEC2ContainerRegistryPowerUser`
   - `AmazonSSMFullAccess`
3. Click user name → **`Security credentials`** tab → **`Create access key`** (Select `Command Line Interface`)
4. **Save both keys securely**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

---

## STEP 4.5: Collect All Credentials (Pre-Deployment Checklist)

**Why:** Gathering credentials prevents deployment errors and saves time.

### 🎯 FoodBridge Credentials Reference Checklist

*This has been pre-configured with the exact credentials from your local/production settings:*

```
==========================================
FOODBRIDGE AWS DEPLOYMENT — CREDENTIALS
Student: Sanket Sanjay Prajapati
==========================================

--- CLOUDINARY (Media Storage) ---
CLOUDINARY_CLOUD_NAME=ds9bpqy61
CLOUDINARY_API_KEY=513546431197356
CLOUDINARY_API_SECRET=syHHp7HABD4oHemhZgoTEWvzA70

--- EMAIL (Gmail SMTP) ---
EMAIL_HOST_USER=foodbridge.admin.connect@gmail.com
EMAIL_HOST_PASSWORD=gpydoufziomoemyj

--- DJANGO SECRET KEY ---
SECRET_KEY=your-random-secret-key-here-make-it-long-and-random-abc123xyz789

--- DEFAULT LOGIN CREDENTIALS (Auto-loaded on RDS) ---
Admin User:     foodbridge.admin.connect@gmail.com / pass@123
Test Donor:     prajapatisanketssp321@gmail.com / pass@123
Test NGO:       sanketprajapatipdp@gmail.com / pass@123

--- DATABASE (RDS Connection String) ---
DATABASE_URL=postgres://foodbridge_admin:YOUR_DB_PASSWORD@foodbridge-db.XXXXX.ap-south-1.rds.amazonaws.com:5432/foodbridge
(Update after Step 6)
```

---

## STEP 5: Store Secrets in Parameter Store

1. Go to **AWS Systems Manager** → **`Parameter Store`** → **`Create parameter`**
2. Store these 12 parameters (all of type **`SecureString`**):

| Parameter Name | Value |
|---|---|
| `/foodbridge/SECRET_KEY` | `your-random-secret-key-here-make-it-long-and-random-abc123xyz789` |
| `/foodbridge/DATABASE_URL` | *(Postgres connection string - update after Step 6)* |
| `/foodbridge/ALLOWED_HOSTS` | `.elb.amazonaws.com,sanketdevs.online,www.sanketdevs.online` |
| `/foodbridge/CORS_ALLOWED_ORIGINS` | `https://sanketdevs.online,https://www.sanketdevs.online` |
| `/foodbridge/CLOUDINARY_CLOUD_NAME` | `ds9bpqy61` |
| `/foodbridge/CLOUDINARY_API_KEY` | `513546431197356` |
| `/foodbridge/CLOUDINARY_API_SECRET` | `syHHp7HABD4oHemhZgoTEWvzA70` |
| `/foodbridge/EMAIL_HOST_USER` | `foodbridge.admin.connect@gmail.com` |
| `/foodbridge/EMAIL_HOST_PASSWORD` | `gpydoufziomoemyj` |
| `/foodbridge/FRONTEND_URL` | `https://www.sanketdevs.online` |
| `/foodbridge/EMAIL_BACKEND_TYPE` | `gmail` |
| `/foodbridge/DEBUG` | `False` |

---

## STEP 6: Create RDS PostgreSQL

1. **RDS Console** → **`Create database`**:
   - Engine: `PostgreSQL`
   - Template: `Free tier` (db.t3.micro, 20GB gp2 storage)
   - DB instance identifier: `foodbridge-db`
   - Master username: `foodbridge_admin`
   - Master password: Enter a secure password (e.g. `SanketPassRDS123`)
   - VPC: `foodbridge-vpc`
   - Subnet Group: Create new (include `foodbridge-db-a` and `foodbridge-db-b` subnets)
   - Public access: `No`
   - VPC security group: Select existing → `Database-SG`
   - Initial database name: `foodbridge`
2. Once created, copy the **Endpoint** and **Port (5432)**.
3. Update `/foodbridge/DATABASE_URL` in Parameter Store:
   - Value format: `postgres://foodbridge_admin:SanketPassRDS123@foodbridge-db.xxxxxx.ap-south-1.rds.amazonaws.com:5432/foodbridge`

---

## STEP 7: Create ECR Repositories

1. **ECR Console** → **`Create repository`**:
   - Visibility: `Private`
   - Name: `foodbridge-backend`
2. Repeat for: `foodbridge-frontend`

---

## STEP 8: Push First Images to ECR

1. Open `scripts/app-server-userdata.sh` & `scripts/web-server-userdata.sh` and replace `<AWS_ACCOUNT_ID>` with your 12-digit account ID (default: `123456789012`).
2. Commit and push modifications to GitHub.
3. Go to GitHub repo → **`Actions`** → trigger the `Deploy FoodBridge to AWS` workflow manually. This compiles, tags, and pushes the Docker images to ECR.

---

## STEP 9: Launch App Server + Internal ALB

### 9.1 Create Internal ALB
1. **EC2 Console** → **`Load Balancers`** → **`Create Load Balancer`** (Application Load Balancer):
   - Name: `foodbridge-internal-alb`
   - Scheme: `Internal`
   - VPC: `foodbridge-vpc`
   - Mappings: `foodbridge-app-a` and `foodbridge-app-b`
   - Security Group: `AppALB-SG`
   - Listener: HTTP port 80

### 9.2 Launch App Server EC2
1. **`Launch instances`**:
   - Name: `foodbridge-app-server`
   - AMI: `Amazon Linux 2023`
   - Instance type: `t2.micro`
   - Network: `foodbridge-vpc`, subnet `foodbridge-app-a`, Public IP: `Disable`
   - Security Group: `App-SG`
   - IAM instance profile: `FoodBridgeEC2Role`
   - User Data: Paste contents of `scripts/app-server-userdata.sh`
2. Connect to the server via **Session Manager** and verify:
   - Run `docker ps` to see if `foodbridge-backend` container is up.
   - Run `curl http://localhost:8000/api/health/` -> should return `{"status": "ok"...}`.
   - *Security validation: Docker container startup script automatically runs migrations and seeds the Admin (`foodbridge.admin.connect@gmail.com`), Donor, and NGO login credentials dynamically!*

### 9.3 Configure ALB target group
1. **`Target Groups`** → Create new target group `foodbridge-app-tg` (Instance target type, Port: 8000, Health check path: `/api/health/`).
2. Register `foodbridge-app-server` to this target group.
3. Route `foodbridge-internal-alb` requests to this target group.

---

## STEP 10: Launch Web Server + External ALB

### 10.1 Create External ALB
1. **`Load Balancers`** → **`Create Load Balancer`** (Application Load Balancer):
   - Name: `foodbridge-external-alb`
   - Scheme: `Internet-facing`
   - VPC: `foodbridge-vpc`
   - Mappings: `foodbridge-public-a` and `foodbridge-public-b`
   - Security Group: `WebALB-SG`
   - Listener: HTTP port 80

### 10.2 Launch Web Server EC2
1. **`Launch instances`**:
   - Name: `foodbridge-web-server`
   - AMI: `Amazon Linux 2023`
   - Instance type: `t2.micro`
   - Network: `foodbridge-vpc`, subnet `foodbridge-public-a`, Public IP: `Enable`
   - Security Group: `Web-SG`
   - IAM instance profile: `FoodBridgeEC2Role`
   - User Data: Paste contents of `scripts/web-server-userdata.sh` (replace `<INTERNAL_ALB_DNS>`)

### 10.3 Configure Target Group
1. Create target group `foodbridge-web-tg` (Port 80, Health check: `/`).
2. Register `foodbridge-web-server` target.
3. Configure `foodbridge-external-alb` HTTP:80 listener to forward traffic to `foodbridge-web-tg`.

---

## STEP 11: Setup ASG (Auto Scaling Groups)

1. Create launch template `foodbridge-app-lt` and `foodbridge-web-lt` based on the configuration of step 9 & 10.
2. Create ASG `foodbridge-app-asg` (subnets: both App, attached to `foodbridge-app-tg`). Group size: Min: 1, Desired: 1, Max: 2.
3. Create ASG `foodbridge-web-asg` (subnets: both Public, attached to `foodbridge-web-tg`). Group size: Min: 1, Desired: 1, Max: 2.

---

## STEP 12: ACM Certificate + HTTPS

1. **AWS Certificate Manager** → **`Request certificate`**:
   - Domain names: `sanketdevs.online` and `www.sanketdevs.online`
   - Validation method: `DNS validation`
2. Once pending, retrieve CNAME names and values.

---

## STEP 13: BigRock DNS Configuration

1. Log in to BigRock control panel → Manage DNS Records for `sanketdevs.online`.
2. Add records:
   - **ACM Validation CNAME**: Paste host and target values retrieved in Step 12.
   - **CNAME for www**: Host `www` -> Value: `foodbridge-external-alb-xxxx.ap-south-1.elb.amazonaws.com` (External ALB DNS).
   - **URL Forward for root domain**: Host `@` -> Value: `https://www.sanketdevs.online` (301 redirect).
3. Once validated (ACM status = Issued), add an HTTPS port 443 listener to `foodbridge-external-alb` forwarding to `foodbridge-web-tg` with the ACM certificate attached.
4. Modify HTTP port 80 listener on External ALB to redirect traffic to HTTPS port 443.

---

## STEP 14: Cloudinary CORS Update

1. Login to Cloudinary Console → Settings → Security.
2. Add `https://www.sanketdevs.online` to allowed origins list.

---

# PHASE 2: CI/CD Setup

## STEP 15: Add GitHub Secrets

In GitHub repository → Settings → Secrets and variables → Actions, add:
*   `AWS_REGION` = `ap-south-1`
*   `AWS_ACCESS_KEY_ID`
*   `AWS_SECRET_ACCESS_KEY`
*   `AWS_ACCOUNT_ID` = `123456789012`
*   `APP_SERVER_INSTANCE_ID`
*   `WEB_SERVER_INSTANCE_ID`

Deployments will now trigger automatically on every git push to `main` branch!

---

# PHASE 3: Testing & Verification

1.  **Frontend**: Open `https://www.sanketdevs.online` -> should render UI cleanly.
2.  **API Check**: Open `https://www.sanketdevs.online/api/health/` -> should return JSON `{"status": "ok"...}`.
3.  **Django Admin**: Open `https://www.sanketdevs.online/admin/` and log in using `foodbridge.admin.connect@gmail.com` / `pass@123`.

---

# PHASE 4: Rollback Procedure

To rollback, run the manual `Rollback FoodBridge Deployment` workflow from GitHub Actions tab, passing the working commit SHA as the input version.

---

# PHASE 5: Cleanup / Delete Everything

To avoid ongoing charges on AWS, delete resources in this order:
1. Auto Scaling Groups
2. Load Balancers & Target Groups
3. Launch Templates & Standalone EC2 Instances
4. RDS PostgreSQL Instance
5. ECR Repositories
6. Parameter Store Parameters
7. IAM User, Role & Security Groups
8. Custom VPC (deletes subnets, IGW, NAT tables automatically)
9. ACM Certificate

---

# PHASE 6: Screenshots for Resume/Recruiter

Take these critical screenshots to document your cloud deployment portfolio:
*   `01-architecture-diagram.png`
*   `02-vpc-dashboard.png` (displays VPC and subnets)
*   `03-ec2-instances-running.png`
*   `04-healthy-target-groups.png`
*   `05-rds-database-status.png`
*   `06-github-actions-success.png`
*   `07-live-app-ssl.png` (demonstrates padlock icon in browser)
