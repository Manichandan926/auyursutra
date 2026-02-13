# AyurSutra API Reference

Complete API documentation for AyurSutra backend (v1.0).

## Base URL
```
http://localhost:5000/api
```

## Error Response Format
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## Authentication APIs

### POST /auth/login
Public endpoint - authenticate user and get JWT token.

**Request:**
```json
{
  "username": "doc1",
  "password": "password123",
  "role": "DOCTOR"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "u_123",
    "username": "doc1",
    "name": "Dr. Vaidya",
    "role": "DOCTOR",
    "createdAt": "2026-02-13T12:00:00Z"
  },
  "expiresIn": "24h"
}
```

---

### POST /auth/logout
Logs out user and creates logout audit log.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out"
}
```

---

### POST /auth/patient-signup
Public endpoint - register new patient and create account.

**Request:**
```json
{
  "name": "Amit Kumar",
  "username": "amit_pat",
  "password": "secure_pass",
  "age": 40,
  "phone": "9876543210",
  "email": "amit@example.com",
  "language": "en",
  "dosha": "Pitta",
  "address": "Mumbai"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "token": "eyJhbGc...",
  "user": {...},
  "patient": {...}
}
```

---

### POST /auth/refresh
Refresh JWT token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "expiresIn": "24h"
}
```

---

## Admin APIs (`/admin/*`)
**Required Role: ADMIN**

### POST /admin/users
Create new user (Doctor, Practitioner, Reception).

**Request:**
```json
{
  "username": "doc_new",
  "password": "password123",
  "name": "Dr. New Vaidya",
  "role": "DOCTOR",
  "specialty": "Internal Medicine",
  "contact": "9876543211",
  "email": "doctor@hospital.com",
  "language": "en"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {...}
}
```

---

### GET /admin/users
List all users with optional role filter.

**Query Parameters:**
- `role` (optional): DOCTOR, PRACTITIONER, RECEPTION, PATIENT, ADMIN

**Response (200):**
```json
{
  "success": true,
  "users": [...],
  "count": 15
}
```

---

### PATCH /admin/users/:id
Enable or disable a user.

**Request:**
```json
{
  "enabled": false
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {...}
}
```

---

### GET /admin/logs
View audit logs with filtering.

**Query Parameters:**
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "id": "l_001",
      "userId": "u_admin",
      "userRole": "ADMIN",
      "action": "ADMIN_CREATED_DOCTOR",
      "resourceId": "u_doc1",
      "details": "Created doctor doc1",
      "timestamp": "2026-02-13T12:05:00Z",
      "hash": "sha256..."
    }
  ],
  "count": 150,
  "integrity": {
    "valid": true,
    "message": "All logs verified"
  }
}
```

---

### GET /admin/dashboard/overview
Get admin dashboard metrics.

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "totalPatients": 45,
    "totalDoctors": 3,
    "totalPractitioners": 5,
    "ongoingTherapies": 12,
    "completedTherapies": 8,
    "successRate": 75,
    "avgDocLoad": 15,
    "avgPracLoad": 9,
    "pendingLeaveRequests": 2,
    "sessionToday": 6
  }
}
```

---

### GET /admin/leaves
Get pending leave requests.

**Response (200):**
```json
{
  "success": true,
  "leaves": [...],
  "count": 3
}
```

---

### POST /admin/leave/approve
Approve a leave request.

**Request:**
```json
{
  "leaveId": "l_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "leave": {...}
}
```

---

### POST /admin/leave/reject
Reject a leave request.

**Request:**
```json
{
  "leaveId": "l_123",
  "reason": "Insufficient staffing"
}
```

**Response (200):**
```json
{
  "success": true,
  "leave": {...}
}
```

---

### POST /admin/practitioner/reassign
Reassign practitioner to patient during leave.

**Request:**
```json
{
  "patientId": "p_123",
  "newPractitionerId": "u_prac2"
}
```

**Response (200):**
```json
{
  "success": true,
  "patient": {...}
}
```

---

### GET /admin/roster/on-call
Get on-call (available) staff for a date.

**Query Parameters:**
- `date` (optional): ISO date format, defaults to today

**Response (200):**
```json
{
  "success": true,
  "roster": {
    "date": "2026-02-20",
    "availableDoctors": [{
      "id": "u_doc1",
      "name": "Dr. Vaidya",
      "specialty": "Panchakarma",
      "patientLoad": 12
    }],
    "availablePractitioners": [...]
  }
}
```

---

## Doctor APIs (`/doctor/*`)
**Required Role: DOCTOR**

### GET /doctor/patients
Get patients assigned to this doctor.

**Query Parameters:**
- `search` (optional): Search by name, phone, ABHA

**Response (200):**
```json
{
  "success": true,
  "patients": [
    {
      "id": "p_123",
      "name": "Amit Kumar",
      "age": 40,
      "phone": "9876543210",
      "dosha": "Pitta",
      "therapiesCount": 2,
      "ongoingTherapies": 1
    }
  ],
  "count": 5
}
```

