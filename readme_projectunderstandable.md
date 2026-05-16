# 🌿 FoodBridge — Complete Project Guide

> **Food waste kam karo, hungry logon ko khana pahunchao.**
> Donors surplus food post karte hain → Verified NGOs claim karte hain → OTP se pickup confirm hota hai.

**Stack:** Django 5 + DRF (Backend) · React 19 + Vite 8 (Frontend) · SQLite (Dev) / PostgreSQL (Prod)

---

## 📌 Project Kya Hai?

FoodBridge ek **food rescue platform** hai jisme:

- **Donors** — apna extra khana post karte hain (photos, location, pickup time ke saath)
- **NGOs** — nearby available food browse karke claim karte hain
- **Admin** — NGOs ko verify/reject karta hai, platform monitor karta hai
- **OTP System** — pickup ke time 6-digit OTP verify hota hai taaki fake claims na ho
- **Email Notifications** — registration, verification, claim, pickup — har step pe email jaata hai
- **Distance Check** — NGO sirf apne service radius ke andar ka khana claim kar sakta hai (Haversine formula)
- **Auto-Expiry** — 45 min mein pickup nahi hua toh claim release, pickup window ke baad donation expire

---

## 🗂️ Project Structure

```
foodbridge/
├── backend/                      ← Django REST API (port 8000)
│   ├── config/                   ← Settings, URLs, WSGI/ASGI
│   │   ├── settings.py           ← All Django config (JWT, CORS, Email, DB)
│   │   ├── urls.py               ← Saare API routes yahan defined hain
│   │   └── wsgi.py / asgi.py
│   ├── core/                     ← User + Org + Notification + Email system
│   │   ├── models.py             ← User, Organization, Notification, EmailLog
│   │   ├── views.py              ← Auth, Profile, Org, Admin, Notification APIs
│   │   ├── serializers.py        ← DRF serializers for all core models
│   │   ├── email_utils.py        ← HTML email templates (verification, claim, etc.)
│   │   └── admin.py              ← Django admin config + "Verify NGO" action
│   ├── donations/                ← Donation + Claim system
│   │   ├── models.py             ← Donation, Claim, DonationPhoto
│   │   ├── views.py              ← CRUD for donations + listing + filtering
│   │   ├── views_claims.py       ← Claim create, my claims, OTP verify
│   │   ├── serializers.py        ← Donation & Photo serializers
│   │   ├── serializers_claims.py ← Claim serializer
│   │   ├── tasks.py              ← Background: expire_donations, release_stale_claims
│   │   ├── utils.py              ← haversine_distance() + geocode_address()
│   │   └── admin.py              ← Donation, Claim, Photo admin panels
│   ├── manage.py
│   ├── requirements.txt
│   ├── Procfile                  ← Gunicorn start command (Railway/Render)
│   ├── railway.toml              ← Railway deploy config
│   └── .env                      ← Secret keys, DB URL, email creds
│
├── frontend/                     ← React + Vite SPA (port 5173)
│   ├── src/
│   │   ├── main.jsx              ← Routes defined here (BrowserRouter)
│   │   ├── App.jsx               ← Default Vite template (not used in routing)
│   │   ├── pages/                ← 18 page components
│   │   │   ├── Home.jsx          ← Landing page with stats
│   │   │   ├── Register.jsx      ← Donor/NGO registration
│   │   │   ├── Login.jsx         ← JWT login
│   │   │   ├── Donate.jsx        ← 4-step donation form (Details→Location→Photos→Review)
│   │   │   ├── DonationList.jsx  ← Browse available food (filter by type)
│   │   │   ├── DonationDetail.jsx← Single donation page + claim button
│   │   │   ├── MyDonations.jsx   ← Donor's posted donations + OTP verify
│   │   │   ├── MyClaims.jsx      ← NGO's claimed food + OTP codes + map
│   │   │   ├── OrgCreate.jsx     ← NGO profile setup (name, address, radius)
│   │   │   ├── OrgProfile.jsx    ← NGO profile edit
│   │   │   ├── Profile.jsx       ← User profile page
│   │   │   ├── AdminLogin.jsx    ← Admin-only login page
│   │   │   ├── AdminDashboard.jsx← Admin: stats, pending NGOs, email logs
│   │   │   ├── Notifications.jsx ← In-app notification center
│   │   │   ├── Activity.jsx      ← Activity history page
│   │   │   ├── VerifyEmail.jsx   ← Email token verification
│   │   │   ├── About.jsx         ← About page
│   │   │   └── HealthCheck.jsx   ← API health check page
│   │   ├── components/
│   │   │   ├── Navbar.jsx        ← Navigation bar (role-aware menu items)
│   │   │   ├── Footer.jsx        ← Footer
│   │   │   ├── Layout.jsx        ← Navbar + Footer wrapper
│   │   │   ├── PrivateRoute.jsx  ← Route guard (token + role check)
│   │   │   ├── RouteMap.jsx      ← Leaflet map component (donation→NGO route)
│   │   │   └── ui/               ← Reusable UI components
│   │   │       ├── Button.jsx
│   │   │       ├── Toast.jsx
│   │   │       ├── OTPInput.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       ├── FoodTypeBadge.jsx
│   │   │       ├── StepProgress.jsx
│   │   │       ├── SkeletonCard.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       └── AddressAutocomplete.jsx
│   │   ├── utils/
│   │   │   ├── api.js            ← Fetch wrapper (Bearer token, auto-redirect on 401)
│   │   │   └── timeAgo.js        ← "5 min ago" helper
│   │   └── hooks/
│   │       └── useScrollAnimation.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json               ← SPA rewrite rule for Vercel
│   ├── .env                      ← VITE_API_URL=http://localhost:8000/api
│   └── .env.production           ← Production API URL (Railway)
└── .gitignore
```

