# FoodBridge — Local Development Setup Guide

> A food waste reduction platform connecting food donors with verified NGOs.
> **Stack**: Django 5 (Backend) + React 18 + Vite (Frontend) + SQLite (Dev DB)

---

## Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Version Required | Download |
|------|-----------------|----------|
| Python | 3.11.x | https://python.org/downloads |
| Node.js | 18+ (20 or 24 recommended) | https://nodejs.org |
| npm | 8+ (comes with Node) | included with Node |
| Git | Any | https://git-scm.com |

Verify your versions:
```bash
python --version   # Expected: Python 3.11.x
node --version     # Expected: v18.x or v24.x
npm --version      # Expected: 8+
```

---

## Project Structure

```
d:\FoodBridgeProject\
└── foodbridge\
    ├── backend\        ← Django REST API (port 8000)
    │   ├── config\     ← Django settings, URLs, WSGI
    │   ├── core\       ← User auth, Organization models
    │   ├── donations\  ← Donation, Claim models & API
    │   ├── manage.py
    │   ├── requirements.txt
    │   ├── .env        ← Backend environment variables
    │   └── venv\       ← Python virtual environment
    └── frontend\       ← React + Vite app (port 5173)
        ├── src\
        │   ├── pages\
        │   ├── components\
        │   └── utils\
        ├── package.json
        └── .env        ← Frontend environment variables
```

---

## Quick Start (2 Terminals Required)

> **Important**: You need **two separate terminal windows** — one for the backend and one for the frontend. Both must be running at the same time.

---

## Terminal 1 — Backend Setup

### Step 1: Navigate to the backend folder
```powershell
cd d:\FoodBridgeProject\foodbridge\backend
```

### Step 2: Create a Python virtual environment (first time only)
```powershell
python -m venv venv
```

### Step 3: Activate the virtual environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

> ✅ You'll see `(venv)` prefix in your terminal when it's active.

> ⚠️ **PowerShell Execution Policy Error?** Run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### Step 4: Install Python dependencies (first time only)
```powershell
pip install -r requirements.txt
```

### Step 5: Create the `.env` file (first time only)

Create a file named `.env` inside `d:\FoodBridgeProject\foodbridge\backend\` with this content:



> 💡 This file already exists at `d:\FoodBridgeProject\foodbridge\backend\.env` — no action needed if running on the same machine.

### Step 6: Run database migrations (first time only)
```powershell
python manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, core, django_q, donations, sessions, token_blacklist
Running migrations:
  Applying ... OK
  ...
```

### Step 7: Create the admin superuser (first time only)

```powershell
python manage.py shell -c "
from core.models import User
if not User.objects.filter(email='prajapatisanketssp321@gmail.com').exists():
    User.objects.create_superuser('prajapatisanketssp321@gmail.com', 'sanket', full_name='Sanket Prajapati')
    print('Admin created')
else:
    print('Admin already exists')
"
```

> **Admin credentials**: `admin@foodbridge.com` / `admin123`

### Step 8: Collect static files (first time only)
```powershell
python manage.py collectstatic --noinput
```

### Step 9: Start the Django development server
```powershell
python manage.py runserver
```

Expected output:
```
Django version 5.0.3, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

> ✅ Backend is now running at: **http://localhost:8000**
> 📊 Admin panel: **http://localhost:8000/admin/**
> 🩺 Health check: **http://localhost:8000/api/health/**

---

## Terminal 2 — Frontend Setup

### Step 1: Navigate to the frontend folder
```powershell
cd d:\FoodBridgeProject\foodbridge\frontend
```

### Step 2: Install Node dependencies (first time only)
```powershell
npm install
```

### Step 3: Create the `.env` file (first time only)

Create a file named `.env` inside `d:\FoodBridgeProject\foodbridge\frontend\` with this content:

```env
VITE_API_URL=http://localhost:8000/api
```

> 💡 This file already exists — no action needed if running on the same machine.

### Step 4: Start the Vite development server
```powershell
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

> ✅ Frontend is now running at: **http://localhost:5173**

---

## Verify Everything is Working

Open your browser and check each of these URLs:

| URL | Expected Result |
|-----|----------------|
| `http://localhost:8000/api/health/` | `{"status": "ok"}` |
| `http://localhost:8000/api/stats/` | JSON with donation/NGO counts |
| `http://localhost:8000/admin/` | Django Admin login page |
| `http://localhost:5173/` | FoodBridge Home page |
| `http://localhost:5173/donations` | Available food listings |

---

## Test Accounts

These accounts are pre-loaded in the local database:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@foodbridge.com` | `admin123` | Access Django Admin |
| **Donor** | `donorjoe@example.com` | `password123` | Can post donations |
| **NGO** | `ngoa@example.com` | `password123` | Verified, can claim food |

---

## Full Feature Walkthrough

### 1. Post a Donation (as Donor)
1. Login at `/login` with `donorjoe@example.com` / `password123`
2. Click **"Donate"** in the navbar
3. Fill in the 4-step form: Details → Location → Photos → Review
4. Click **"Post Donation"**
5. Donation appears on `/donations` feed

### 2. Claim a Donation (as NGO)
1. Login at `/login` with `ngoa@example.com` / `password123`
2. Browse `/donations` and click a donation
3. Click **"Claim for My NGO"**
4. You'll be redirected to `/my-claims`
5. Your **6-digit OTP code** is shown on the card (also emailed to you)

### 3. Verify Pickup OTP (as Donor)
1. Login as the donor who posted the food
2. Go to `/my-donations`
3. On a "CLAIMED" donation, enter the 6-digit OTP from the NGO
4. Click **"Verify & Complete"**
5. Status changes to **PICKED_UP** — donor gets a confirmation email

### 4. Verify an NGO (as Admin)
1. Go to `http://localhost:8000/admin/`
2. Login with `admin@foodbridge.com` / `admin123`
3. Click **Organizations** → select NGO → choose **"Verify selected NGOs"** action
4. NGO receives a verification email and can now claim food

