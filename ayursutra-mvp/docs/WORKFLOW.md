# AyurSutra Business Workflows

Complete step-by-step documentation of all critical healthcare workflows.

---

## Workflow 1: Admin Initializes System

**Actors**: Admin
**Duration**: 5 minutes
**System State**: Empty → Populated with demo data

### Steps

1. **Admin accesses admin portal**
   - URL: `http://localhost:3000/admin/login`
   - Credentials: admin / admin123
   - System: Verifies JWT token, redirects to `/admin/dashboard`

2. **System loads admin dashboard**
   - Shows 6 KPI cards initially at 0
   - Users tab, Leaves tab, Logs tab visible

3. **Admin manually creates staff (OR load seed data)**
   
   **Option A - Manual:**
   - Click "Create New User" button
   - Modal form appears with fields:
     - Username: "doc1"
     - Name: "Dr. Vaidya"
     - Password: "doctor123"
     - Role: "DOCTOR"
     - Specialty: "Panchakarma"
     - Contact: "9876543210"
   - Submit → POST /api/admin/users
   - Backend: Creates user with bcrypt hashed password, logs to audit trail
   - Success: User appears in users list
   - Repeat for multiple doctors/practitioners/reception staff

   **Option B - Seed Data:**
   - Terminal: `curl -X POST http://localhost:5000/api/seed-data`
   - System populates with: 2 doctors, 3 practitioners, 2 reception, 4 patients, 4 therapies

4. **Admin views audit logs**
   - Click Logs tab
   - See all creation events with timestamps
   - System verifies log integrity: "✓ All logs verified"

5. **Workflow completes**
   - Staff can now login via their respective portals
   - System ready for patient intake

---

## Workflow 2: Reception Check-in & Doctor Assignment

**Actors**: Reception, Doctor (Assignment)
**Duration**: 10 minutes
**Trigger**: Patient arrives at clinic

### Steps

1. **Reception searches for patient**
   - Dashboard: Click "Search Patients" tab
   - Enter patient name or phone
   - API: GET /api/reception/patients-search
   - Result: Shows matching patients (if exists)

2. **Patient not found → Create new patient**
   - Click "Create New Patient" button
   - Modal form:
     - Name: "Rajesh Kumar"
     - Age: 45
     - Gender: Male
     - Phone: "9876543210"
     - Email: "rajesh@gmail.com"
     - Address: "Delhi"
     - Dosha: "Vata" (select from dropdown)
     - Medical History: "Chronic pain"
     - Emergency: No (checkbox)
   - Submit → POST /api/reception/create-patient
   
   **Backend Processing:**
   - PatientService.createPatient()
   - Creates User record (auto-generated username: pat_p_xxx, temp password)
   - Creates Patient record with assigned fields
   - Auto loads doctor with least patient count
   - Creates notification for patient
   - Logs to audit trail
   
   **Response to Reception:**
   ```json
   {
     "success": true,
     "patient": {...},
     "credentials": {
       "username": "pat_p_r234",
       "password": "TempPass123"
     },
     "assignedDoctor": {
       "name": "Dr. Vaidya",
       "specialty": "Panchakarma"
     }
   }
   ```

3. **Reception prints/SMS patient credentials**
   - Username: pat_p_r234
   - Password: TempPass123
   - System: Patient receives notification

4. **Reception performs check-in**
   - From Waiting List, click "Check In" button for patient
   - POST /api/reception/check-in
   - System: Generates visit token
   - Backend Response:
     ```json
     {
       "visitToken": "VISIT_1234567890_p_r234",
       "checkedInAt": "2026-02-20T10:30:00Z"
     }
     ```
   - Reception: Provides visit token to patient

5. **Patient meets doctor (at schedule time)**
   - Doctor collects visit token from patient
   - Doctor proceeds to Workflow 3 (therapy assignment)

---

## Workflow 3: Doctor Assigns Therapy

**Actors**: Doctor, Patient (notification recipient)
**Duration**: 15 minutes
**Trigger**: After doctor consultation

### Steps

