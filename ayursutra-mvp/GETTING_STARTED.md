# AyurSutra MVP - Getting Started Guide

Quick-start guide to get the complete system running in 15 minutes.

---

## The 5-Minute Quick Start

### Windows Users (PowerShell)
```powershell
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Wait for: "Server running on port 5000"
```

### Terminal 2: Load Demo Data
```powershell
curl -X POST http://localhost:5000/api/seed-data
```

### Terminal 3: Frontend
```powershell
cd frontend
npm install
npm run dev

# Wait for: "Local: http://localhost:3000"
```

### Browser: Open Application
```
http://localhost:3000/login
```

**Test Login**:
- Role: Patient
- Username: `patient1`
- Password: `patient123`

✅ **System running!**

---

## 10-Minute Setup (Detailed)

### Prerequisites (Install if needed)
- Download Node.js from https://nodejs.org
- Open PowerShell or Command Prompt
- Verify: `node --version` and `npm --version`

### Step 1: Navigate to Project
```powershell
cd C:\Users\YourName\Downloads\SIH
cd ayursutra-mvp
```

### Step 2: Start Backend (Terminal 1)
```powershell
cd backend
npm install
```

**Wait for installation to complete** (2-3 minutes first time)

```powershell
npm run dev
```

**Expected**:
```
╔════════════════════════════════════════════════════════════╗
║  AyurSutra Backend Server                                  ║
║  Role-based Ayurvedic Hospital Management System           ║
╚════════════════════════════════════════════════════════════╝

Server running on port 5000
Environment: development
```

✅ Leave this terminal running

### Step 3: Load Demo Data (Terminal 2 - New Window)
```powershell
curl -X POST http://localhost:5000/api/seed-data
```

**Should return**:
```json
{
  "success": true,
  "message": "Seed data loaded successfully",
  "credentials": {...}
}
```

✅ Database populated

### Step 4: Start Frontend (Terminal 3 - New Window)
```powershell
cd ayursutra-mvp
cd frontend
npm install
npm run dev
```

**Expected**:
```
VITE v4.3.9  ready in 123 ms
➜  Local:   http://localhost:3000/
```

✅ Frontend running

### Step 5: Open in Browser
Click or copy: **http://localhost:3000/login**

You should see the AyurSutra login page.

---

## 15-Minute Deep Dive

### Explore as Public Patient

**Login Screen**:
- Select Role: **Patient**
- Username: **patient1**
- Password: **patient123**
- Click **Login**

**Patient Dashboard** (You should see):
- Profile card: "Patient Name" with assigned doctor
- Active Therapies section
- Dosha Wellness Tips (Personalized to your dosha)
- Therapy Calendar
- Progress trends chart
- Notifications list

### Explore as Reception Staff

**Go to**: http://localhost:3000/login
- Select Role: **Reception**
- Username: **rec1**
- Password: **rec123**

**Reception Dashboard**:
- Patient waiting list
- Search for patients
- Create new patient form
- Check-in functionality
- Emergency routing

### Explore as Doctor (Hidden Portal)

**Go to**: http://localhost:3000/doctor/login
- Username: **doctor1**
- Password: **doctor123**

**Doctor Dashboard**:
- List of assigned patients
- Therapy assignment form
- Patient session history
- Leave request feature
- Metrics overview

### Explore as Admin (Hidden Portal)

**Go to**: http://localhost:3000/admin/login
- Username: **admin**
- Password: **admin123**

**Admin Dashboard**:
- **Overview Tab**: 6 KPI metrics
- **Users Tab**: Create new doctors/practitioners
- **Leaves Tab**: Approve/reject leave requests
- **Logs Tab**: View immutable audit logs

### Key Features to Try

1. **View Audit Logs**
   - Admin Dashboard → Logs tab
   - See all system activities
   - Click "Verify Integrity" - confirms logs haven't been tampered with

2. **Create New Doctor** (as Admin)
   - Users tab → "Create New User"
   - Role: DOCTOR
   - Fill form and submit
   - Doctor now exists with generated credentials

3. **Assign Therapy** (as Doctor)
   - Select a patient
   - Click "Assign Therapy"
   - Fill in therapy details
   - Confirm assignment

4. **Switch Language**
   - Top right corner has language toggle
   - Switch between English & Hindi
   - UI translates instantly

5. **Check Offline Mode**
   - Browser DevTools (F12) → Network tab
   - Check "Offline"
   - Refresh page
   - See yellow offline banner
   - Cached data still loads

---

## All Credentials (Post-Seed)

### Hidden Portal URLs

| Portal | URL | Username | Password |
|--------|-----|----------|----------|
| **Admin** | /admin/login | admin | admin123 |
| **Doctor** | /doctor/login | doctor1 | doctor123 |
| **Practitioner** | /practitioner/login | prac1 | prac123 |

### Public Portal

| Role | URL | Username | Password |
|------|-----|----------|----------|
| **Patient** | /login | patient1 | patient123 |
| **Reception** | /login | rec1 | rec123 |

---

## Testing with Postman

### Import Collection

1. Download: **postman-collection.json** from `/tests/` folder
2. Open Postman
3. Click **Import** (top-left)
4. Select the JSON file
5. Collection loads with 41 pre-configured API endpoints

