# AyurSutra Architecture & Design

## System Overview

AyurSutra is a **layered, role-based healthcare system** built with Node.js/Express backend and React/Vite frontend. The architecture follows **SOLID principles** and **Clean Architecture** patterns for maintainability and scalability.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  React (UI) + Zustand (State) + Tailwind (Styling)        │
├─────────────────────────────────────────────────────────────┤
│                   API Gateway Layer                         │
│  Axios (HTTP) + JWT Interceptor + Error Handling          │
├─────────────────────────────────────────────────────────────┤
│              REST API Layer (Express)                       │
│  Routes (40+) + RBAC Middleware + Request Validation      │
├─────────────────────────────────────────────────────────────┤
│               Business Logic Layer                          │
│  Services (7) + Notification Engine + Roster Manager      │
├─────────────────────────────────────────────────────────────┤
│               Data Access Layer                            │
│  Models + In-Memory Store + Audit Logger                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### 1. Entry Point: `server.js`
Initializes Express app with:
- CORS configuration
- Body parser (10MB limit)
- Helmet security headers
- Route mounting (7 route files)
- Global error handler
- Seed data endpoint

```
server.js (port 5000)
  ├── Config (env vars)
  ├── Middleware (auth, cors, helmet)
  ├── Routes
  │   ├── /auth
  │   ├── /admin
  │   ├── /doctor
  │   ├── /practitioner
  │   ├── /patient
  │   ├── /reception
  │   └── /general
  └── Error Handler
```

### 2. Configuration: `config.js`
Centralizes environment variables:
```javascript
{
  port: 5000,
  nodeEnv: 'development',
  jwtSecret: 'secret',
  jwtExpiry: '24h',
  bcryptRounds: 10,
  logRetentionDays: 90
}
```

### 3. Utilities Layer

#### **tokenManager.js**
Handles JWT generation and verification:
- `generateToken(user)` → Returns JWT
- `verifyToken(token)` → Returns decoded payload
- `extractToken(header)` → Parses "Bearer <token>"
- Token includes: `id`, `username`, `role`
- Expiry: 24 hours

#### **passwordUtils.js**
Handles password security:
- `hashPassword(password)` → bcrypt hash (10 rounds)
- `comparePassword(password, hash)` → Verify password
- Used in login and user creation

#### **logger.js** (Immutable Audit Logger)
Creates tamper-evident logs using SHA256 hash chaining:
```javascript
logHash(userId, action, resourceId, details) {
  const hash = SHA256(previousLog.hash + newLog)
  return { ...newLog, hash }
}

verifyIntegrity() {
  walks entire log chain
  recalculates each hash
  detects if any log was modified
}
```

### 4. Data Models

Six core models with in-memory storage:

#### **User Model**
```javascript
{
  id: 'u_numeric_id',
  username: 'string',
  passwordHash: 'bcrypt_hash',
  name: 'string',
  role: 'ADMIN|DOCTOR|PRACTITIONER|RECEPTION|PATIENT',
  specialty: 'string (doctors only)',
  contact: 'string',
  email: 'string',
  language: 'en|hi',
  enabled: true,
  createdAt: 'ISO_DATE'
}
```

#### **Patient Model**
```javascript
{
  id: 'p_numeric_id',
  userId: 'u_xxx',  // links to user account
  name: 'string',
  age: 'number',
  gender: 'M|F|Other',
  dosha: 'Vata|Pitta|Kapha|Tridosha',
  phone: 'string',
  email: 'string',
  address: 'string',
  abha: 'string (national id)',
  assignedDoctorId: 'u_doc_id',
  assignedPractitionerId: 'u_prac_id',
  therapies: ['t_ids'],
  medicalHistory: 'string',
  createdAt: 'ISO_DATE'
}
```

