# How to Run AyurSutra MVP

Quick reference for starting the complete system.

---

## Prerequisites

- **Node.js 16+** - Download from https://nodejs.org
- **npm** - Comes with Node.js
- **Git** (optional) - For cloning repository

Verify installation:
```powershell
node --version
npm --version
```

---

## Option 1: Quick Start (3 Commands)

### Terminal 1 - Backend
```powershell
cd backend
npm install
npm run dev
```

Wait for: `Server running on port 5000`

### Terminal 2 - Load Demo Data
```powershell
curl -X POST http://localhost:5000/api/seed-data
```

Or Windows alternative:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/seed-data" -Method POST
```

### Terminal 3 - Frontend
```powershell
cd frontend
npm install
npm run dev
```

Wait for: `Local: http://localhost:3000/`

### Browser
Open: **http://localhost:3000/login**

---

## Test Login Credentials

After seed data loads:

| Portal | URL | Username | Password |
|--------|-----|----------|----------|
| **Patient Login** | /login | patient1 | patient123 |
| **Reception Login** | /login | rec1 | rec123 |
| **Doctor Portal** | /doctor/login | doctor1 | doctor123 |
| **Practitioner Portal** | /practitioner/login | prac1 | prac123 |
| **Admin Portal** | /admin/login | admin | admin123 |

---

## Option 2: Step-by-Step Setup

### 1. Navigate to Project
```powershell
cd C:\Users\YourName\Downloads\SIH\ayursutra-mvp
```

### 2. Setup Backend

```powershell
cd backend

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║  AyurSutra Backend Server                                  ║
║  Role-based Ayurvedic Hospital Management System           ║
╚════════════════════════════════════════════════════════════╝

Server running on port 5000
Environment: development
Ready for client connections...
```

Leave this terminal open and running.

### 3. Load Demo Data

Open **new terminal**:
```powershell
# Verify backend is running
curl http://localhost:5000/api/health

# Load demo data
curl -X POST http://localhost:5000/api/seed-data
```

**Response:**
```json
{
  "success": true,
  "message": "Seed data loaded successfully",
  "credentials": {
    "admin": { "username": "admin", "password": "admin123" },
    "doctor": { "username": "doctor1", "password": "doctor123" },
    ...
  }
}
```

### 4. Setup Frontend

Open **new terminal**:
```powershell
cd ayursutra-mvp
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v4.3.9  ready in 456 ms

➜  Local:   http://localhost:3000/
```

### 5. Access Application

Open browser: **http://localhost:3000/login**

You should see the login screen.

---

## Verify Everything Works

### Check Backend Health
```powershell
curl http://localhost:5000/api/health
```

**Expected**: JSON response with system status

### Check API with Token
```powershell
# Login as patient
$response = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"patient1","password":"patient123","role":"PATIENT"}'

# Extract token and test protected endpoint
curl http://localhost:5000/api/patient/dashboard `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check Frontend Loads
- Navigate to http://localhost:3000
- Should see AyurSutra login page
- Try logging in with patient1 / patient123
- Should redirect to patient dashboard

---

## Troubleshooting

### Port Already in Use (5000)
```powershell
# Find and stop process
Get-Process | Where-Object {$_.Port -eq 5000}
# Or kill directly
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Port Already in Use (3000)
```powershell
Get-Process | Where-Object {$_.Port -eq 3000}
taskkill /PID <PID> /F
```

### npm install fails
```powershell
npm install --legacy-peer-deps
```

### CORS Error in Browser Console
- Make sure backend (port 5000) is running
- Make sure frontend (port 3000) is running
- Clear browser cache: Ctrl+Shift+Delete
- Hard refresh: Ctrl+F5

### Can't Login
1. Verify seed data loaded: `curl -X POST http://localhost:5000/api/seed-data`
2. Check username/password spelling
3. Try patient1 / patient123
4. Check browser console (F12) for errors
5. Check backend terminal for error logs

---

## Running Commands in Different Terminals

You need **3 terminal windows** open:

| Terminal | Command | Purpose | Stays Open? |
|----------|---------|---------|-----------|
| **Terminal 1** | `cd backend && npm run dev` | Backend API | ✓ Yes |
| **Terminal 2** | `curl -X POST localhost:5000/api/seed-data` | Load demo data | ✗ Runs once |
| **Terminal 3** | `cd frontend && npm run dev` | Frontend UI | ✓ Yes |