---

## 🧩 Database Models (ER Summary)

```
┌─────────────┐    1:1    ┌──────────────────┐
│    User      │─────────→│  Organization    │
│ (email auth) │          │ (NGO profile)    │
│ role: DONOR/ │          │ verification     │
│   NGO/ADMIN  │          │ service_radius   │
└──────┬───────┘          │ lat/lng          │
       │                  └────────┬─────────┘
       │ 1:N                       │ 1:N
       ▼                           ▼
┌─────────────┐    1:1    ┌──────────────────┐
│  Donation   │─────────→│     Claim        │
│ title, type │          │ otp_code (6-dig) │
│ servings    │          │ status           │
│ lat/lng     │          └──────────────────┘
│ pickup time │
│ photos      │
│ status      │
└─────────────┘
       │ 1:N
       ▼
┌─────────────┐
│DonationPhoto│
└─────────────┘

Other: Notification (in-app alerts), EmailLog (email audit trail)
```

### Key Model Fields

| Model            | Important Fields                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**         | `email` (login), `role` (DONOR/NGO/ADMIN), `is_email_verified`, `phone_number`                                                                                                                 |
| **Organization** | `organization_name`, `registration_number`, `verification_status` (PENDING/VERIFIED/REJECTED), `service_radius_km`, `location_lat/lng`                                                         |
| **Donation**     | `title`, `food_type` (VEG/NON_VEG/VEGAN/MIXED), `quantity_servings`, `pickup_address`, `location_lat/lng`, `pickup_window_start/end`, `status` (AVAILABLE/CLAIMED/PICKED_UP/EXPIRED/CANCELLED) |
| **Claim**        | `donation` (OneToOne), `ngo` (FK→Organization), `otp_code` (auto-generated 6-digit), `status`                                                                                                  |
| **Notification** | `recipient`, `notification_type`, `title`, `message`, `is_read`                                                                                                                                |
| **EmailLog**     | `recipient_email`, `subject`, `status` (SENT/FAILED), `error_message`                                                                                                                          |

---

## 🔄 Core Business Flows

### Flow 1: Donor Posts Food

```
Register → Verify Email → Login → /donate (4-step form)
→ Address auto-geocoded to lat/lng → Photos uploaded → Donation saved as AVAILABLE
```

### Flow 2: NGO Claims Food

```
Register as NGO → Create Org Profile → Email verify (auto-approves NGO)
→ Browse /donations → Click "Claim"
→ Distance check (Haversine) → if within radius → Claim created with OTP
→ Contact exchange emails sent to BOTH donor & NGO
→ Donation status → CLAIMED
```

### Flow 3: Pickup Verification