1. **Doctor logs in to doctor portal**
   - URL: `http://localhost:3000/doctor/login`
   - Credentials: doctor1 / doctor123
   - Redirects to `/doctor/dashboard`

2. **Doctor views assigned patients**
   - Dashboard tab: Shows list of patients
   - Table columns: Name, Age, Phone, Dosha, Active Therapies
   - Can filter by name (search box)

3. **Doctor selects patient and checks progress**
   - Click patient name → Opens patient profile sidebar
   - Shows past therapies, progress trends
   - Doctor decides on new therapy

4. **Doctor assigns therapy**
   - Click "Assign New Therapy" button
   - Form appears:
     ```
     Patient: Rajesh Kumar (pre-filled)
     Therapy Type: [Dropdown: Virechana, Basti, Abhyanga, etc.]
     Phase: [Dropdown: Purvakarma, Pradhankarma, Paschat]
     Duration (days): 7
     Room: R-101
     Primary Practitioner: [Dropdown - all available practitioners]
     Herbs: [Multi-select: Castor Oil, Neem, Triphala]
     Start Date: 2026-02-21
     ```
   - Submit → POST /api/doctor/assign-therapy

   **Backend Processing:**
   ```javascript
   TherapyService.assignTherapy({
     patientId: p_r234,
     doctorId: u_doc1,
     primaryPractitionerId: u_prac1,
     type: "Virechana",
     phase: "PRADHANAKARMA",
     startDate: "2026-02-21",
     durationDays: 7,
     room: "R-101",
     herbs: ["Castor Oil", "Triphala"]
   })
   ```
   - System: Creates Therapy record
   - System: Creates notification for patient: "Dr. Vaidya assigned Virechana therapy"
   - System: Creates audit log: "DOCTOR_ASSIGNED_THERAPY"
   - Response: Success + therapy details

5. **Patient receives notification**
   - Patient app: Bell icon shows unread notification
   - Notification: "Dr. Vaidya assigned Virechana therapy starting 2026-02-21"
   - Patient can view therapy details in dashboard

6. **Workflow completes**
   - Therapy scheduled for next day
   - Practitioner will be notified in Workflow 4

---

## Workflow 4: Practitioner Records Session Progress

**Actors**: Practitioner, Patient (for vitals/symptoms)
**Duration**: 30 minutes per session
**Trigger**: Therapy scheduled day

### Steps

1. **Practitioner logs in**
   - Portal: `http://localhost:3000/practitioner/login`
   - Credentials: prac1 / prac123
   - Dashboard shows: Assigned patients, sessions today

2. **Practitioner views today's sessions**
   - Dashboard tab: "Sessions Today" section
   - Shows list: Patient name, scheduled time, therapy type
   - Selects first patient session

3. **Practitioner records session progress**
   - Clicks "Record Session" button
   - Form appears:
     ```
     Patient: Rajesh Kumar (pre-filled)
     Therapy: Virechana (pre-filled)
     Date: 2026-02-21 (pre-filled)
     Session Notes: "Patient tolerated treatment well, no adverse effects"
     Progress Percentage: [Slider 0-100] → 25%
     Session Attended: ☑ Yes
     Vitals:
       Pulse: 78
       BP: 120/80
       Temperature: 98.6
     Symptoms: [Checkboxes]
       ☑ Pain
       ☐ Stiffness
       ☐ Fatigue
       ☑ Anxiety
     ```
   - Submit → POST /api/practitioner/session

   **Backend Processing:**
   ```javascript
   SessionService.recordSession({
     therapyId: t_001,
     patientId: p_r234,
     date: "2026-02-21T09:00:00Z",
     practitionerId: u_prac1,
     progressPercent: 25,
     attended: true,
     vitals: { pulse: 78, bp: "120/80", temperature: 98.6 },
     symptoms: ["pain", "anxiety"],
     notes: "Patient tolerated well..."
   })
   ```
   - System: Creates Session record
   - System: Updates Therapy progress:
     ```javascript
     therapyProgress = (session1.progress + session2.progress) / sessionCount
     ```
   - System: Creates audit log
   - Response: Success + updated therapy progress

