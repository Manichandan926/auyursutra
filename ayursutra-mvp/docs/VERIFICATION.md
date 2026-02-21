# AyurSutra Implementation Verification Checklist

Complete verification guide to ensure all features of the Ayurvedic Hospital Management System are working correctly.

---

## 1. Backend Setup Verification

### Prerequisites
- [ ] Node.js installed (16+ version)
- [ ] npm installed globally
- [ ] Git available in terminal

### Installation
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Verify configuration
node -e "console.log(require('./src/config'))"
```

**Expected**: Config loads with PORT=5000, NODE_ENV set

---

## 2. Server Startup Verification

```bash
npm run dev
```

**Expected Output in Terminal:**
```
╔════════════════════════════════════════════════════════════╗
║  AyurSutra Backend Server                                  ║
║  Role-based Ayurvedic Hospital Management System           ║
╚════════════════════════════════════════════════════════════╝

Server running on port 5000
Environment: development
Ready for client connections...
```

**Verification**: 
- [ ] Server starts without errors
- [ ] Listens on localhost:5000
- [ ] No crash or unhandled rejections

---

## 3. API Health Checknpm run dev

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-20T12:00:00Z",
  "uptime": 5.234,
  "data": {
    "users": 0,
    "patients": 0,
    "therapies": 0,
    "sessions": 0,
    "logs": 0
  },
  "logIntegrity": "VERIFIED"
}
```

**Verification**: 
- [ ] Endpoint responds with 200 OK
- [ ] Data counts are initially 0
- [ ] Log integrity verified

---

## 4. Seed Data Loading

```bash
curl -X POST http://localhost:5000/api/seed-data
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Seed data loaded successfully",
  "credentials": {
    "admin": {
      "username": "admin",
      "password": "admin123"
    },
    "doctor": {
      "username": "doctor1",
      "password": "doctor123"
    },
    "practitioner": {
      "username": "prac1",
      "password": "prac123"
    },
    "reception": {
      "username": "rec1",
      "password": "rec123"
    },
    "patient": {
      "username": "patient1",
      "password": "patient123"
    }
  }
}
```

**Verification**: 
- [ ] Seed data endpoint responds successfully
- [ ] All role credentials displayed
- [ ] No errors in database operations

### Post-Seed Verification

```bash
curl http://localhost:5000/api/health
```

**Expected**: counts should now show:
```json
{
  "data": {
    "users": 13,
    "patients": 4,
    "therapies": 4,
    "sessions": 0,
    "logs": 50+
  }
}
```

**Verification**: 
- [ ] Users count ≥ 13 (admin, 2 doctors, 3 practitioners, 2 reception, 4 patients, others)
- [ ] Patients count = 4
- [ ] Therapies count = 4
- [ ] Logs created (audit trail started)

---

## 5. Authentication Tests

### Patient Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"patient1","password":"patient123","role":"PATIENT"}'
```

**Expected**: 200 OK with JWT token
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "u_xyz",
    "username": "patient1",
    "role": "PATIENT",
    "name": "..."
  }
}
```

**Verification**: 
- [ ] Login returns token
- [ ] Token starts with "eyJ..."
- [ ] User role is PATIENT

### Doctor Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"doctor1","password":"doctor123","role":"DOCTOR"}'
```

**Expected**: 200 OK with DOCTOR role
- [ ] Doctor token received
- [ ] Role verified as DOCTOR

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","role":"ADMIN"}'
```

**Expected**: 200 OK with ADMIN role
- [ ] Admin token received
- [ ] Role verified as ADMIN

### Invalid Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"invalid","password":"wrong","role":"PATIENT"}'
```

**Expected**: 401 Unauthorized
- [ ] Returns error message
- [ ] No token provided

---

## 6. RBAC (Role-Based Access Control) Tests

### Get Doctor's Patients (Admin shouldn't access)
```bash
DOCTOR_TOKEN="<token_from_doctor_login>"

# Should work
curl http://localhost:5000/api/doctor/patients \
  -H "Authorization: Bearer $DOCTOR_TOKEN"

