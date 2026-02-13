# AyurSutra MVP - Role-Based Ayurvedic Hospital Management System

**Smart India Hackathon Entry | Production-Ready Healthcare Digitization**

## 🏥 System Overview

AyurSutra is a comprehensive, role-based hospital information system designed specifically for Ayurvedic healthcare management. It digitizes patient registration, therapy assignment, execution, and progress tracking while maintaining immutable audit logs and RBAC security.

### Key Features

✅ **5 Secure Role Portals** (Admin, Doctor, Practitioner, Patient, Reception)
✅ **Immutable Audit Logging** (Hash-chained, tamper-evident)
✅ **Complete Leave Management** (Request → Approval → Auto-reassignment)
✅ **Smart Notifications & Scheduling** (Session reminders, therapy calendar)
✅ **Analytics Dashboard** (Patient KPIs, staff utilization, success rates)
✅ **Offline-First Support** (Service Worker, local backup/restore)
✅ **Multilingual UI** (English & Hindi with i18next)
✅ **FHIR-Ready** (JSON models designed for future FHIR/ABHA compatibility)

---

## 📁 Project Structure

```
ayursutra-mvp/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── server.js          # Main entry point
│   │   ├── config.js          # Configuration
│   │   ├── routes/            # API endpoints (auth, admin, doctor, etc.)
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models (User, Patient, Therapy, etc.)
│   │   ├── middleware/        # Auth, RBAC, error handling
│   │   ├── utils/             # JWT, password hashing, logger
│   │   └── data/              # In-memory store, seed data
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── main.jsx           # Entry point
│   │   ├── App.jsx            # Router & layout
│   │   ├── pages/             # Login pages
│   │   ├── dashboards/        # Role-based dashboards
│   │   ├── components/        # Reusable UI components
│   │   ├── services/          # API client
│   │   ├── utils/             # Store, helpers
│   │   ├── i18n/              # Internationalization
│   │   └── index.css          # Tailwind styles
│   ├── public/                # Static assets, SW
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── docs/                       # Documentation
│   ├── API.md                 # Complete API reference
│   ├── ARCHITECTURE.md        # System design
│   ├── SETUP.md               # Installation guide
│   └── WORKFLOW.md            # Business flows
│
└── tests/                      # Test suites
    └── postman-collection.json # Postman API tests
```

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Server starts on `http://localhost:5000`

**Seed Demo Data:**
```bash
POST http://localhost:5000/api/seed-data
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:3000`

---

## 🔐 Default Credentials (Post-Seeding)

### Public Access (Main Login)
- **Patient**: username: `patient1`, password: `patient123`
- **Reception**: username: `rec1`, password: `rec123`

### Hidden Portals
- **Admin** (`/admin/login`): username: `admin`, password: `admin123`
- **Doctor** (`/doctor/login`): username: `doctor1`, password: `doctor123`
- **Practitioner** (`/practitioner/login`): username: `prac1`, password: `prac123`

---

## 📡 API Architecture

### Authentication
```
POST /api/auth/login          → Returns JWT token
POST /api/auth/logout         → Logs out user
POST /api/auth/patient-signup → Public patient registration
```

### Role-Based Routes (RBAC Protected)

**Admin** (`/api/admin/*`)
- User management (create, list, toggle)
- Audit logs (read-only, immutable)
- Leave approval/rejection
- Practitioner reassignment
- Analytics dashboard

**Doctor** (`/api/doctor/*`)
- Patient list & search
- Therapy assignment
- Treatment progress tracking
- Leave requests

**Practitioner** (`/api/practitioner/*`)
- Assigned patients view
- Session progress recording
- Therapy history
- Leave requests

**Patient** (`/api/patient/*`)
- Personal dashboard
- Therapy calendar
- Progress tracking
- Notification history

**Reception** (`/api/reception/*`)
- Patient search
- Waiting list management
- New patient registration (auto-generates credentials)
- Doctor assignment (least-load balancing)
- Emergency routing

**General** (`/api/*`)
- Health check
- Notifications
- Data export/import
- PDF export
- Analytics/KPIs

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens** with 24-hour expiry
- **bcrypt Password Hashing** (10 rounds)
- **Session Timeout** middleware for auto-logout
- **RBAC Middleware** on every route