PowerShell allows you to keep multiple terminals open side-by-side.

---

## Project Structure

```
ayursutra-mvp/
├── backend/          # Express API server (port 5000)
│   ├── src/
│   │   ├── server.js        # Main entry
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth & RBAC
│   │   └── utils/           # JWT, passwords
│   ├── package.json
│   └── .env.example
│
├── frontend/         # React app (port 3000)
│   ├── src/
│   │   ├── main.jsx         # Entry point
│   │   ├── App.jsx          # Router
│   │   ├── pages/           # Auth pages
│   │   ├── dashboards/      # Role dashboards
│   │   └── services/        # API client
│   ├── package.json
│   └── vite.config.js
│
└── docs/             # Documentation
    ├── README.md
    ├── API.md
    ├── ARCHITECTURE.md
    └── SETUP.md
```

---

## Key Commands Reference

### Backend Commands
```powershell
# Start development
npm run dev

# Start production
NODE_ENV=production npm start

# Run tests
npm test
```

### Frontend Commands
```powershell
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

---

## Access Dashboards

Once logged in, each role sees different dashboard:

### Patient Dashboard
- **Login**: patient1 / patient123
- **URL**: http://localhost:3000/patient/dashboard
- **Features**: View therapies, progress, wellness tips

### Reception Dashboard
- **Login**: rec1 / rec123 (at /login)
- **URL**: http://localhost:3000/reception/dashboard
- **Features**: Patient registration, check-in, waiting list

### Doctor Dashboard
- **URL**: http://localhost:3000/doctor/login
- **Login**: doctor1 / doctor123
- **Features**: Assign therapies, view patients, request leave

### Practitioner Dashboard
- **URL**: http://localhost:3000/practitioner/login
- **Login**: prac1 / prac123
- **Features**: Record sessions, view progress, request leave

### Admin Dashboard
- **URL**: http://localhost:3000/admin/login
- **Login**: admin / admin123
- **Features**: Create users, view logs, approve leaves, analytics

---

## Testing with Postman

1. Download **postman-collection.json** from the `tests/` folder
2. Open Postman
3. Click **Import** button
4. Select the JSON file
5. Click "41 Endpoints" collection
6. Test any endpoint with correct token

All 41 API endpoints pre-configured!

---

## Development Workflow

While developing:

**Terminal 1 (Keep Open)**:
```powershell
cd backend
npm run dev
```

**Terminal 2 (Keep Open)**:
```powershell
cd frontend
npm run dev
```

**Terminal 3 (For Commands)**:
```powershell
# Test API
curl http://localhost:5000/api/health

# Reload demo
curl -X POST http://localhost:5000/api/seed-data
```

**Code Changes**:
- Backend: Auto-reloads with nodemon
- Frontend: Auto-reloads with Vite HMR

---

## Production Deployment

### Build Frontend
```powershell
cd frontend
npm run build
```

Creates `dist/` folder → Deploy to Netlify/Vercel/AWS S3

### Deploy Backend
```powershell
cd backend
NODE_ENV=production npm start
```

Deploy to: Heroku / AWS EC2 / Google App Engine / Azure

### Docker (Optional)
```powershell
# Build
docker build -t ayursutra-api .

# Run
docker run -p 5000:5000 ayursutra-api
```

---

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Port 5000 already in use" | Kill process: `taskkill /PID <id> /F` |
| "npm install fails" | Try: `npm install --legacy-peer-deps` |
| "CORS error in browser" | Verify both backend & frontend running |
| "Can't login" | Verify seed data loaded, check credentials |
| "Frontend won't load" | Check port 3000 is open, restart Vite |
| "API returns 401" | Token expired, login again |

---

## Next Steps

1. ✅ Start backend (`npm run dev`)
2. ✅ Load seed data (`curl -X POST localhost:5000/api/seed-data`)
3. ✅ Start frontend (`npm run dev`)
4. ✅ Open http://localhost:3000/login
5. ✅ Login and explore dashboards
6. 📖 Read [docs/WORKFLOW.md](docs/WORKFLOW.md) for user journeys
7. 🧪 Import Postman collection to test APIs
8. 🚀 Customize and deploy!

---

**System Ready in ~5 minutes!**

Questions? Check [GETTING_STARTED.md](GETTING_STARTED.md) or [docs/SETUP.md](docs/SETUP.md).