4. **Doctor receives real-time update**
   - Doctor dashboard (if open): Therapy progress bar updates from 0% to 25%
   - Doctor optionally receives notification

5. **Patient sees progress update**
   - Patient dashboard → Therapy card: Progress bar increases
   - Session trends chart: New data point added
   - Symptoms logged: Pain, Anxiety displayed

6. **Practitioner records more sessions**
   - Next day or time: Repeats steps 2-5
   - Session 2: Progress 40% (cumulative avg: 32%)
   - Session 3: Progress 60% (cumulative avg: 41%)
   - Session 7 (final): Progress 100% (cumulative avg: ~70%)

7. **Workflow continues until therapy completes**
   - After session 7: Therapy marked as COMPLETED
   - Patient receives completion notification
   - Doctor notified of therapy success

---

## Workflow 5: Practitioner Requests Leave

**Actors**: Practitioner, Admin (approver)
**Duration**: 5 days (request to approval)

### Steps

1. **Practitioner identifies upcoming leave need**
   - Personal/medical circumstances require leave
   - Dates: March 1-5 (5 days)

2. **Practitioner submits leave request**
   - Portal: Practitioner dashboard
   - Click "Request Leave" button
   - Form:
     ```
     From Date: 2026-03-01
     To Date: 2026-03-05
     Reason: Medical consultation needed
     Emergency Cover Required: ☑ Yes
     (Since patients need continuity)
     ```
   - Submit → POST /api/practitioner/leave-request

   **Backend Processing:**
   ```javascript
   LeaveService.requestLeave({
     userId: u_prac1,
     userRole: "PRACTITIONER",
     fromDate: "2026-03-01",
     toDate: "2026-03-05",
     reason: "Medical consultation",
     emergencyCoverRequired: true
   })
   ```
   - System: Creates Leave record (PENDING)
   - System: Creates notification for admin: "Practitioner prac1 requested leave Mar 1-5"
   - Response: "Leave request submitted for approval"

3. **Admin reviews pending leave**
   - Admin dashboard → Leaves tab
   - Shows:
     ```
     | Practitioner | From Date | To Date | Reason | Status |
     | prac1 (Load: 8) | 2026-03-01 | 2026-03-05 | Medical | PENDING |
     ```
   - Admin clicks "Details" → sees all patients assigned to prac1

4. **Admin approves leave with auto-reassignment**
   - Clicks "Approve" button
   - Confirmation: "This will auto-reassign 8 patients. Continue?"
   - Click "Yes" → PATCH /api/admin/leave/approve

   **Backend Processing:**
   ```javascript
   LeaveService.approveLeave(leaveId)
     ↓
   RosterService.autoAssignOnLeave(leaveId)
     ↓
   FOR EACH patient OF prac1:
     IF patient.therapyStatus == "ONGOING":
       // Find practitioners available Mar 1-5 && not on leave
       availablePracs = [prac2 (load: 6), prac3 (load: 9)]
       // Select least loaded
       newPrac = prac2
       // Reassign
       patient.assignedPractitionerId = u_prac2
       // Log
       auditLog("PRACTITIONER_REASSIGNED", patient, u_prac1 → u_prac2)
       // Notify practitioners
       notifyOldPractitioner(prac1, "Patient reassigned to prac2")
       notifyNewPractitioner(prac2, "Patient reassigned from prac1")
   ```
   - System: Leave marked as APPROVED
   - System: Each of 8 patients reassigned to new practitioners
   - System: 8 audit logs created (immutable)
   - System: Notifications sent to practitioners

5. **Practitioners notified of changes**
   - prac1: Notification "Your leave Mar 1-5 approved. Patients reassigned."
   - prac2: Notification "2 patients assigned to you during prac1's leave"
   - prac3: Notification "1 patient assigned to you during prac1's leave"

6. **Leave period starts**
   - March 1: prac1 is offline
   - System: LeaveService.isUserOnLeave(u_prac1, "2026-03-01") → true
   - prac1's dashboard blocked with message: "On approved leave"
   - Patients continue therapy with new practitioners

