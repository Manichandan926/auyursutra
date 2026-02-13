# AyurSutra Installation & Setup Guide

## Prerequisites

- **Node.js** 16+ (Download from [nodejs.org](https://nodejs.org))
- **npm** or **yarn** (comes with Node.js)
- **Git** (for version control)
- **Modern Browser** (Chrome, Firefox, Safari, Edge)
- **Text Editor/IDE** (VS Code recommended)

Verify installation:
```bash
node --version
npm --version
```

---

## Step 1: Clone/Download Project

```bash
# Navigate to your projects directory
cd ~/projects

# Clone or extract AyurSutra MVP
git clone <repository-url>
cd ayursutra-mvp
```

Or if you have a ZIP:
```bash
unzip ayursutra-mvp.zip
cd ayursutra-mvp
```

---

## Step 2: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

This installs:
- Express.js (web framework)
- JWT (authentication)
- bcryptjs (password hashing)
- node-cron (scheduling)
- Helmet (security headers)
- CORS (cross-origin support)

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=24h
BCRYPT_ROUNDS=10
LOG_RETENTION_DAYS=90
```

### Start Backend Server

```bash
npm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║  AyurSutra Backend Server                                  ║
║  Role-based Ayurvedic Hospital Management System           ║
╚════════════════════════════════════════════════════════════╝
  
Server running on port 5000
Environment: development
...
```

✅ **Backend is running on `http://localhost:5000`**

### Load Demo Data

In a new terminal:
```bash
curl -X POST http://localhost:5000/api/seed-data
```

Response:
```json
{
  "success": true,
  "message": "Seed data loaded successfully",
  "credentials": {
    "admin": { "username": "admin", "password": "admin123" },
    "doctor": { "username": "doctor1", "password": "doctor123" },
    "reception": { "username": "rec1", "password": "rec123" }
  }
}
```

---

## Step 3: Frontend Setup

### Navigate to Frontend

```bash
# In new terminal
cd frontend
```

### Install Dependencies

```bash
npm install
```

This installs:
- React 18
- Vite (build tool)
- React Router (navigation)
- Zustand (state management)
- Tailwind CSS (styling)
- Axios (HTTP client)
- i18next (multilingual support)
- Chart.js (charts)

### Start Frontend Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v4.3.9  ready in 123 ms

➜  Local:   http://localhost:3000/
```

✅ **Frontend is running on `http://localhost:3000`**

---

## Step 4: Access the Application

### Main Login (Public)
Open browser: **`http://localhost:3000/login`**

**Test Credentials:**
```
Role: Patient
Username: patient1 (or patient signup)
Password: patient123

Role: Reception
Username: rec1
Password: rec123
```

### Hidden Portals

**Admin Portal** (`http://localhost:3000/admin/login`)
```
Username: admin
Password: admin123
```

**Doctor Portal** (`http://localhost:3000/doctor/login`)
```
Username: doctor1
Password: doctor123
```

**Practitioner Portal** (`http://localhost:3000/practitioner/login`)
```
Username: prac1
Password: prac123
```

---

## Step 5: Verify Setup

### Check Health

```bash
curl http://localhost:5000/api/health
```

Response should show system status and data counts.

### Test Authentication

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"doctor123","role":"DOCTOR"}'
```

Copy the returned `token` for next tests.

### Test Authorized Endpoint

```bash
curl http://localhost:5000/api/doctor/patients \
  -H "Authorization: Bearer <your-token-here>"
```

---

## Troubleshooting

### Port Already in Use

**Backend (5000):**
```bash
# Find process on port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

**Frontend (3000):**
```bash
# Find process on port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

Or change ports in config:
- Backend: Edit `backend/src/config.js`
- Frontend: Edit `frontend/vite.config.js`

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### CORS Errors

Make sure frontend proxy is configured in `vite.config.js`:
```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### Can't Login

1. Verify seed data loaded: `curl http://localhost:5000/api/seed-data`
2. Check credentials match seeded data
3. Check browser console for errors (F12)
4. Check backend logs for error messages

---

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Creates optimized build in `frontend/dist/`

Deploy dist/ folder to:
- **Netlify**: Drag & drop or `netlify deploy --prod --dir=dist`
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: `aws s3 sync dist/ s3://your-bucket/`

### Production Backend

```bash
cd backend
NODE_ENV=production npm install --production
npm start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start src/server.js --name "ayursutra-api"
pm2 save
```

---

## Docker Deployment (Optional)

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t ayursutra-api .
docker run -p 5000:5000 ayursutra-api
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t ayursutra-web .
docker run -p 80:80 ayursutra-web
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## Development Workflow

### Daily Development

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Optional: API Testing
```bash
# Use Postman or curl
curl http://localhost:5000/api/health
```

### Code Changes

Frontend changes auto-reload via Vite HMR
Backend changes auto-reload via nodemon

### Debugging

**Browser DevTools**: F12 in browser
**Backend Logs**: Check terminal running `npm run dev`
**Network Tab**: Check API calls in browser DevTools → Network

---

## Next Steps

1. **Explore Dashboards**: Login as each role to understand workflows
2. **Review Code**: Check `backend/src/routes/` for API patterns
3. **Test Workflows**:
   - Admin creates doctor
   - Reception creates patient
   - Doctor assigns therapy
   - Practitioner records session
   - Patient views progress
4. **Customize**: Modify seed data, add features, integrate with real database
5. **Deploy**: Follow production build steps above

---

## Support & Resources

- **API Docs**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Workflows**: See `docs/WORKFLOW.md`
- **GitHub Issues**: Report bugs or suggest features
- **Smart India Hackathon**: Official submission guide

---

## Quick Commands Reference

```bash
# Start everything
npm run dev  # (run in both backend and frontend)

# Seed demo data
curl -X POST http://localhost:5000/api/seed-data

# Check backend health
curl http://localhost:5000/api/health

# Login & get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"doctor123","role":"DOCTOR"}'

# Build for production
npm run build  # (in frontend dir)

# Test
npm test
```

---

**Congratulations! AyurSutra is now running on your machine!** 🎉