# Should fail with 403
curl http://localhost:5000/api/doctor/patients \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Verification**: 
- [ ] Doctor can access /api/doctor/* endpoints
- [ ] Patient cannot access /api/doctor/* endpoints (403 Forbidden)
- [ ] Audit log created for unauthorized attempt

### Admin-Only Create User
```bash
ADMIN_TOKEN="<token_from_admin_login>"

curl -X POST http://localhost:5000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "username": "newdoc",
    "password": "pass123",
    "name": "New Doctor",
    "role": "DOCTOR"
  }'
```

**Expected**: 200 OK, user created
- [ ] Admin can create users
- [ ] Doctor cannot create users (403)

---

## 7. Immutable Audit Logging Tests

### View Audit Logs
```bash
ADMIN_TOKEN="<admin_token>"

curl http://localhost:5000/api/admin/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "l_1",
      "userId": "u_admin",
      "action": "ADMIN_CREATED_PATIENT",
      "timestamp": "2026-02-20T10:00:00Z",
      "hash": "sha256abcdef..."
    },
    ...
  ],
  "integrity": {
    "valid": true,
    "message": "All logs verified"
  }
}
```

**Verification**: 
- [ ] Logs contain actions performed
- [ ] Each log has unique ID
- [ ] Hash chain integrity verified
- [ ] Cannot be edited (read-only logs)

---

## 8. Therapy Assignment Workflow

### Doctor Assigns Therapy
```bash
DOCTOR_TOKEN="<doctor_token>"

curl -X POST http://localhost:5000/api/doctor/assign-therapy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -d '{
    "patientId": "p_1",
    "primaryPractitionerId": "u_prac1",
    "type": "Virechana",
    "phase": "PRADHANAKARMA",
    "startDate": "2026-02-21",
    "durationDays": 7,
    "room": "R-101",
    "herbs": ["Castor Oil", "Triphala"]
  }'
```

**Expected**: 200 OK, therapy created
```json
{
  "success": true,
  "therapy": {
    "id": "t_new",
    "type": "Virechana",
    "status": "SCHEDULED",
    "progressPercent": 0
  }
}
```

**Verification**: 
- [ ] Therapy created with correct details
- [ ] Status set to SCHEDULED
- [ ] Notification created for patient
- [ ] Audit log created

---

## 9. Session Recording Workflow

### Practitioner Records Session
```bash
PRAC_TOKEN="<practitioner_token>"

curl -X POST http://localhost:5000/api/practitioner/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PRAC_TOKEN" \
  -d '{
    "therapyId": "t_new",
    "date": "2026-02-21",
    "progressPercent": 25,
    "attended": true,
    "notes": "Session completed well",
    "vitals": {"pulse": 78, "bp": "120/80"},
    "symptoms": ["pain"]
  }'
```

**Expected**: 200 OK, session created
- [ ] Session recorded
- [ ] Therapy progress updated (avg of sessions)
- [ ] Notification sent to patient

### Verify Progress Updated
```bash
curl http://localhost:5000/api/doctor/therapy/t_new/sessions \
  -H "Authorization: Bearer $DOCTOR_TOKEN"
```

**Expected**: Shows session with 25% progress
- [ ] Session appears in list
- [ ] Progress calculated correctly

---

## 10. Leave Management & Auto-Reassignment

### Practitioner Requests Leave
```bash
PRAC_TOKEN="<practitioner_token>"

curl -X POST http://localhost:5000/api/practitioner/leave-request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PRAC_TOKEN" \
  -d '{
    "fromDate": "2026-03-01",
    "toDate": "2026-03-05",
    "reason": "Medical leave",
    "emergencyCoverRequired": true
  }'
```

**Expected**: 200 OK
- [ ] Leave request created with PENDING status
- [ ] Notification sent to admin

### Admin Approves Leave (Auto-Reassignment)
```bash
ADMIN_TOKEN="<admin_token>"

curl -X POST http://localhost:5000/api/admin/leave/approve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"leaveId": "l_new"}'
```

**Expected**: 200 OK
- [ ] Leave marked as APPROVED
- [ ] Patients auto-reassigned to other practitioners
- [ ] Each reassignment logged
- [ ] Least-loaded practitioner selected

### Verify Reassignment
```bash
curl http://localhost:5000/api/admin/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | grep -i "REASSIGNED"
```

**Expected**: 
- [ ] Multiple PRACTITIONER_REASSIGNED entries
- [ ] One for each affected patient

---

## 11. Patient Notifications

### View Patient Notifications
```bash
PATIENT_TOKEN="<patient_token>"

curl http://localhost:5000/api/patient/notifications \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

**Expected**:
```json
{
  "success": true,
  "notifications": [
    {
      "id": "n_123",
      "type": "THERAPY_ASSIGNED",
      "title": "New Therapy",
      "message": "Dr. Vaidya assigned Virechana",
      "read": false,
      "createdAt": "..."
    }
  ]
}
```

**Verification**: 
- [ ] Patient receives therapy assignment notification
- [ ] Session recording triggers notifications
- [ ] Leave approvals trigger notifications

---

## 12. Frontend Setup Verification

```bash
cd frontend
npm install
npm run dev
```

**Expected Output**:
```
VITE v4.3.9  ready in 456 ms

➜  Local:   http://localhost:3000/
```

**Verification**: 
- [ ] Frontend starts on port 3000
- [ ] No build errors
- [ ] Vite HMR enabled

---

## 13. Frontend Route Access Tests

### Public Routes (No Auth Required)
- [ ] `/login` loads (Patient/Reception login)
- [ ] `/patient-signup` loads (Patient registration)
- [ ] `/admin/login` loads (Admin portal)
- [ ] `/doctor/login` loads (Doctor portal)
- [ ] `/practitioner/login` loads (Practitioner portal)

**Test**: 
```javascript
// In browser console, navigate:
window.location.href = 'http://localhost:3000/login'
```

### Protected Routes (Auth Required)
- [ ] `/admin/dashboard` redirects to login if not authenticated
- [ ] `/doctor/dashboard` redirects if role != DOCTOR
- [ ] `/patient/dashboard` redirects if role != PATIENT
- [ ] `/reception/dashboard` redirects if role != RECEPTION

**Test with Valid Token**:
1. Login as patient at `/login`
2. Verify redirected to `/patient/dashboard`
3. Dashboard loads with role-specific content

---

## 14. Dashboard Functionality Tests

### Admin Dashboard
- [ ] Overview tab shows KPI cards
- [ ] Users tab can create new user
- [ ] Leaves tab shows pending leave requests
- [ ] Logs tab displays audit logs with integrity verification

### Doctor Dashboard
- [ ] Shows assigned patients
- [ ] Can assign therapy to patient
- [ ] Shows therapy sessions
- [ ] Can request leave

### Practitioner Dashboard
- [ ] Shows assigned patients
- [ ] Can record session progress
- [ ] Shows today's sessions count
- [ ] Can request leave

### Patient Dashboard
- [ ] Shows profile card
- [ ] Displays active therapy progress
- [ ] Shows Dosha-based wellness tips
- [ ] Displays therapy calendar
- [ ] Shows session progress trends
- [ ] Lists notifications

### Reception Dashboard
- [ ] Waiting patients list
- [ ] Patient search function
- [ ] Create patient form
- [ ] Check-in functionality
- [ ] Doctor load display

---

## 15. Internationalization (i18n) Tests

### Language Switching
1. Open `/login` page
2. Look for language toggle (top right)
3. Select "Hindi" (हिंदी)
4. Verify UI strings translate:
   - [ ] "Login" → "लॉगिन"
   - [ ] "Username" → "उपयोगकर्ता नाम"
   - [ ] "Patient" → "रोगी"

5. Switch back to English
   - [ ] All strings revert to English

---

## 16. Offline Support (Service Worker) Tests

### Enable Offline Mode
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page

**Expected**:
- [ ] Yellow offline banner appears
- [ ] Cached dashboard loads
- [ ] API calls show as offline

### Reconnect
1. Uncheck "Offline" checkbox
2. Refresh page

**Expected**:
- [ ] Banner disappears
- [ ] Data syncs to server
- [ ] App functions normally

---

## 17. Data Export/Import Tests

### Export Clinic Data
```bash
ADMIN_TOKEN="<admin_token>"

curl http://localhost:5000/api/export-data \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.' > backup.json
```

**Expected**: 
- [ ] JSON file with all clinic data
- [ ] Contains users, patients, therapies, sessions, leaves, logs

### Import Data
```bash
curl -X POST http://localhost:5000/api/import-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d @backup.json
```

**Expected**: 
- [ ] Success message
- [ ] Data restored from backup
- [ ] Audit logs preserved

---

## 18. Performance & Load Tests

### Response Time Check
```bash
time curl http://localhost:5000/api/health
```

**Expected**: < 50ms response time
- [ ] API responds quickly
- [ ] No noticeable lag

### Concurrent Requests
```bash
for i in {1..10}; do
  curl http://localhost:5000/api/health &
done
wait
```

**Expected**: 
- [ ] All requests succeed
- [ ] No 500 errors
- [ ] Server remains stable

---

## 19. Security Verification

### Password Hashing
- [ ] Passwords never appear in logs
- [ ] Passwords never returned in API responses
- [ ] bcryptjs properly configured (10 rounds)

### Token Expiry
```bash
# Wait 24 hours or modify JWT_EXPIRY to test
# Try to use expired token
curl http://localhost:5000/api/doctor/patients \
  -H "Authorization: Bearer $EXPIRED_TOKEN"
```

**Expected**: 401 Unauthorized
- [ ] Expired tokens rejected
- [ ] User redirected to login

### CORS Headers
```bash
curl -i http://localhost:5000/api/health
```

**Expected**: Response includes:
```
Access-Control-Allow-Origin: http://localhost:3000
```

- [ ] CORS properly configured
- [ ] Frontend can access backend

---

## 20. Error Handling Tests

### Invalid Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test"}'  # missing password
```

**Expected**: 400 Bad Request
- [ ] Validation error returned
- [ ] Clear error message
- [ ] No server crash

### Not Found
```bash
curl http://localhost:5000/api/doctor/patients/invalid_id \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: 404 Not Found
- [ ] Returns error response
- [ ] No crash

### Unauthorized
```bash
curl http://localhost:5000/api/admin/users
```

**Expected**: 401 Unauthorized (no token)
- [ ] Protected route requires authentication
- [ ] Clear error message

---

## 21. Complete User Journey Test

**Scenario**: New patient arrives, gets assigned therapy, records session

### Step 1: Reception Creates Patient
1. Login to `/reception/login` with rec1/rec123
2. Click "Create Patient"
3. Fill form and submit
4. **Verify**: Patient created, doctor assigned, credentials displayed

### Step 2: Patient Logs In
1. Use generated credentials
2. Navigate to `/patient/dashboard`
3. **Verify**: Dashboard loads, shows assigned doctor

### Step 3: Doctor Assigns Therapy
1. Login to `/doctor/login` with doctor1/doctor123
2. View patient in dashboard
3. Click "Assign Therapy"
4. Fill form and submit
5. **Verify**: Therapy assigned, notification sent

### Step 4: Patient Views Therapy
1. Return to patient dashboard
2. **Verify**: New therapy card visible, notifications show

### Step 5: Practitioner Records Session
1. Login to `/practitioner/login` with prac1/prac123
2. Click "Record Session"
3. Fill session details and submit
4. **Verify**: Session recorded, therapy progress increases

### Step 6: Patient Sees Progress
1. Return to patient dashboard
2. **Verify**: Progress bar updated

**Overall Verification**:
- [ ] Complete workflow functions end-to-end
- [ ] All roles can perform their tasks
- [ ] Data consistency across dashboards
- [ ] Notifications trigger correctly

---

## 22. Edge Cases & Stress Tests

### Multiple Practitioners on Leave
- [ ] Assign leave to multiple practitioners
- [ ] Approve all
- [ ] Verify auto-reassignment logic selects best fit
- [ ] No conflicts or duplicate assignments

### Large Patient Lists
- [ ] Create 100+ patients
- [ ] Doctor dashboard still loads quickly
- [ ] Search functionality works
- [ ] Pagination enabled (if implemented)

### Concurrent Session Recording
- [ ] Two practitioners record sessions simultaneously
- [ ] Both succeed
- [ ] Progress calculated correctly

---

## 23. Documentation Completeness Check

- [ ] README.md has setup instructions
- [ ] API.md documents all 41 endpoints
- [ ] ARCHITECTURE.md explains system design
- [ ] SETUP.md has step-by-step installation
- [ ] WORKFLOW.md describes user journeys
- [ ] Postman collection importable

---

## Final Certification

Once ALL checks pass, the system is **PRODUCTION-READY**:

```
✅ Backend fully functional
✅ Frontend fully functional
✅ All 41 API endpoints working
✅ RBAC enforced on every route
✅ Audit logging with integrity
✅ Leave management & auto-reassignment
✅ Patient notifications
✅ Multi-language support
✅ Offline capability
✅ Security measures in place
✅ Complete documentation
✅ Postman collection provided
✅ End-to-end workflows verified
```

**Status**: ✅ **VERIFIED - READY FOR SMART INDIA HACKATHON SUBMISSION**

---

**Testing Timestamp**: ____________
**Tested By**: ____________
**Notes**: ____________