#### **Therapy Model**
```javascript
{
  id: 't_numeric_id',
  patientId: 'p_xxx',
  doctorId: 'u_doc_id',
  primaryPractitionerId: 'u_prac_id',
  type: 'string (Virechana, Basti, etc)',
  phase: 'PURVAKARMA|PRADHANAKARMA|PASCHAT',
  startDate: 'DATE',
  durationDays: 'number',
  room: 'string (R-101)',
  herbs: ['string'],
  status: 'SCHEDULED|ONGOING|COMPLETED|CANCELLED',
  progressPercent: 'number (0-100)',
  sessions: ['s_ids'],
  createdAt: 'ISO_DATE'
}
```

#### **Session Model**
```javascript
{
  id: 's_numeric_id',
  therapyId: 't_xxx',
  patientId: 'p_xxx',
  date: 'ISO_DATE',
  practitionerId: 'u_prac_id',
  notes: 'string',
  progressPercent: 'number',
  attended: 'boolean',
  vitals: { pulse, bp, temperature },
  symptoms: ['string'],
  createdAt: 'ISO_DATE'
}
```

#### **Leave Model**
```javascript
{
  id: 'l_numeric_id',
  userId: 'u_xxx',
  userRole: 'DOCTOR|PRACTITIONER',
  fromDate: 'DATE',
  toDate: 'DATE',
  reason: 'string',
  emergencyCoverRequired: 'boolean',
  status: 'PENDING|APPROVED|REJECTED',
  approvedBy: 'u_admin_id',
  approvedAt: 'ISO_DATE',
  createdAt: 'ISO_DATE'
}
```

#### **Notification Model**
```javascript
{
  id: 'n_numeric_id',
  userId: 'u_xxx',
  type: 'THERAPY_ASSIGNED|SESSION_REMINDER|LEAVE_APPROVED|etc',
  title: 'string',
  message: 'string',
  data: { therapyId, patientId, etc },
  read: 'boolean',
  createdAt: 'ISO_DATE'
}
```

### 5. Data Access Layer: `datastore.js`

In-memory JSON store with CRUD methods:
```javascript
{
  users: Map<id, User>,
  patients: Map<id, Patient>,
  therapies: Map<id, Therapy>,
  sessions: Map<id, Session>,
  leaves: Map<id, Leave>,
  notifications: Map<id, Notification>,
  auditLogs: Array<AuditLog>  // Immutable
}
```

#### Methods by Resource:
- `createUser()`, `getUser()`, `getUsers()`, `updateUser()`, `getUserByUsername()`
- `createPatient()`, `getPatient()`, `getPatients()`, `getPatientsByDoctor()`, `getPatientsByPractitioner()`
- `createTherapy()`, `getTherapy()`, `updateTherapyProgress()`, `assignNewPractitioner()`
- `createSession()`, `getSession()`, `getSessionsByTherapy()`
- `createLeave()`, `getLeave()`, `getLeavesByUser()`, `getPendingLeaves()`
- `createNotification()`, `getNotifications()`, `markNotificationRead()`, `getUnreadNotifications()`
- `exportData()`, `importData()` for backup/restore

### 6. Services Layer (Business Logic)

Seven services encapsulate domain logic:

#### **UserService**
Functions:
- `createUser()` - Validates & hashes password, creates audit log
- `authenticateUser()` - Finds user by username & verifies password
- `getUserProfile()` - Returns user with role-specific data
- `toggleUserStatus()` - Enable/disable user

#### **PatientService**
Functions:
- `createPatient()` - Creates patient + user account + initial notification
- `getPatientsByDoctor()` - Returns doctor's assigned patients
- `getPatientsByPractitioner()` - Returns practitioner's assigned patients
- `assignDoctorToPat ient()` - Assigns with least-load balancing
- `assignPractitionerToPatient()` - Assigns with FIFO if not specified
- `getPatientProgress()` - Calculates avg therapy progress

#### **TherapyService**
Functions:
- `assignTherapy()` - Creates therapy + assigns practitioner + notifies patient
- `updateTherapyProgress()` - Calculates avg of all sessions
- `getTherapyDetails()` - Returns therapy + sessions + patient
- `reassignPractitioner()` - Changes practitioner + audit log