```
NGO shows OTP to Donor → Donor enters OTP in /my-donations
→ If OTP matches → Claim & Donation → PICKED_UP
→ Confirmation email to donor + in-app notification
```

### Flow 4: Auto-Expiry (Background)

```
Every time /donations is loaded:
  - Stale claims (>45 min, no pickup) → released, donation back to AVAILABLE
  - Expired donations (past pickup window) → status → EXPIRED
  - Notifications sent to donor & NGO
```

### Flow 5: Admin Workflow

```
Admin login → /foodbridgeapplication/admin/dashboard
→ See platform stats (donations, claims, pickup rate)
→ Review pending NGOs → Verify or Reject
→ Emails + notifications sent to NGO
→ View email logs for debugging
```

---

## 🔑 Authentication System

- **JWT tokens** via `djangorestframework-simplejwt`
- Access token: **24 hours** · Refresh token: **7 days**
- Token stored in `localStorage` (`access_token`, `refresh_token`, `user_role`)
- Frontend `api.js` auto-attaches Bearer token to every request
- **401 → auto redirect to /login** · **403 → redirect to /profile**
- Logout blacklists the refresh token (server-side)

---

## 🌐 All API Endpoints

### Public (no auth)

| Method | Endpoint                       | Kya karta hai                                                |
| ------ | ------------------------------ | ------------------------------------------------------------ |
| `GET`  | `/api/health/`                 | Health check → `{status: "ok"}`                              |
| `GET`  | `/api/stats/`                  | Platform stats (donations, NGOs, pickups)                    |
| `POST` | `/api/register/`               | New user register (returns JWT)                              |
| `POST` | `/api/login/`                  | Login (returns JWT)                                          |
| `GET`  | `/api/verify-email/?token=...` | Email verify karo                                            |
| `GET`  | `/api/donations/`              | Available donations list (filter: `food_type`, `lat`, `lng`) |
| `GET`  | `/api/donations/<id>/`         | Single donation detail                                       |

### Authenticated (Bearer token required)

| Method | Endpoint                           | Kya karta hai                          |
| ------ | ---------------------------------- | -------------------------------------- |
| `POST` | `/api/logout/`                     | Logout (blacklist token)               |
| `GET`  | `/api/profile/`                    | Apna profile dekho                     |
| `PUT`  | `/api/profile/update/`             | Profile update karo                    |
| `POST` | `/api/orgs/create/`                | NGO org profile banao                  |
| `GET`  | `/api/orgs/my/`                    | Apni org dekho                         |
| `PUT`  | `/api/orgs/update/`                | Org update karo                        |
| `POST` | `/api/donations/create/`           | Donation post karo (multipart: photos) |
| `GET`  | `/api/donations/my/`               | Meri donations                         |
| `PUT`  | `/api/donations/<id>/update/`      | Donation edit karo                     |
| `POST` | `/api/donations/<id>/cancel/`      | Donation cancel karo                   |
| `POST` | `/api/claims/create/`              | Food claim karo (NGO only)             |
| `GET`  | `/api/claims/my/`                  | Meri claims list                       |
| `POST` | `/api/claims/<id>/verify-otp/`     | OTP verify karo (Donor only)           |
| `GET`  | `/api/notifications/`              | Notifications list                     |
| `GET`  | `/api/notifications/unread-count/` | Unread count                           |
| `PUT`  | `/api/notifications/<id>/read/`    | Mark as read                           |
| `PUT`  | `/api/notifications/read-all/`     | Sab read mark karo                     |

### Admin Only

| Method | Endpoint                       | Kya karta hai                 |
| ------ | ------------------------------ | ----------------------------- |
| `GET`  | `/api/admin/stats/`            | Admin dashboard stats         |
| `GET`  | `/api/admin/ngos/pending/`     | Pending NGOs list             |
| `POST` | `/api/admin/ngos/<id>/verify/` | NGO approve karo              |
| `POST` | `/api/admin/ngos/<id>/reject/` | NGO reject karo (with reason) |
| `GET`  | `/api/admin/email-logs/`       | Email delivery logs           |

---

## 🖥️ Frontend Routes