### Audit & Integrity
- **Immutable Logs**: Append-only, no DELETE implementation
- **Hash Chain**: SHA256 hashing with previous log reference
- **Tamper Detection**: `verifyIntegrity()` function checks for tampering
- **Log Filtering**: Search by user, action, date range

### Data Protection
- **HTTPS-Ready** (Helmet.js headers configured)
- **CORS** for cross-origin requests
- **Body Size Limits** to prevent payload attacks
- **Request Logging** for audit trail

---

## 📊 Data Models

### User
```json
{
  "id": "u_123",
  "username": "doc1",
  "passwordHash": "$2b$...",
  "name": "Dr. Vaidya",
  "role": "DOCTOR|ADMIN|PRACTITIONER|RECEPTION|PATIENT",
  "specialty": "Panchakarma",
  "contact": "9876543210",
  "language": "en|hi",
  "enabled": true,
  "createdAt": "2026-02-13T12:00:00Z"
}
```

### Patient
```json
{
  "id": "p_123",
  "name": "Amit Kumar",
  "age": 40,
  "gender": "Male",
  "dosha": "Pitta|Vata|Kapha|Tridosha",
  "preferredLanguage": "en|hi",
  "abha": "1234567890123456",
  "assignedDoctorId": "u_doc1",
  "assignedPractitionerId": "u_prac1",
  "therapies": ["t_001"],
  "createdAt": "2026-02-13T10:00:00Z"
}
```

### Therapy
```json
{
  "id": "t_001",
  "patientId": "p_123",
  "doctorId": "u_doc1",
  "primaryPractitionerId": "u_prac1",
  "type": "Virechana",
  "phase": "PRADHANAKARMA",
  "startDate": "2026-02-20",
  "durationDays": 7,
  "room": "R-101",
  "herbs": ["Giloy", "Castor Oil"],
  "status": "ONGOING|COMPLETED|SCHEDULED|CANCELLED",
  "progressPercent": 45,
  "createdAt": "2026-02-13T12:00:00Z"
}
```

### Session
```json
{
  "id": "s_001",
  "therapyId": "t_001",
  "patientId": "p_123",
  "date": "2026-02-21T09:00:00Z",
  "practitionerId": "u_prac1",
  "notes": "Session completed; tolerated well",
  "progressPercent": 15,
  "attended": true,
  "vitals": { "pulse": 78, "bp": "120/80" },
  "symptoms": ["pain", "fatigue"],
  "createdAt": "2026-02-21T10:30:00Z"
}
```

### Leave
```json
{
  "id": "l_001",
  "userId": "u_prac1",
  "userRole": "PRACTITIONER",
  "fromDate": "2026-03-01",
  "toDate": "2026-03-05",
  "reason": "Medical leave",
  "emergencyCoverRequired": true,
  "status": "PENDING|APPROVED|REJECTED",
  "approvedBy": "u_admin",
  "approvedAt": "2026-02-20T14:30:00Z",
  "createdAt": "2026-02-20T10:00:00Z"
}
```

### Audit Log
```json
{
  "id": "l_001",
  "userId": "u_admin",
  "userRole": "ADMIN",
  "action": "ADMIN_CREATED_DOCTOR",
  "resourceId": "u_doc1",
  "details": "Created doctor doc1",
  "timestamp": "2026-02-13T12:05:00Z",
  "hash": "sha256_hash_here"
}
```

---

## 🎯 Key Workflows

### Admin Creates Doctor
1. Admin POST `/api/admin/users` with doctor details
2. System creates user + password hashing + audit log
3. Doctor can now login via `/doctor/login`

### Reception Check-in & Doctor Assignment
1. Reception searches patient via `/api/reception/patients-search`
2. If NOT found → POST `/api/reception/create-patient`
3. System auto-assigns doctor with least patient load
4. Patient receives login credentials
5. Doctor can now view patient in his dashboard

### Doctor Assigns Therapy
1. Doctor POST `/api/doctor/assign-therapy`
2. System creates therapy record
3. Patient notified via notification
4. Practitioner sees patient in dashboard

### Practitioner Records Session
1. Practitioner POST `/api/practitioner/session`
2. System updates therapy progress (avg of all sessions)
3. Doctor can view updated progress in real-time
4. Patient sees progress in dashboard

### Leave Approval & Auto-Reassignment
1. Doctor/Practitioner POST `/api/doctor/leave-request` or `/api/practitioner/leave-request`
2. Admin reviews via `/api/admin/leaves`
3. Admin PATCH `/api/admin/leave/approve`
4. If practitioner + emergency cover required:
   - System calls `rosterService.autoAssignOnLeave()`
   - All patients reassigned to practitioner with least load
   - Audit logs created for each reassignment