#### **SessionService** (embedded in therapyService)
Functions:
- `recordSession()` - Creates session + updates therapy progress
- `getSessionsByTherapy()` - Returns all sessions for therapy

#### **LeaveService**
Functions:
- `requestLeave()` - Creates leave + sends admin notification
- `approveLeave()` - Updates leave status + calls auto-reassignment
- `rejectLeave()` - Updates leave status + sends notification
- `getAllLeavesByUser()` - Returns user's leave requests
- `getPendingLeaves()` - Returns all pending (for admin)
- `isUserOnLeave()` - Checks if user is on leave for date

#### **NotificationService**
Functions:
- `createNotification()` - Creates notification + audit log
- `getUserNotifications()` - Returns user's notifications
- `markNotificationRead()` - Updates read status
- `sendTherapyAssignmentNotification()` - Notifies patient
- `sendSessionReminderNotification()` - Notifies patient
- `sendLeaveApprovalNotification()` - Notifies doctor/practitioner

#### **RosterService** (Auto-reassignment Logic)
Functions:
- `autoAssignOnLeave(leaveId)` - When leave approved:
  1. Get all patients assigned to on-leave practitioner
  2. Find available practitioners on that date range
  3. Calculate load for each: `patientCount - therapiesInProgress`
  4. Assign to practitioner with least load
  5. Create audit logs for each reassignment
  6. Notify old practitioner (for awareness)

Algorithm:
```
FOR EACH patient OF on-leave-practitioner:
  IF patient.therapyStatus == 'ONGOING':
    availablePracs = getRosterForDateRange(leave.fromDate, leave.toDate)
    leastLoadedPrac = findMin(availablePracs, by: patientLoad)
    reassignPatient(patient, leastLoadedPrac)
    auditLog('PRACTITIONER_REASSIGNED', patient, newPrac)
```

### 7. Middleware Layer

#### **auth.js** (RBAC Middleware)
Contains three middleware functions:

```javascript
authMiddleware(req, res, next)
  → Extracts & verifies JWT token
  → Sets req.user = decoded payload
  → Returns 401 if token missing/invalid
  → Logs verification attempts to audit log

requireRole(...roles)(req, res, next)
  → Checks req.user.role is in allowed roles
  → Returns 403 if unauthorized
  → Logs unauthorized attempts to audit log
  → Applied to all protected routes

optionalAuth(req, res, next)
  → Attempts to verify token
  → Sets req.user if valid, null if not
  → Never blocks (for public routes with optional auth)

sessionTimeout(req, res, next)
  → Checks token issue time
  → Returns 401 if > 24 hours
  → Logs session timeouts
```

#### **errorHandler.js**
```javascript
globalErrorHandler(err, req, res, next)
  → Catches all unhandled errors
  → Logs to audit logger
  → Returns standardized error response
  → Never exposes stack traces in production
```

### 8. Routes Layer (40+ Endpoints)

Seven route files mounted on Express:

| File | Role | Count | Examples |
|------|------|-------|----------|
| `auth.js` | Public | 4 | login, logout, patient-signup, refresh |
| `admin.js` | ADMIN | 10 | create user, list logs, approve leave, reassign |
| `doctor.js` | DOCTOR | 6 | list patients, assign therapy, track progress |
| `practitioner.js` | PRACTITIONER | 5 | list patients, record session, view therapy |
| `patient.js` | PATIENT | 5 | dashboard, calendar, progress, notifications |
| `reception.js` | RECEPTION | 7 | search, waiting list, create patient, check-in |
| `general.js` | ALL/PUBLIC | 4 | health, export, import, metrics |

**Total: 41 endpoints**

Each route:
1. Applies role-based middleware (except public)
2. Validates request body (express-validator)
3. Calls appropriate service
4. Returns JSON response
5. Catches errors → errorHandler

---

## Frontend Architecture

