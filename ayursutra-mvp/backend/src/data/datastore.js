/**
 * SQLite-backed DataStore
 * Replaces the previous in-memory store.
 * Public API is identical to the old DataStore so all callers remain unchanged.
 */
const db = require('./database');
const { v4: uuidv4 } = require('uuid');

// ── helpers ──────────────────────────────────────────────────────────────────
const j = (v) => JSON.stringify(v ?? []);          // array/obj → JSON string
const p = (v) => { try { return JSON.parse(v); } catch { return v; } }; // JSON string → value
const now = () => new Date().toISOString();

/** Map a DB users row back to the shape the app expects */
function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    specialty: row.specialty,
    contact: row.contact,
    email: row.email,
    language: row.language,
    enabled: row.enabled === 1,
    lastLogin: row.last_login,
    createdAt: row.created_at,
    // helper (mirrors User model)
    toResponse() {
      const { passwordHash, toResponse, ...rest } = this;
      return rest;
    }
  };
}

function rowToPatient(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    dob: row.dob,
    age: row.age,
    gender: row.gender,
    dosha: row.dosha,
    preferredLanguage: row.preferred_language,
    abha: row.abha,
    phone: row.phone,
    email: row.email,
    address: row.address,
    assignedDoctorId: row.assigned_doctor_id,
    assignedPractitionerId: row.assigned_practitioner_id,
    therapies: p(row.therapies),
    emergencyContact: row.emergency_contact,
    medicalHistory: row.medical_history,
    isEmergency: row.is_emergency === 1,
    visitToken: row.visit_token,
    checkedInAt: row.checked_in_at,
    registrationType: row.registration_type,
    createdAt: row.created_at,
  };
}

function rowToTherapy(row) {
  if (!row) return null;
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    primaryPractitionerId: row.primary_practitioner_id,
    type: row.type,
    phase: row.phase,
    startDate: row.start_date,
    durationDays: row.duration_days,
    endDate: row.end_date,
    room: row.room,
    herbs: p(row.herbs),
    status: row.status,
    notes: row.notes,
    progressPercent: row.progress_percent,
    sessions: p(row.sessions),
    createdAt: row.created_at,
  };
}

function rowToSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    therapyId: row.therapy_id,
    patientId: row.patient_id,
    date: row.date,
    practitionerId: row.practitioner_id,
    notes: row.notes,
    progressPercent: row.progress_percent,
    attended: row.attended === 1,
    vitals: p(row.vitals),
    attachments: p(row.attachments),
    symptoms: p(row.symptoms),
    createdAt: row.created_at,
  };
}

