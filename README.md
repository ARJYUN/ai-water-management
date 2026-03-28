# 💧 WaterAI — Water-Aware AI Resource Management System

A full-stack dashboard that simulates and monitors water usage in AI data centers, using Google's real-world WUE (Water Usage Effectiveness) figures as the simulation baseline.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v4 + Recharts |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Auth | JWT (24h expiry) |

---

## 🚀 Quick Start

### 1. Database Setup

Make sure MySQL is running, then:

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` and set your MySQL password:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=water_ai_db
JWT_SECRET=water_ai_super_secret_jwt_key_2024
PORT=5000
```

Seed the database with 30 days of realistic data:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev      # with auto-reload (nodemon)
# OR
npm start        # production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**
Backend API at: **http://localhost:5000**

---

## 🔑 Demo Login Credentials

All accounts use password: `password123`

| Email | Role | Access |
|-------|------|--------|
| admin@water.ai | Admin | Everything |
| devops@water.ai | DevOps Engineer | Workloads, Metrics, Optimize, Reports |
| sustain@water.ai | Sustainability Officer | Policies, Reports, Dashboard |
| viewer@water.ai | Viewer | Dashboard only |

---

## 📊 Simulated Data Model

Based on Google's published WUE figures:

| Region | WUE (L/kWh) | Training (400kWh) | Inference (100kWh) | Scaling (200kWh) |
|--------|-------------|-------------------|--------------------|-----------------|
| us-central | 1.1 | ~440 L | ~110 L | ~220 L |
| asia-east | 1.3 | ~520 L | ~130 L | ~260 L |
| europe-west | 0.9 | ~360 L | ~90 L | ~180 L |

---

## 📁 Project Structure

```
├── database/
│   └── schema.sql              ← MySQL schema
├── backend/
│   ├── config/db.js            ← MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js             ← JWT verification
│   │   └── role.js             ← Role-based access control
│   ├── routes/
│   │   ├── auth.js             ← /api/auth
│   │   ├── workloads.js        ← /api/workloads (state machine)
│   │   ├── metrics.js          ← /api/metrics
│   │   ├── analytics.js        ← /api/analytics
│   │   ├── optimize.js         ← /api/optimize
│   │   ├── policies.js         ← /api/policies
│   │   ├── alerts.js           ← /api/alerts
│   │   ├── reports.js          ← /api/reports
│   │   └── admin.js            ← /api/admin
│   ├── seed.js                 ← Seed 150 workloads + metrics
│   ├── server.js               ← Express entry point
│   └── .env                    ← Environment variables
└── frontend/
    └── src/
        ├── api/client.js       ← Axios + JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── StatCard.jsx
        │   └── Badges.jsx
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Workloads.jsx
            ├── Metrics.jsx
            ├── Analytics.jsx
            ├── Optimize.jsx
            ├── Policies.jsx
            ├── Alerts.jsx
            ├── Reports.jsx
            └── Admin.jsx
```

---

## 🔄 Workload State Machine

```
Submitted → Queued → Executing → Completed
                              → Failed → retry (retryCount < 3 → Queued)
                                       → Aborted (retryCount >= 3)
                              → PausedForOptimization → Queued
                              → Deferred → Queued
```

When a workload transitions to `Executing`, the system automatically checks water policies.
If estimated usage exceeds the region threshold → status becomes `PausedForOptimization` + alert created.

---

## 🛡️ Role Permissions

| Page | Admin | DevOps | Sustainability | Viewer |
|------|-------|--------|----------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Workloads | ✅ | ✅ | ❌ | ❌ |
| Metrics | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ✅ | ✅ |
| Optimize | ✅ | ✅ | ❌ | ❌ |
| Policies | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ❌ | ❌ | ❌ |