7. **Leave period ends**
   - March 6: prac1 returns
   - System: prac1 can login normally
   - Patients remain with assigned practitioners (continuity preserved)

---

## Workflow 6: Admin Monitors System Health

**Actors**: Admin
**Duration**: 15 minutes daily
**Trigger**: Daily routine check OR incident investigation

### Steps

1. **Admin logs in to admin dashboard**
   - Portal: `/admin/login`
   - Dashboard loads → Overview tab

2. **Admin reviews KPI metrics**
   - Display shows:
     ```
     Total Patients: 45 ↑
     Active Therapies: 12
     Completed Therapies: 8
     Success Rate: 75% (8/12)
     Staff Availability: 5/8 (ready, 3 on leave)
     Today's Sessions: 6
     Average Doctor Load: 15 patients
     Average Practitioner Load: 9 patients
     ```

3. **Admin navigates to Users tab**
   - View all staff with status:
     ```
     | Username | Name | Role | Status | Load |
     | doc1 | Dr. Vaidya | DOCTOR | ✓ Active (15) | 15 patients |
     | prac1 | Prac A | PRAC | ⊘ On Leave | -- |
     | rec1 | Raj | REC | ✓ Active | -- |
     | ... | ... | ... | ... | ... |
     ```
   - Can toggle "Enabled" status to disable/enable user

4. **Admin checks audit logs**
   - Click Logs tab
   - Filters available:
     - By user: "prac1"
     - By action: "PRACTITIONER_REASSIGNED"
     - By date: "2026-02-20"
   - Results show:
     ```
     | Timestamp | User | Action | Resource | Hash |
     | 2026-02-20 10:30 | admin | PRACTITIONER_CHANGED_PASSWORD | u_doc1 | sha256... |
     | 2026-02-20 10:25 | doc1 | THERAPY_CREATED | t_001 | sha256... |
     | ... | ... | ... | ... | ... |
     ```

5. **Admin verifies log integrity**
   - Click "Verify Integrity" button
   - System: Walks entire log chain, recalculates hashes, detects tampering
   - Response: "✓ All 234 logs verified. No tampering detected."
   - OR: "⚠ Log #45 hash mismatch. Possible tampering at 2026-02-20 09:15"

6. **Admin exports clinic data**
   - Click "Export Data" button
   - System: Generates JSON export of all data (users, patients, therapies, sessions, logs)
   - Downloads as: ayursutra_backup_2026-02-20.json
   - Can be imported later for recovery

7. **Workflow completes**
   - Admin has full visibility into system health
   - Can identify bottlenecks, staff overload, audit discrepancies

---

## Workflow 7: Patient Views Progress & Wellness Tips

**Actors**: Patient
**Duration**: 10 minutes
**Trigger**: Check progress / Get wellness advice

### Steps

1. **Patient logs in**
   - Public login: `/login`
   - Select role "Patient"
   - Credentials: patient1 / patient123
   - Redirects to patient dashboard

2. **Patient views profile card**
   - Top of dashboard:
     ```
     Rajesh Kumar
     45 years old | Male
     Dosha: Vata
     Assigned Doctor: Dr. Vaidya
     Assigned Practitioner: Prac A
     ```

3. **Patient views active therapies**
   - "My Therapies" section shows cards:
     ```
     ┌─────────────────────────────┐
     │ Virechana (Ongoing)         │
     │ Phase: Pradhanakarma        │
     │ Location: Room R-101        │
     │ Duration: 7 days            │
     │ Progress: ████████░░ 70%    │
     │ [View Details→]             │
     └─────────────────────────────┘
     ```

4. **Patient reviews Dosha wellness tips**
   - "Wellness for Your Dosha" section:
     ```
     VATA BALANCE TIPS
     
     ✓ Maintain warm temperatures
     ✓ Eat warm, nourishing foods
     ✓ Establish daily routine
     ✓ Practice grounding exercises
     
     RECOMMENDED HERBS
     - Ashwagandha (calming)
     - Brahmi (grounding)
     - Sesame oil (warming)
     
     DIET RECOMMENDATIONS
     - Warm ghee-based meals
     - Avoid cold drinks
     - Eat at regular times
     ```