### Run Tests

**Login Endpoint**:
1. Expand "Authentication"
2. Click "Patient Login"
3. Click **Send**
4. Copy the returned `token` value

**Test Protected Endpoint**:
1. Go to "Doctor APIs" → "Get Doctor's Patients"
2. Replace `YOUR_DOCTOR_TOKEN` with your token (without "Bearer ")
3. Actually, paste full: `Bearer <token>`
4. Click **Send**
5. Should return patient list

---

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```powershell
# Find and kill process on port 5000
Get-Process | Where-Object {$_.Port -eq 5000}
Stop-Process -Id <PID> -Force
```

Or change port in `backend/src/config.js`:
```javascript
port: 3001  // Change from 5000
```

### Dependencies Not Installing

**Error**: `npm ERR! code ERESOLVE`

**Solution**:
```powershell
npm install --legacy-peer-deps
```

### CORS Error in Console

**Error**: Access to XMLHttpRequest blocked by CORS

**Solution**: 
- Verify frontend on port 3000
- Verify backend on port 5000
- Both must be running
- Clear browser cache (Ctrl+Shift+Delete)

### Can't Login

**Problem**: "Invalid credentials"

**Solution**:
1. Make sure you ran: `curl -X POST http://localhost:5000/api/seed-data`
2. Check your username/password spelling
3. Check correct role selected
4. Try patient1 / patient123

### Seed Data Command Not Working

**Error**: `curl: command not found`

**Solution** (Windows):
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/seed-data" -Method POST
```

Or install curl: `choco install curl`

---

## File Structure Quick Overview

```
ayursutra-mvp/
├── backend/              # Express API server
│   ├── src/
│   │   ├── server.js    # Main entry point
│   │   ├── routes/      # API endpoints (7 files)
│   │   ├── services/    # Business logic (7 files)
│   │   ├── models/      # Data models (6 files)
│   │   └── utils/       # JWT, passwords, logger
│   └── package.json
│
├── frontend/             # React + Vite app
│   ├── src/
│   │   ├── main.jsx     # Entry point
│   │   ├── App.jsx      # Router
│   │   ├── pages/       # Login pages
│   │   ├── dashboards/  # 5 role dashboards
│   │   ├── components/  # Reusable UI
│   │   └── services/    # API client
│   └── package.json
│
├── docs/                 # Documentation
│   ├── README.md        # Overview
│   ├── API.md           # 41 endpoint specs
│   ├── SETUP.md         # Installation
│   ├── ARCHITECTURE.md  # System design
│   └── WORKFLOW.md      # User journeys
│
└── tests/
    └── postman-collection.json  # API test collection
```

---

## Key Concepts Explained

### Roles & Permissions

| Role | Can Create Users | Can Assign Therapy | Can Record Sessions | Can View Logs |
|------|-----|-----|-----|-----|
| **Admin** | ✅ | ❌ | ❌ | ✅ |
| **Doctor** | ❌ | ✅ | ❌ | ❌ |
| **Practitioner** | ❌ | ❌ | ✅ | ❌ |
| **Patient** | ❌ | ❌ | ❌ | ❌ |
| **Reception** | ❌ | ❌ | ❌ | ❌ |

### Data Flow

```
1. Patient Registration (Reception creates)
2. Doctor Assignment (auto load-balanced)
3. Therapy Assignment (Doctor → Patient)
4. Session Recording (Practitioner tracks progress)
5. Progress Tracking (Patient monitors improvement)
6. Admin Oversight (Audit logs everything)
```

### Security

- **Passwords**: Hashed with bcryptjs (never stored plain)
- **Tokens**: JWT, 24-hour expiry, validation on every request
- **Audit Logs**: Immutable, hash-chained, tamper-proof
- **Access Control**: RBAC enforced on all endpoints

---

## Next Steps

### To Learn More

1. **Read**: `docs/README.md` - Full project overview
2. **Read**: `docs/ARCHITECTURE.md` - System design deep-dive
3. **Read**: `docs/WORKFLOW.md` - Step-by-step user journeys
4. **Read**: `docs/API.md` - Complete API reference

### To Customize

1. **Change seed data**: Edit `backend/src/data/seedData.js`
2. **Modify colors**: Edit `frontend/tailwind.config.js`
3. **Add roles**: Update `backend/src/middleware/auth.js` + routes
4. **Change database**: Replace in-memory store with PostgreSQL

### To Deploy

1. **Build frontend**: `npm run build` in frontend/
2. **Deploy to Netlify/Vercel**: `netlify deploy --dir=dist`
3. **Deploy backend**: Use Heroku, AWS, or Docker
4. **Connect to PostgreSQL**: Update `datastore.js`

---

## Support & Documentation

- **Issues?** Check `docs/SETUP.md` troubleshooting section
- **API Documentation?** See `docs/API.md`
- **Want to test?** Import Postman collection from `tests/`
- **Verification?** Follow `docs/VERIFICATION.md` checklist

---

## You're All Set! 

Your AyurSutra system is now running. 

**Next: Explore the dashboards and understand the workflow!**

Questions? See the docs or check server logs for detailed error messages.

**Happy exploring! 🎉**