| Route                                    | Page                       | Access       |
| ---------------------------------------- | -------------------------- | ------------ |
| `/`                                      | Landing page (stats, hero) | Everyone     |
| `/about`                                 | About FoodBridge           | Everyone     |
| `/register`                              | Register (Donor/NGO)       | Everyone     |
| `/login`                                 | Login                      | Everyone     |
| `/verify-email`                          | Email verification         | Everyone     |
| `/health`                                | API health check           | Everyone     |
| `/donations`                             | Browse available food      | Everyone     |
| `/donations/:id`                         | Donation detail + claim    | Everyone     |
| `/donate`                                | 4-step donation form       | 🔒 Donor     |
| `/my-donations`                          | My posts + OTP verify      | 🔒 Donor     |
| `/my-claims`                             | My claims + OTP + map      | 🔒 NGO       |
| `/org/create`                            | Create NGO profile         | 🔒 NGO       |
| `/org/profile`                           | Edit NGO profile           | 🔒 NGO       |
| `/profile`                               | User profile               | 🔒 Logged-in |
| `/activity`                              | Activity history           | 🔒 Logged-in |
| `/notifications`                         | Notification center        | 🔒 Logged-in |
| `/foodbridgeapplication/admin`           | Admin login                | Everyone     |
| `/foodbridgeapplication/admin/dashboard` | Admin dashboard            | 🔒 Admin     |

---

## ⚡ Quick Start (Local Development)

### Prerequisites

| Tool    | Version |
| ------- | ------- |
| Python  | 3.11+   |
| Node.js | 18+     |
| Git     | Any     |

### Terminal 1 — Backend

```powershell
cd foodbridge/backend
python -m venv venv                    # sirf pehli baar
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt        # sirf pehli baar
python manage.py migrate               # sirf pehli baar
python manage.py collectstatic --noinput  # sirf pehli baar
python manage.py runserver             # ✅ http://localhost:8000
```

### Terminal 2 — Frontend

```powershell
cd foodbridge/frontend
npm install                            # sirf pehli baar
npm run dev                            # ✅ http://localhost:5173
```

### Daily Startup (baad mein sirf yeh)