5. **Patient views therapy calendar**
   - "Therapy Calendar" tab shows:
     ```
     FEB 2026          |  Upcoming Sessions
     Mon  20: Start Virechana (R-101)
     Tue  21: Session 1 (9:00 AM)
     Wed  22: Session 2 (9:00 AM)
     Thu  23: Session 3 (9:00 AM)
     Fri  24: Session 4 (9:00 AM)
     ```

6. **Patient views progress trends**
   - "Progress Trends" graph:
     ```
     Sessions: 1    2    3    4
     Progress: ██ ██░ ███░ ████░
     Label:   25% 35% 50% 65%
     ```

7. **Patient views notifications**
   - "Notifications" tab:
     ```
     ✓ Feb 21, 9:30 AM: Session completed
     ✓ Feb 20, 10:00 AM: Therapy assigned
     - Feb 19, 2:00 PM: Reminder: Appointment tomorrow
     ```

8. **Patient marks notifications as read**
   - Click notification → Marked as read (grey out)
   - Unread count decreases

9. **Workflow completes**
   - Patient informed of progress
   - Wellness recommendations provide guidance
   - Motivation to continue treatment

---

## Workflow 8: System Auto-Recovery (Offline)

**Actors**: Frontend (Service Worker)
**Duration**: Automatic
**Trigger**: Network loss

### Steps

1. **Patient using app on mobile loses internet**
   - Network bar disappears
   - Service Worker detects no network

2. **Service Worker shows offline banner**
   - Yellow banner: "⚠ Offline. Using cached data. Changes will sync when online."

3. **Patient can view cached dashboards**
   - Already-loaded data available offline
   - Therapy cards, notifications, calendar visible
   - Cannot make API calls (except queued operations)

4. **Patient's internet returns**
   - Network bar reappears
   - Service Worker: "Syncing changes..."
   - Any queued operations (if supported) sent to server
   - Banner disappears
   - App refreshes with latest data

5. **Backend auto-saves exported backup**
   - /api/export-data called every 24 hours (via node-cron)
   - Creates JSON backup of all clinic data
   - Stored in backend memory (upgradeable to S3)

6. **Admin recovers from backup if needed**
   - If database corrupted: /api/import-data with backup JSON
   - System restores all data
   - Audit logs remain intact

---

## Workflow 9: Patient Self-Signup (New Patient)

**Actors**: Patient (self), System (auto-assignment)
**Duration**: 10 minutes
**Trigger**: New patient arrives without appointment

### Steps

1. **Patient accesses signup page**
   - URL: `http://localhost:3000/patient-signup`
   - Form displayed with fields:
     ```
     Basic Info:
     - Full Name: "Neha Sharma"
     - Age: 35
     - Gender: Female
     
     Contact:
     - Phone: "9876543211"
     - Email: "neha@gmail.com"
     - Address: "Bangalore"
     
     Health:
     - Dosha: [Select: Kapha]
     - Medical History: "Obesity, fatigue"
     - Language: [Select: English]
     
     Account:
     - Username: "neha_pat" (auto-suggested, editable)
     - Password: "***" (create)
     - Confirm Password: "***"
     ```

2. **Patient submits signup form**
   - Submit → POST /api/auth/patient-signup

   **Backend Processing:**
   ```javascript
   PatientService.createPatient({
     name: "Neha Sharma",
     username: "neha_pat",
     password: "neha_secure_123",
     age: 35,
     gender: "Female",
     phone: "9876543211",
     email: "neha@gmail.com",
     address: "Bangalore",
     dosha: "Kapha",
     medicalHistory: "Obesity, fatigue",
     language: "en"
   })
   ```
   - System: Creates User record (PATIENT role)
   - System: Hashes password with bcryptjs
   - System: Creates Patient record
   - System: Auto-generates doctor assignment (least-loaded doctor at time of signup)
   - System: Creates welcome notification
   - System: Creates audit log "PATIENT_SELF_REGISTERED"