---

## 📊 Dashboard Features

### Admin Dashboard
- **Overview**: Patient count, therapies, success rate, staff load
- **Users**: Create/manage users, toggle enabled status
- **Leaves**: Approve/reject leave requests
- **Logs**: View immutable audit logs with tamper verification

### Doctor Dashboard
- **Overview**: My patients, active therapies, leave status
- **Patients**: List assigned patients
- **Therapies**: Assign new therapy to patient
- **Sessions**: View therapy progress recorded by practitioners
- **Leave**: Submit & track leave requests

### Practitioner Dashboard
- **Overview**: Assigned patients, sessions today, progress stats
- **Patients**: List assigned patients
- **Sessions**: Record therapy progress
- **Leave**: Submit & track leave requests

### Patient Dashboard
- **Profile**: Personal info, assigned doctor/practitioner
- **Therapies**: Active therapy details, room numbers
- **Progress**: Symptom trends, therapy progress charts
- **Calendar**: Therapy dates, ICS export ready
- **Doshal Tips**: Personalized wellness recommendations
- **Notifications**: Session reminders, leave approvals

### Reception Dashboard
- **Overview**: Patient count, waiting list, emergency cases
- **Waiting List**: Patients queued for doctor assignment
- **Check-in**: Mark patient present, generate visit token
- **Register**: Create new patient + auto-generate credentials

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Auth**: JWT (jsonwebtoken)
- **Hashing**: bcryptjs
- **Scheduling**: node-cron
- **Data Store**: In-memory (localStorage-compatible), upgradeable to PostgreSQL
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **i18n**: i18next
- **HTTP Client**: Axios
- **Offline**: Service Worker (PWA-ready)

### DevOps & Docs
- **Testing**: Jest (backend), Vitest (frontend)
- **API Docs**: Swagger/OpenAPI
- **Collections**: Postman

---

## 🔄 Deployment Guide

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern browser (Chrome, Firefox, Safari, Edge)

### Production Build

**Backend:**
```bash
cd backend
npm install
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder to static host (Netlify, Vercel, GitHub Pages)
```

### Environment Variables

Backend `.env`:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secure-secret-key
JWT_EXPIRY=24h
BCRYPT_ROUNDS=10
LOG_RETENTION_DAYS=90
```

---

## 📈 Future Enhancements

### Phase 2 (Post-MVP)
- PostgreSQL + FHIR integration
- ABHA ID integration (National Health Stack)
- Ayush Grid integration
- Google Cloud Firebase (push notifications)
- Advanced analytics (ML-based predictions)
- Mobile app (React Native)

### Phase 3 (Enterprise)
- Spring Boot backend refactor
- Kubernetes deployment
- Multi-clinic support
- Advanced clinical decision support
- Integration with EHR systems

---

## 📖 Documentation

- [API Reference](./docs/API.md)
- [Architecture & Design](./docs/ARCHITECTURE.md)
- [Setup & Installation](./docs/SETUP.md)
- [Business Workflows](./docs/WORKFLOW.md)

---

## ✅ Compliance & Standards

✓ HIPAA-ready architecture
✓ FHIR-compatible JSON models
✓ Hash-chained immutable logs
✓ Role-based access control (RBAC)
✓ Audit trails for all operations
✓ Offline-first PWA capabilities

---

## 🤝 Contributing

This is a hackathon MVP. For production deployment:
1. Add comprehensive error handling
2. Implement database persistence
3. Add comprehensive test coverage
4. Set up CI/CD pipeline
5. Conduct security audit

---

## 📞 Contact & Support

- **GitHub**: [AyurSutra Repository]
- **Smart India Hackathon**: Official Submission
- **License**: MIT

---

## 🎯 Success Metrics

The system successfully demonstrates:
✅ Complete role-based authorization (5 portals)
✅ Immutable audit logging with tamper detection
✅ Automated leave management & patient reassignment
✅ Real-time therapy progress tracking
✅ Patient notifications & scheduling
✅ Offline-capable PWA architecture
✅ Multilingual UI support
✅ FHIR-ready data models
✅ Production-grade security

---

**Built for Smart India Hackathon | Ayurvedic Hospital Digital Transformation**