```powershell
# Terminal 1
cd foodbridge/backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver

# Terminal 2
cd foodbridge/frontend && npm run dev
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
# Production mein DATABASE_URL bhi add karo (PostgreSQL)
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

### Frontend Production (`frontend/.env.production`)

```env
VITE_API_URL=https://your-backend-url.railway.app/api
```

---

## 🚀 Deployment

| Component    | Platform           | Config File                 |
| ------------ | ------------------ | --------------------------- |
| **Backend**  | Railway            | `railway.toml` + `Procfile` |
| **Frontend** | Vercel             | `vercel.json` (SPA rewrite) |
| **Database** | Railway PostgreSQL | `DATABASE_URL` env var      |

### Backend Deploy (Railway)

- Auto-runs migrations + starts Gunicorn
- Health check: `/api/health/`
- Static files: WhiteNoise serves them

### Frontend Deploy (Vercel)

- `npm run build` → `dist/` folder
- SPA rewrite: all routes → `index.html`
- Set `VITE_API_URL` in Vercel env vars

---

## 🛠️ Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Backend          | Django 5 + Django REST Framework                       |
| Auth             | JWT (`simplejwt`) with token blacklist                 |
| Database         | SQLite (dev) / PostgreSQL (prod) via `dj-database-url` |
| Geocoding        | `geopy` (Nominatim) — auto lat/lng from address        |
| Distance         | Haversine formula (km calculation)                     |
| Email            | Gmail SMTP (dev) / SendGrid (prod option)              |
| Static Files     | WhiteNoise                                             |
| Background Tasks | Django-Q (configured, expiry runs lazily on list load) |
| Frontend         | React 19 + Vite 8                                      |
| Styling          | Tailwind CSS 3.4                                       |
| Routing          | React Router v7                                        |
| Maps             | Leaflet + React-Leaflet (donation→NGO route map)       |
| Icons            | Lucide React                                           |
| State            | `useState` + `localStorage` (no Redux)                 |

---

## 📧 Email System

App 4 types ke HTML emails bhejta hai:

1. **Verification Email** — signup ke baad, clickable verify button
2. **NGO Approved Email** — jab NGO verify hoti hai
3. **NGO Rejected Email** — rejection reason ke saath
4. **Contact Exchange Email** — claim hone pe donor & NGO dono ko:
   - NGO ko: Donor ka phone, email + **OTP code**
   - Donor ko: NGO ka phone, email + pickup instructions

Sab emails `EmailLog` table mein logged hain (Admin dashboard pe visible).

---

## 🧪 Test Accounts

| Role  | Email                  | Password      |
| ----- | ---------------------- | ------------- |
| Admin | `admin@foodbridge.com` | `admin123`    |
| Donor | `donorjoe@example.com` | `password123` |
| NGO   | `ngoa@example.com`     | `password123` |

Admin create karne ka command:

```python
python manage.py shell -c "
from core.models import User
User.objects.create_superuser('admin@foodbridge.com', 'admin123', full_name='Admin')
"
```

---

## 🔍 Key Design Decisions

| Decision                         | Reason                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| **OneToOneField** Donation→Claim | Ek donation sirf ek NGO claim kar sakta hai                  |
| **OTP on Claim.save()**          | Auto-generate 6-digit code jab claim banti hai               |
| **Lazy cleanup on list load**    | Background worker ke bina bhi stale claims release hote hain |
| **Auto-approve NGO**             | Email verify → org auto-verified (admin ko wait nahi karna)  |
| **Haversine in Python**          | Lightweight, no external API needed for distance             |
| **Token in localStorage**        | Simple, no cookie complexity for SPA                         |
| **geocode fallback**             | Exact address fail → city level → state level try karta hai  |

---

## 📁 Important Files (Developer Quick Reference)

| Kya dhundhna hai                | Kahan milega                               |
| ------------------------------- | ------------------------------------------ |
| API routes define karna         | `backend/config/urls.py`                   |
| Django settings (JWT, CORS, DB) | `backend/config/settings.py`               |
| User, Org models                | `backend/core/models.py`                   |
| Auth + Admin APIs               | `backend/core/views.py`                    |
| Email templates                 | `backend/core/email_utils.py`              |
| Donation + Photo models         | `backend/donations/models.py`              |
| Donation CRUD APIs              | `backend/donations/views.py`               |
| Claim + OTP APIs                | `backend/donations/views_claims.py`        |
| Distance + Geocoding            | `backend/donations/utils.py`               |
| Auto-expiry logic               | `backend/donations/tasks.py`               |
| Frontend routes                 | `frontend/src/main.jsx`                    |
| API fetch helper                | `frontend/src/utils/api.js`                |
| Route protection                | `frontend/src/components/PrivateRoute.jsx` |
| Map component                   | `frontend/src/components/RouteMap.jsx`     |
| All page components             | `frontend/src/pages/*.jsx`                 |
| Reusable UI                     | `frontend/src/components/ui/*.jsx`         |

---

## ✏️ How to Extend This Project

### Naya API endpoint add karna

1. `backend/donations/views.py` ya `core/views.py` mein function likho
2. `backend/config/urls.py` mein `path()` add karo
3. Agar naya model hai → `models.py` mein banao → `python manage.py makemigrations && migrate`

### Naya frontend page add karna

1. `frontend/src/pages/NewPage.jsx` banao
2. `frontend/src/main.jsx` mein `<Route>` add karo
3. Protected route chahiye? → `<PrivateRoute>` se wrap karo

### Naya UI component add karna

1. `frontend/src/components/ui/` mein file banao
2. Import karke use karo kisi bhi page mein

---

## ❌ Troubleshooting

| Problem                        | Solution                                                               |
| ------------------------------ | ---------------------------------------------------------------------- |
| `No module named X`            | `pip install -r requirements.txt`                                      |
| PowerShell script error        | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Frontend "Network Error"       | Backend chal raha hai? `.env` mein `VITE_API_URL` sahi hai?            |
| "Only verified NGOs can claim" | Admin panel → Organizations → "Verify selected NGOs" action            |
| Port already in use            | `netstat -ano \| findstr :8000` → `taskkill /PID <PID> /F`             |
| Migrations error               | `python manage.py makemigrations && python manage.py migrate`          |
| Email not sending              | `.env` mein `EMAIL_HOST_USER` & `EMAIL_HOST_PASSWORD` check karo       |

---

_FoodBridge — Reducing food waste, one meal at a time. 🌿_