---

### POST /doctor/assign-therapy
Assign therapy to patient.

**Request:**
```json
{
  "patientId": "p_123",
  "primaryPractitionerId": "u_prac1",
  "type": "Virechana",
  "phase": "PRADHANAKARMA",
  "startDate": "2026-02-20",
  "durationDays": 7,
  "room": "R-101",
  "herbs": ["Castor Oil", "Triphala"]
}
```

**Response (200):**
```json
{
  "success": true,
  "therapy": {...}
}
```

---

### GET /doctor/patient/:id/progress
Get patient treatment progress and trends.

**Response (200):**
```json
{
  "success": true,
  "progress": {
    "patient": {...},
    "therapies": [
      {
        "therapy": {...},
        "sessions": [...],
        "sessionCount": 5,
        "avgProgress": 60
      }
    ],
    "overallProgress": 60
  }
}
```

---

### GET /doctor/therapy/:id/sessions
Get all sessions for a therapy.

**Response (200):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "s_001",
      "date": "2026-02-21T09:00:00Z",
      "practitionerId": "u_prac1",
      "notes": "Session completed",
      "progressPercent": 15,
      "attended": true
    }
  ],
  "count": 5
}
```

---

### POST /doctor/leave-request
Submit leave request (requires admin approval).

**Request:**
```json
{
  "fromDate": "2026-03-01",
  "toDate": "2026-03-05",
  "reason": "Personal leave",
  "emergencyCoverRequired": true
}
```

**Response (200):**
```json
{
  "success": true,
  "leave": {...},
  "message": "Leave request submitted for admin approval"
}
```

---

### GET /doctor/leaves
Get doctor's leave requests.

**Response (200):**
```json
{
  "success": true,
  "leaves": [...],
  "count": 2
}
```

---

### GET /doctor/dashboard
Get doctor dashboard overview.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalPatients": 15,
    "activeTherapies": 8,
    "completedTherapies": 3,
    "pendingLeaves": 1
  },
  "patients": [...],
  "therapies": [...]
}
```

---

## Practitioner APIs (`/practitioner/*`)
**Required Role: PRACTITIONER**

### GET /practitioner/patients
Get patients assigned to this practitioner.

**Response (200):**
```json
{
  "success": true,
  "patients": [...],
  "count": 8
}
```

---

### POST /practitioner/session
Record therapy session progress.

**Request:**
```json
{
  "therapyId": "t_001",
  "date": "2026-02-21",
  "notes": "Session completed; patient tolerated well",
  "progressPercent": 25,
  "attended": true,
  "vitals": {
    "pulse": 78,
    "bp": "120/80"
  },
  "symptoms": ["pain", "stiffness"]
}
```

**Response (200):**
```json
{
  "success": true,
  "session": {...},
  "message": "Session progress recorded"
}
```

---

### GET /practitioner/patient/:id/therapy
Get patient therapy details.

**Response (200):**
```json
{
  "success": true,
  "progress": {...}
}
```

---