3. **System auto-logs patient in**
   - Response: Success + JWT token
   - Token stored in localStorage
   - Redirect to patient dashboard

4. **Patient's dashboard loads**
   - First time: Empty (no therapies yet)
   - Shows profile card with assigned doctor: "Dr. Vaidya"
   - Shows Kapha wellness tips

5. **Workflow completes**
   - Patient ready for reception check-in
   - Doctor can assign therapy next

---

## Workflow 10: Emergency Case Routing

**Actors**: Reception, Senior Doctor
**Duration**: 5 minutes
**Trigger**: Patient emergency status flagged

### Steps

1. **Reception checks "Emergency" when registering patient**
   - Patient registration form, checkbox: "Emergency Case"
   - Submit → creates patient with `isEmergency: true`

2. **Reception accesses emergency doctors list**
   - Dashboard: "Emergency Routing" section
   - Button: "Route to Senior Doctor"
   - System shows available senior doctors

3. **Admin configured senior doctors list**
   - In seed data or via API:
     ```
     Senior doctors identified by specialty:
     - Dr. Vaidya (25 years, Panchakarma)
     - Dr. Sharma (20 years, Internal Medicine)
     ```

4. **Reception selects senior doctor**
   - Clicks "Assign to Dr. Vaidya"
   - POST /api/reception/assign-doctor with emergency flag

5. **Backend processing**
   - Skips least-load logic
   - Directly assigns to selected senior doctor
   - Creates PRIORITY notification: "Emergency case: Neha S. - Acute pain"
   - Doctor receives alert with priority indicator

6. **Doctor receives emergency notification**
   - Doctor app: Red "!" badge in notifications
   - Patient appears at top of "Urgent Cases" list
   - Can immediately begin consultation

7. **Workflow completes**
   - Senior doctor engaged immediately
   - Emergency case tracked in audit logs

---

## State Transitions

### User State Machine
```
CREATED
  ↓
  ├─ verifyPassword() → AUTHENTICATED
  │   └─ generateToken() → SESSION_ACTIVE
  │       └─ tokenExpiry (24h) → SESSION_EXPIRED → redirectToLogin()
  │
  ├─ logout() → LOGGED_OUT
  │
  └─ Admin toggles enabled=false → DISABLED
      └─ cannot login until re-enabled
```

### Therapy State Machine
```
SCHEDULED
  ↓
  practitioner records session (progress > 0)
  ↓
  ONGOING
  ↓
  practitioner records all sessions
  average progress reaches 100%
  ↓
  COMPLETED
  ↓
  [OPTIONAL: Patient discharged or continues new therapy]
```

### Leave State Machine
```
PENDING (practitioner submits)
  ↓
  [Admin action]
  ├─ APPROVED → autoAssignOnLeave() → patients reassigned
  └─ REJECTED → notification sent
```

---

## Role Capabilities Matrix

| Action | Admin | Doctor | Prac | Patient | Recep |
|--------|-------|--------|------|---------|-------|
| Create User | ✓ | ✗ | ✗ | ✗ | ✗ |
| List Users | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✗ | ✗ | ✗ | ✗ |
| Assign Therapy | ✓ | ✓ | ✗ | ✗ | ✗ |
| Record Session | ✗ | ✗ | ✓ | ✗ | ✗ |
| View Own Patients | ✓ | ✓ | ✓ | ✓ | ✗ |
| Search Patients | ✓ | ✓ | ✓ | ✗ | ✓ |
| Request Leave | ✓ | ✓ | ✓ | ✗ | ✓ |
| Approve Leave | ✓ | ✗ | ✗ | ✗ | ✗ |
| Check In Patient | ✗ | ✗ | ✗ | ✗ | ✓ |
| Self Signup | ✗ | ✗ | ✗ | ✓ | ✗ |
| View Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export Data | ✓ | ✗ | ✗ | ✗ | ✗ |

---

**AyurSutra Workflows Complete**: Covers all critical user journeys from system initialization through patient treatment to admin monitoring.