### 1. Entry Point: `main.jsx`
Initializes React app:
```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

### 2. App Component: `App.jsx`
Router configuration with protected routes:
```javascript
<BrowserRouter>
  <Routes>
    {/* Public */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/patient-signup" element={<PatientSignupPage />} />
    <Route path="/admin/login" element={<AdminLoginPage />} />
    <Route path="/doctor/login" element={<DoctorLoginPage />} />
    <Route path="/practitioner/login" element={<PractitionerLoginPage />} />
    
    {/* Protected */}
    <Route element={<ProtectedRoute />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/practitioner/dashboard" element={<PractitionerDashboard />} />
      <Route path="/patient/dashboard" element={<PatientDashboard />} />
      <Route path="/reception/dashboard" element={<ReceptionDashboard />} />
    </Route>
  </Routes>
</BrowserRouter>
```

`ProtectedRoute` component:
```javascript
function ProtectedRoute() {
  const { user } = useAuthStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <Outlet />
}
```

### 3. State Management: `store.js` (Zustand)

Three stores for separating concerns:

#### **useAuthStore**
```javascript
{
  user: null,  // { id, username, role, ... }
  token: null,
  login(user, token),
  logout(),
  setUser(user),
  isAuthenticated: boolean
}
```

#### **useNotificationStore**
```javascript
{
  notifications: [],  // [{ id, title, message, ... }]
  unreadCount: number,
  addNotification(notification),
  markAsRead(notificationId),
  clearAll()
}
```

#### **usePatientStore**
```javascript
{
  patients: [],
  therapies: [],
  setPatients(patients),
  setTherapies(therapies),
  updatePatientProgress(patientId, progress)
}
```

### 4. API Service: `api.js`

Axios wrapper with:
- **Base configuration**: baseURL, headers
- **JWT Interceptor**: Injects token on every request
- **Error Interceptor**: Handles 401 → logout → redirect to login
- **45+ API methods** organized by role:

```javascript
export const API = {
  // Auth (public)
  auth: {
    login: (username, password, role) => {...},
    logout: () => {...},
    patientSignup: (data) => {...},
    refreshToken: () => {...}
  },
  
  // Admin
  admin: {
    createUser: (userData) => {...},
    listUsers: (role) => {...},
    toggleUser: (id, enabled) => {...},
    getLogs: (filters) => {...},
    approveLe ave: (leaveId) => {...},
    ...
  },
  
  // Doctor
  doctor: {
    getPatients: (search) => {...},
    assignTherapy: (data) => {...},
    getProgress: (patientId) => {...},
    ...
  },
  
  // Practitioner, Patient, Reception, General
  // ...
}
```

### 5. Components: `Common.jsx`

Eight reusable Tailwind-styled components:

#### **Header**
Navigation bar with logo, user menu, language toggle

#### **Footer**
Copyright, links, contact info

#### **Card**
Generic container with border, padding, shadow

#### **Stat**
Displays metric: label + number + unit

#### **Modal**
Overlay dialog for forms and confirmations

#### **LoadingSpinner**
Animated loading indicator

#### **ErrorAlert**
Red alert for error messages

#### **SuccessAlert**
Green alert for success messages

#### **TabBar**
Horizontal tabs for section navigation

#### **Table**
Responsive table with sorting/filtering

#### **FormGroup**
Input wrapper with label, error message

### 6. Pages: `AuthPages.jsx`

Five authentication pages:

#### **LoginPage** (`/login`)
- Public landing page
- Role selector (Radio: Patient / Reception)
- Username + Password form
- "New Patient? Sign up" link

#### **PatientSignupPage** (`/patient-signup`)
- Self-registration form
- Fields: Name, username, password, age, gender, phone, email, address, dosha, language
- Creates user + patient record
- Auto-login on success

#### **AdminLoginPage** (`/admin/login`)
- Hidden portal (red theme)
- Username + Password
- Redirects to admin dashboard on success

#### **DoctorLoginPage** (`/doctor/login`)
- Hidden portal (emerald theme)
- Username + Password
- Redirects to doctor dashboard on success

#### **PractitionerLoginPage** (`/practitioner/login`)
- Hidden portal (purple theme)
- Username + Password
- Redirects to practitioner dashboard on success

### 7. Dashboards

#### **AdminDashboard**
Sections:
1. **Overview**: 6 KPI cards (patients, doctors, therapies, success rate, today's sessions, staff load)
2. **Users**: Tab to create new users + list all users
3. **Leaves**: Tab to approve/reject leave requests
4. **Logs**: Tab to view audit logs + verify integrity

#### **DoctorDashboard**
Sections:
1. **Overview**: Patient count, therapies, success rate
2. **Patients**: Table of assigned patients with search
3. **Assign Therapy**: Form to assign therapy to patient
4. **Sessions**: View patient's therapy session details
5. **Leave Request**: Submit leave with date range
6. **Dashboard**: Metrics on assigned patients

#### **PractitionerDashboard**
Sections:
1. **Overview**: Assigned patients, sessions today, average progress
2. **Session Recording**: Form to record therapy progress
3. **Patients**: Table of assigned patients
4. **Leave Request**: Submit leave
5. **Dashboard**: Metrics on today's sessions

#### **PatientDashboard**
Sections:
1. **Profile Card**: Name, age, dosha, assigned doctor/practitioner
2. **Active Therapies**: Cards showing therapy type, phase, progress bar
3. **Dosha Tips**: Personalized wellness recommendations + herbs
4. **Therapy Calendar**: Upcoming therapies in calendar view
5. **Session Trends**: Line chart of progress over time
6. **Notifications**: List of recent notifications

#### **ReceptionDashboard**
Sections:
1. **Overview**: Patient count, waiting list, emergencies
2. **Waiting List**: Table of patients queued for doctor assignment
3. **Patient Registration**: Form to create new patient (auto-generates credentials)
4. **Check-in**: Quick check-in with visit token generation
5. **Emergency Routing**: Route to senior doctor if needed

### 8. Internationalization: `i18n/config.js`

i18next setup with:
- **Languages**: English (en), Hindi (hi)
- **Namespaces**: common, dashboard, auth
- **Detection**: Browser language preference
- **Fallback**: English if language not available

Example translations:
```javascript
{
  "en": {
    "login": {
      "title": "Login",
      "username": "Username",
      "password": "Password"
    }
  },
  "hi": {
    "login": {
      "title": "लॉगिन",
      "username": "उपयोगकर्ता नाम",
      "password": "पासवर्ड"
    }
  }
}
```

### 9. Styling: `index.css` + Tailwind Config

Global CSS with:
- Tailwind utilities + custom classes
- Ayurvedic color palette:
  - Primary: Gold (Dosha harmony)
  - Secondary: Green (Nature, health)
  - Accent: Purple (Spirituality)
  - Neutral: Warm beige (Tradition)

### 10. Service Worker: `serviceWorker.js` + `public/sw.js`

PWA capabilities:
- **Cache-first strategy** for static assets (HTML, CSS, JS)
- **Network-first strategy** for API calls (with offline fallback)
- **Offline detection**: Shows banner when no network
- **Service worker registration** on app load
- **Automatic cache updates** on new deployment

```javascript
// Cache assets
const ASSETS = [
  '/index.html',
  '/style.css',
  '/app.js',
  ...
]

sw.addEventListener('install', event => {
  // Pre-cache assets
})

sw.addEventListener('fetch', event => {
  if (isStaticAsset) {
    // Cache-first
  } else if (isAPICall) {
    // Network-first
  }
})
```

---

## Data Flow

### Login Flow
```
User Input
  ↓
LoginPage.jsx → calls API.auth.login()
  ↓
api.js → POST /api/auth/login
  ↓
backend auth.js → POST /auth/login
  ↓
UserService.authenticateUser() → bcrypt compare
  ↓
tokenManager.generateToken() → JWT
  ↓
Response + set localStorage token
  ↓
useAuthStore.login() → update state
  ↓
Redirect /dashboard
```

### Therapy Assignment Flow
```
Doctor Input (DoctorDashboard)
  ↓
DoctorDashboard → calls API.doctor.assignTherapy()
  ↓
api.js → POST /api/doctor/assign-therapy
  ↓
backend doctor.js → POST /doctor/assign-therapy
  ↓
TherapyService.assignTherapy()
  ↓
datastore.createTherapy() → Create Therapy model
  ↓
NotificationService.createNotification()
  ↓
AuditLogger.logHash() → Immutable log
  ↓
Response + notification to patient
  ↓
PatientDashboard auto-refresh → shows new therapy
```

### Session Recording & Progress Flow
```
Practitioner Input (PractitionerDashboard)
  ↓
PractitionerDashboard → calls API.practitioner.recordSession()
  ↓
api.js → POST /api/practitioner/session
  ↓
backend practitioner.js → POST /practitioner/session
  ↓
ServiceService.recordSession()
  ↓
TherapyService.updateTherapyProgress()
  ↓
progressPercent = avg(allSessions.progressPercent)
  ↓
datastore.updateTherapyProgress()
  ↓
AuditLogger.logHash() → Immutable log
  ↓
PatientDashboard fetches → shows updated progress bar
```

---

## Security Architecture

### Authentication
- JWT tokens with 24-hour expiry
- Tokens stored in localStorage (httpOnly not viable in SPAs)
- Automatic token refresh on 401 response

### Authorization (RBAC)
- `requireRole(...roles)` middleware on every protected route
- Role matrix enforced at API level
- Frontend route guards with ProtectedRoute component

### Data Protection
- All passwords hashed with bcryptjs (10 rounds)
- No plaintext passwords in logs
- Sensitive data (token) in Authorization header

### Audit & Compliance
- Immutable audit logs with SHA256 hash chaining
- All state-changing operations logged
- Log integrity verification available

### Network Security
- CORS configured for specific origin
- Helmet.js headers (CSP, X-Frame-Options, etc.)
- HTTPS-ready (configure in production)

---

## Scalability Considerations

### Current MVP
- In-memory data store (fast for demo)
- Single Node.js process
- Suitable for: Hackathon demo, proof-of-concept

### Phase 2 (Post-MVP)
- PostgreSQL + connection pooling
- User table with proper indexing on username, role
- Therapy/Session tables with patient_id indices
- Leave table with date range indices
- Audit logs → separate read-only table

### Phase 3 (Enterprise)
- Spring Boot microservices
- Kafka for async notifications
- Redis for caching
- Elasticsearch for audit log search
- Kubernetes deployment with auto-scaling

---

## Testing Strategy

### Backend Unit Tests
- Service methods (UserService, PatientService, etc.)
- Utility functions (tokenManager, passwordUtils, logger)
- RBAC middleware

### Backend Integration Tests
- Full API flows (login → assign therapy → record session)
- Database operations
- Notification pipeline

### Frontend Component Tests
- Protected routes (attempt access without auth)
- Form validation
- State management (Zustand stores)

### End-to-End Tests
- Complete user workflows across roles
- Offline capability (Service Worker)
- Browser compatibility

---

## Deployment Architecture

### Development
```
Local Machine
├── Backend (npm run dev on port 5000)
├── Frontend (npm run dev on port 3000)
└── SQLite/JSON store
```

### Production
```
Cloud (AWS/GCP/Azure)
├── Frontend (Netlify/Vercel, static hosting)
├── Backend API (EC2/App Engine, Node.js)
├── PostgreSQL (RDS/Cloud SQL)
├── Redis (ElastiCache/Memorystore)
├── S3/Cloud Storage (PDFs, exports)
└── CloudFront/CDN (asset distribution)
```

---

**AyurSutra Architecture Summary**: Layered, role-based, scalable, secure, audit-enabled healthcare system ready for SMH hackathon demo and post-hackathon enterprise deployment.