### GET /practitioner/dashboard
Get practitioner dashboard.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalPatients": 8,
    "sessionsToday": 3,
    "totalSessions": 45,
    "avgProgress": 50,
    "pendingLeaves": 0
  },
  "patients": [...],
  "todaySessions": [...]
}
```

---

## Patient APIs (`/patient/*`)
**Required Role: PATIENT**

### GET /patient/dashboard
Get patient dashboard with therapies and notifications.

**Response (200):**
```json
{
  "success": true,
  "patient": {...},
  "progress": {...},
  "notifications": [...],
  "unreadNotifications": 2,
  "preferredLanguage": "en"
}
```

---

### GET /patient/therapy-calendar
Get therapy calendar and schedule.

**Response (200):**
```json
{
  "success": true,
  "therapies": [...],
  "calendar": [
    {
      "id": "t_001",
      "title": "Virechana",
      "startDate": "2026-02-20",
      "endDate": "2026-02-27",
      "location": "R-101"
    }
  ],
  "sessions": [...]
}
```

---

### GET /patient/progress
Get personal therapy progress and trends.

**Response (200):**
```json
{
  "success": true,
  "progress": {...},
  "sessionTrend": [
    {
      "date": "2026-02-21T09:00:00Z",
      "progress": 15,
      "symptoms": ["pain"],
      "vitals": {...}
    }
  ],
  "dosha": "Pitta",
  "doshaRecommendations": {
    "tips": [...],
    "herbs": [...],
    "diet": "..."
  }
}
```

---

### GET /patient/notifications
Get patient notifications.

**Query Parameters:**
- `unreadOnly` (optional): boolean

**Response (200):**
```json
{
  "success": true,
  "notifications": [...],
  "count": 5
}
```

---

### PATCH /patient/notifications/:id/read
Mark notification as read.

**Response (200):**
```json
{
  "success": true,
  "notification": {...}
}
```

---

### GET /patient/profile
Get patient profile with assigned doctor/practitioner.

**Response (200):**
```json
{
  "success": true,
  "patient": {...},
  "assignedDoctor": {...},
  "assignedPractitioner": {...}
}
```

---

## Reception APIs (`/reception/*`)
**Required Role: RECEPTION**

### GET /reception/patients-search
Search for existing patients.

**Query Parameters:**
- `search`: Search term (name, phone, ABHA)

**Response (200):**
```json
{
  "success": true,
  "patients": [...],
  "count": 2
}
```

---

### GET /reception/waiting-list
Get current waiting patients.

**Response (200):**
```json
{
  "success": true,
  "waitingPatients": [
    {
      "id": "p_123",
      "name": "New Patient",
      "age": 45,
      "waitingMinutes": 15,
      "isEmergency": false
    }
  ],
  "count": 3
}
```

---

### POST /reception/create-patient
Register new patient and auto-generate credentials.

**Request:**
```json
{
  "name": "New Patient",
  "age": 45,
  "gender": "Male",
  "phone": "9876543200",
  "email": "patient@example.com",
  "address": "Mumbai",
  "dosha": "Vata",
  "language": "en",
  "medicalHistory": "Arthritis",
  "isEmergency": false
}
```

**Response (200):**
```json
{
  "success": true,
  "patient": {...},
  "credentials": {
    "username": "pat_p_abc",
    "password": "TempPass123",
    "message": "Patient must change password on first login"
  },
  "assignedDoctor": {
    "id": "u_doc1",
    "name": "Dr. Vaidya",
    "specialty": "Panchakarma"
  }
}
```

---

### POST /reception/assign-doctor
Manually assign doctor to patient.

**Request:**
```json
{
  "patientId": "p_123",
  "doctorId": "u_doc2"
}
```

**Response (200):**
```json
{
  "success": true,
  "patient": {...}
}
```

---

### GET /reception/doctors-load
Get doctors with current patient load.

**Response (200):**
```json
{
  "success": true,
  "doctors": [
    {
      "id": "u_doc1",
      "name": "Dr. Vaidya",
      "patientCount": 12
    }
  ]
}
```

---

### POST /reception/check-in
Check in patient (marks as present).

**Request:**
```json
{
  "patientId": "p_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "patient": {...},
  "visitToken": "VISIT_1234567890_p_123",
  "checkedInAt": "2026-02-20T10:30:00Z"
}
```

---

### GET /reception/emergency-doctors
Get senior doctors for emergency cases.

**Response (200):**
```json
{
  "success": true,
  "emergencyDoctors": [
    {
      "id": "u_doc1",
      "name": "Dr. Senior Vaidya",
      "specialty": "Panchakarma"
    }
  ]
}
```

---

### GET /reception/dashboard
Get reception dashboard overview.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalPatients": 45,
    "waitingPatients": 3,
    "checkedInToday": 15,
    "emergencyCases": 1
  },
  "waitingPatients": [...]
}
```

---

## General APIs

### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-20T12:00:00Z",
  "uptime": 3600.5,
  "data": {
    "users": 15,
    "patients": 45,
    "therapies": 20,
    "sessions": 150,
    "logs": 500
  },
  "logIntegrity": "VERIFIED"
}
```

---

### GET /notifications
Get user notifications (authenticated).

**Query Parameters:**
- `unreadOnly` (optional): boolean

**Response (200):**
```json
{
  "success": true,
  "notifications": [...],
  "count": 5
}
```

---

### POST /export-data
Export clinic data as JSON (ADMIN only).

**Response (200):**
```json
{
  "success": true,
  "message": "Clinic data exported",
  "timestamp": "2026-02-20T12:00:00Z",
  "data": {
    "users": [...],
    "patients": [...],
    "therapies": [...],
    "sessions": [...],
    "leaves": [...],
    "notifications": [...]
  }
}
```

---

### POST /import-data
Import clinic data from backup (ADMIN only).

**Request:**
```json
{
  "data": {
    "users": [...],
    "patients": [...]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Data imported successfully"
}
```

---

### GET /reports/clinic-metrics
Get admin analytics KPIs (ADMIN only).

**Response (200):**
```json
{
  "success": true,
  "metrics": {
    "timestamp": "2026-02-20T12:00:00Z",
    "patients": {
      "total": 45,
      "newToday": 2,
      "avgWaitTimeMinutes": 25
    },
    "therapies": {
      "total": 20,
      "ongoing": 12,
      "completed": 8,
      "successRate": "75%"
    },
    "staffLoad": {
      "doctors": 3,
      "avgPatientsPerDoctor": 15,
      "practitioners": 5,
      "avgPatientsPerPractitioner": 9
    },
    "topComplaints": [
      { "complaint": "pain", "count": 15 },
      { "complaint": "stiffness", "count": 12 }
    ]
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

**API Version**: v1.0
**Last Updated**: February 2026