---

## All Frontend Routes

| Route | Page | Who Can Access |
|-------|------|----------------|
| `/` | Home (landing page) | Everyone |
| `/about` | About FoodBridge | Everyone |
| `/register` | Register as Donor or NGO | Everyone |
| `/login` | Login | Everyone |
| `/verify-email` | Verify email from link | Everyone |
| `/donations` | Browse available food | Everyone |
| `/donations/:id` | Donation detail | Everyone |
| `/donate` | Post a donation | Donor only |
| `/my-donations` | Manage your donations + OTP verify | Donor only |
| `/my-claims` | View claims + OTP codes | NGO only |
| `/org/create` | Create NGO profile | NGO only |
| `/org/profile` | Edit NGO settings | NGO only |
| `/profile` | User profile | Logged-in users |
| `/activity` | Activity/notification history | Logged-in users |

---

## All API Endpoints

### Public Endpoints (no auth required)
```
GET  /api/health/                  Health check
GET  /api/stats/                   Platform statistics
POST /api/register/                Register new user
POST /api/login/                   Login (returns JWT tokens)
GET  /api/verify-email/?token=...  Verify email address
GET  /api/donations/               List available donations
GET  /api/donations/<id>/          Donation detail
```

### Authenticated Endpoints
```
POST /api/logout/                  Logout (blacklists JWT)
GET  /api/profile/                 Get your profile
PUT  /api/profile/update/          Update profile

# NGO Organization
POST /api/orgs/create/             Create NGO organization
GET  /api/orgs/my/                 Get your organization
PUT  /api/orgs/update/             Update organization

# Donations (Donor)
POST /api/donations/create/        Post a new donation
GET  /api/donations/my/            My donations list
PUT  /api/donations/<id>/update/   Update donation
POST /api/donations/<id>/cancel/   Cancel donation

# Claims (NGO)
POST /api/claims/create/           Claim a donation
GET  /api/claims/my/               My claims list

# OTP Verification (Donor)
POST /api/claims/<id>/verify-otp/  Verify pickup OTP
```

---

## Starting the Project Every Day

After the first-time setup, you only need to run these commands each time:

**Terminal 1 (Backend):**
```powershell
cd d:\FoodBridgeProject\foodbridge\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

**Terminal 2 (Frontend):**
```powershell
cd d:\FoodBridgeProject\foodbridge\frontend
npm run dev
```

Then open **http://localhost:5173** in your browser. That's it! ✅

---

## Troubleshooting

### ❌ "No module named X" after activating venv
```powershell
pip install -r requirements.txt
```

### ❌ PowerShell says "cannot be loaded because running scripts is disabled"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### ❌ Frontend shows "Network Error" or API calls fail
- Ensure the backend is running on port 8000
- Check that `frontend/.env` contains `VITE_API_URL=http://localhost:8000/api`
- Check that `backend/.env` has `CORS_ALLOWED_ORIGINS=http://localhost:5173`

### ❌ Django Admin login fails
Run the admin creation command from Step 7 above.

### ❌ "Migrations not applied" errors
```powershell
cd d:\FoodBridgeProject\foodbridge\backend
.\venv\Scripts\Activate.ps1
python manage.py migrate
```

### ❌ NGO says "Only verified NGOs can claim food"
1. Login to admin at `http://localhost:8000/admin/`
2. Go to **Organizations** → select the NGO → **"Verify selected NGOs"** action

### ❌ Port 8000 or 5173 already in use
Kill the process using the port:
```powershell
# Kill port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Kill port 5173
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F
```

---

## Tech Stack Reference

| Layer | Technology |
|-------|-----------| 
| Backend Framework | Django 5.0.3 |
| API | Django REST Framework |
| Authentication | JWT (`djangorestframework-simplejwt`) |
| CORS | `django-cors-headers` |
| Database (dev) | SQLite 3 |
| Database (prod) | PostgreSQL (via `dj-database-url`) |
| Geocoding | `geopy` Nominatim |
| Email | Gmail SMTP |
| Static Files | WhiteNoise |
| Frontend Framework | React 18 + Vite 8 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router v7 |
| Icons | Lucide React |
| State Management | `useState` + `localStorage` |

---

## 🔑 Default Credentials & Accounts (For Testing & Validation)

Below are the pre-configured database user credentials loaded via setup fixtures and seeding scripts:

### 👤 Admin User (Django Admin Panel & Admin Dashboard)
*   **Email/Username**: `foodbridge.admin.connect@gmail.com`
*   **Password**: `pass@123`

### 👤 Test Donor User (For Creating Donations)
*   **Email/Username**: `prajapatisanketssp321@gmail.com`
*   **Password**: `pass@123`

### 👤 Test NGO User (For Claiming Donations)
*   **Email/Username**: `sanketprajapatipdp@gmail.com`
*   **Password**: `pass@123`
*   **NGO Organization Name**: `Sanket Welfare` (Auto-verified)

---

*FoodBridge — Reducing food waste, one meal at a time. 🌿*