function rowToLeave(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    userRole: row.user_role,
    fromDate: row.from_date,
    toDate: row.to_date,
    reason: row.reason,
    emergencyCoverRequired: row.emergency_cover_required === 1,
    status: row.status,
    approvedBy: row.reviewed_by,
    approvedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

function rowToNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    read: row.read === 1,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

// ── DataStore ─────────────────────────────────────────────────────────────────
class DataStore {
  // ── USER OPERATIONS ────────────────────────────────────────────────────────
  addUser(user) {
    db.prepare(`
      INSERT OR REPLACE INTO users
        (id, username, password_hash, name, role, specialty, contact, email, language, enabled, last_login, created_at)
      VALUES
        (@id, @username, @password_hash, @name, @role, @specialty, @contact, @email, @language, @enabled, @last_login, @created_at)
    `).run({
      id: user.id,
      username: user.username,
      password_hash: user.passwordHash,
      name: user.name,
      role: user.role,
      specialty: user.specialty ?? null,
      contact: user.contact ?? '',
      email: user.email ?? '',
      language: user.language ?? 'en',
      enabled: user.enabled !== false ? 1 : 0,
      last_login: user.lastLogin ?? null,
      created_at: user.createdAt ?? now(),
    });
    return rowToUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id));
  }

  findUserById(id) {
    return rowToUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
  }

  findUserByUsername(username) {
    return rowToUser(db.prepare('SELECT * FROM users WHERE username = ?').get(username));
  }

  getAllUsers(roleFilter = null) {
    if (roleFilter) {
      return db.prepare('SELECT * FROM users WHERE role = ?').all(roleFilter).map(rowToUser);
    }
    return db.prepare('SELECT * FROM users').all().map(rowToUser);
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    const merged = { ...user, ...updates };
    return this.addUser(merged);
  }

  deleteUser(id) {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ── PATIENT OPERATIONS ─────────────────────────────────────────────────────
  addPatient(patient) {
    db.prepare(`
      INSERT OR REPLACE INTO patients
        (id, user_id, name, dob, age, gender, dosha, preferred_language, abha, phone, email,
         address, assigned_doctor_id, assigned_practitioner_id, therapies,
         emergency_contact, medical_history, is_emergency, visit_token, checked_in_at,
         registration_type, created_at)
      VALUES
        (@id, @user_id, @name, @dob, @age, @gender, @dosha, @preferred_language, @abha, @phone, @email,
         @address, @assigned_doctor_id, @assigned_practitioner_id, @therapies,
         @emergency_contact, @medical_history, @is_emergency, @visit_token, @checked_in_at,
         @registration_type, @created_at)
    `).run({
      id: patient.id,
      user_id: patient.userId ?? null,
      name: patient.name,
      dob: patient.dob ?? null,
      age: patient.age ?? null,
      gender: patient.gender ?? null,
      dosha: patient.dosha ?? '',
      preferred_language: patient.preferredLanguage ?? 'en',
      abha: patient.abha ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
      address: patient.address ?? '',
      assigned_doctor_id: patient.assignedDoctorId ?? null,
      assigned_practitioner_id: patient.assignedPractitionerId ?? null,
      therapies: j(patient.therapies),
      emergency_contact: patient.emergencyContact ?? '',
      medical_history: patient.medicalHistory ?? '',
      is_emergency: patient.isEmergency ? 1 : 0,
      visit_token: patient.visitToken ?? null,
      checked_in_at: patient.checkedInAt ?? null,
      registration_type: patient.registrationType ?? 'NEW',
      created_at: patient.createdAt ?? now(),
    });
    return rowToPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(patient.id));
  }

  findPatientById(id) {
    return rowToPatient(db.prepare('SELECT * FROM patients WHERE id = ?').get(id));
  }

  getAllPatients(search = null, doctorId = null, practitionerId = null) {
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND (LOWER(name) LIKE ? OR phone LIKE ? OR abha LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, `%${search}%`, `%${search}%`);
    }
    if (doctorId) { query += ' AND assigned_doctor_id = ?'; params.push(doctorId); }
    if (practitionerId) { query += ' AND assigned_practitioner_id = ?'; params.push(practitionerId); }
    return db.prepare(query).all(...params).map(rowToPatient);
  }

  updatePatient(id, updates) {
    const patient = this.findPatientById(id);
    if (!patient) return null;
    const merged = { ...patient, ...updates };
    return this.addPatient(merged);
  }

  // ── THERAPY OPERATIONS ─────────────────────────────────────────────────────
  addTherapy(therapy) {
    db.prepare(`
      INSERT OR REPLACE INTO therapies
        (id, patient_id, doctor_id, primary_practitioner_id, type, phase,
         start_date, duration_days, end_date, room, herbs, status, notes,
         progress_percent, sessions, created_at)
      VALUES
        (@id, @patient_id, @doctor_id, @primary_practitioner_id, @type, @phase,
         @start_date, @duration_days, @end_date, @room, @herbs, @status, @notes,
         @progress_percent, @sessions, @created_at)
    `).run({
      id: therapy.id,
      patient_id: therapy.patientId,
      doctor_id: therapy.doctorId ?? null,
      primary_practitioner_id: therapy.primaryPractitionerId ?? null,
      type: therapy.type,
      phase: therapy.phase ?? null,
      start_date: therapy.startDate ?? null,
      duration_days: therapy.durationDays ?? null,
      end_date: therapy.endDate ?? null,
      room: therapy.room ?? null,
      herbs: j(therapy.herbs),
      status: therapy.status ?? 'SCHEDULED',
      notes: therapy.notes ?? '',
      progress_percent: therapy.progressPercent ?? 0,
      sessions: j(therapy.sessions),
      created_at: therapy.createdAt ?? now(),
    });

    // Also update the patient's therapies array
    const patient = this.findPatientById(therapy.patientId);
    if (patient && !patient.therapies.includes(therapy.id)) {
      const updatedTherapies = [...patient.therapies, therapy.id];
      db.prepare('UPDATE patients SET therapies = ? WHERE id = ?').run(j(updatedTherapies), therapy.patientId);
    }

    return rowToTherapy(db.prepare('SELECT * FROM therapies WHERE id = ?').get(therapy.id));
  }

  findTherapyById(id) {
    return rowToTherapy(db.prepare('SELECT * FROM therapies WHERE id = ?').get(id));
  }

  getPatientTherapies(patientId) {
    return db.prepare('SELECT * FROM therapies WHERE patient_id = ?').all(patientId).map(rowToTherapy);
  }

  updateTherapy(id, updates) {
    const therapy = this.findTherapyById(id);
    if (!therapy) return null;
    const merged = { ...therapy, ...updates };
    return this.addTherapy(merged);
  }

  // ── SESSION OPERATIONS ─────────────────────────────────────────────────────
  addSession(session) {
    db.prepare(`
      INSERT OR REPLACE INTO sessions
        (id, therapy_id, patient_id, date, practitioner_id, notes,
         progress_percent, attended, vitals, attachments, symptoms, created_at)
      VALUES
        (@id, @therapy_id, @patient_id, @date, @practitioner_id, @notes,
         @progress_percent, @attended, @vitals, @attachments, @symptoms, @created_at)
    `).run({
      id: session.id,
      therapy_id: session.therapyId,
      patient_id: session.patientId ?? null,
      date: session.date,
      practitioner_id: session.practitionerId ?? null,
      notes: session.notes ?? '',
      progress_percent: session.progressPercent ?? 0,
      attended: session.attended !== false ? 1 : 0,
      vitals: j(session.vitals ?? {}),
      attachments: j(session.attachments),
      symptoms: j(session.symptoms),
      created_at: session.createdAt ?? now(),
    });

    // Update therapy's sessions list
    const therapy = this.findTherapyById(session.therapyId);
    if (therapy && !therapy.sessions.includes(session.id)) {
      const updatedSessions = [...therapy.sessions, session.id];
      db.prepare('UPDATE therapies SET sessions = ? WHERE id = ?').run(j(updatedSessions), session.therapyId);
    }

    return rowToSession(db.prepare('SELECT * FROM sessions WHERE id = ?').get(session.id));
  }

  findSessionById(id) {
    return rowToSession(db.prepare('SELECT * FROM sessions WHERE id = ?').get(id));
  }

  getTherapySessions(therapyId) {
    return db.prepare('SELECT * FROM sessions WHERE therapy_id = ? ORDER BY date DESC')
      .all(therapyId).map(rowToSession);
  }

  // ── LEAVE OPERATIONS ───────────────────────────────────────────────────────
  addLeave(leave) {
    db.prepare(`
      INSERT OR REPLACE INTO leaves
        (id, user_id, user_role, from_date, to_date, reason, emergency_cover_required,
         status, reviewed_by, reviewed_at, created_at)
      VALUES
        (@id, @user_id, @user_role, @from_date, @to_date, @reason, @emergency_cover_required,
         @status, @reviewed_by, @reviewed_at, @created_at)
    `).run({
      id: leave.id,
      user_id: leave.userId,
      user_role: leave.userRole ?? '',
      from_date: leave.fromDate,
      to_date: leave.toDate,
      reason: leave.reason ?? '',
      emergency_cover_required: leave.emergencyCoverRequired ? 1 : 0,
      status: leave.status ?? 'PENDING',
      reviewed_by: leave.approvedBy ?? null,
      reviewed_at: leave.approvedAt ?? null,
      created_at: leave.createdAt ?? now(),
    });
    return rowToLeave(db.prepare('SELECT * FROM leaves WHERE id = ?').get(leave.id));
  }

  findLeaveById(id) {
    return rowToLeave(db.prepare('SELECT * FROM leaves WHERE id = ?').get(id));
  }

  getPendingLeaves() {
    return db.prepare("SELECT * FROM leaves WHERE status = 'PENDING'").all().map(rowToLeave);
  }

  getUserLeaves(userId) {
    return db.prepare('SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC').all(userId).map(rowToLeave);
  }

  updateLeave(id, updates) {
    const leave = this.findLeaveById(id);
    if (!leave) return null;
    const merged = { ...leave, ...updates };
    return this.addLeave(merged);
  }

  // Find patient by their linked user account id
  findPatientByUserId(userId) {
    return rowToPatient(db.prepare('SELECT * FROM patients WHERE user_id = ?').get(userId));
  }

  // Get all sessions for a practitioner
  getPractitionerSessions(practitionerId) {
    return db.prepare('SELECT * FROM sessions WHERE practitioner_id = ? ORDER BY date DESC')
      .all(practitionerId).map(rowToSession);
  }

  // Get ALL therapies (admin / global queries)
  getAllTherapies() {
    return db.prepare('SELECT * FROM therapies ORDER BY created_at DESC').all().map(rowToTherapy);
  }

  // Get ALL sessions (admin / global queries)
  getAllSessions() {
    return db.prepare('SELECT * FROM sessions ORDER BY date DESC').all().map(rowToSession);
  }

  // Get ALL leaves
  getAllLeaves() {
    return db.prepare('SELECT * FROM leaves ORDER BY created_at DESC').all().map(rowToLeave);
  }

  // ── NOTIFICATION OPERATIONS ────────────────────────────────────────────────
  addNotification(notification) {
    db.prepare(`
      INSERT OR REPLACE INTO notifications
        (id, user_id, type, message, read, read_at, created_at)
      VALUES
        (@id, @user_id, @type, @message, @read, @read_at, @created_at)
    `).run({
      id: notification.id,
      user_id: notification.userId,
      type: notification.type,
      message: notification.message,
      read: notification.read ? 1 : 0,
      read_at: notification.readAt ?? null,
      created_at: notification.createdAt ?? now(),
    });
    return rowToNotification(db.prepare('SELECT * FROM notifications WHERE id = ?').get(notification.id));
  }

  getUserNotifications(userId, unreadOnly = false) {
    if (unreadOnly) {
      return db.prepare("SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC")
        .all(userId).map(rowToNotification);
    }
    return db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId).map(rowToNotification);
  }

  markNotificationAsRead(notificationId) {
    db.prepare("UPDATE notifications SET read = 1, read_at = ? WHERE id = ?")
      .run(now(), notificationId);
    return rowToNotification(db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId));
  }

  // ── UTILITY ────────────────────────────────────────────────────────────────
  clear() {
    db.exec(`
      DELETE FROM notifications;
      DELETE FROM leaves;
      DELETE FROM sessions;
      DELETE FROM therapies;
      DELETE FROM patients;
      DELETE FROM users;
    `);
  }

  export() {
    return {
      users: db.prepare('SELECT * FROM users').all().map(rowToUser),
      patients: db.prepare('SELECT * FROM patients').all().map(rowToPatient),
      therapies: db.prepare('SELECT * FROM therapies').all().map(rowToTherapy),
      sessions: db.prepare('SELECT * FROM sessions').all().map(rowToSession),
      leaves: db.prepare('SELECT * FROM leaves').all().map(rowToLeave),
      notifications: db.prepare('SELECT * FROM notifications').all().map(rowToNotification),
    };
  }
}

module.exports = new DataStore();
