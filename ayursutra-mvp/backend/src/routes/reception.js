const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  sessionTimeout
} = require('../middleware/auth');
const patientService = require('../services/patientService');
const userService = require('../services/userService');
const rosterService = require('../services/rosterService');
const notificationService = require('../services/notificationService');
const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/reception/dashboard
 * Reception dashboard overview
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const patients = datastore.getAllPatients();
    const today = new Date().toDateString();

    // Waiting = patients who haven't been checked in yet
    const waitingPatients = patients.filter(p => !p.checkedInAt);

    const stats = {
      totalPatients: patients.length,
      waitingPatients: waitingPatients.length,
      checkedInToday: patients.filter(p =>
        p.checkedInAt && new Date(p.checkedInAt).toDateString() === today
      ).length,
      emergencyCases: patients.filter(p => p.isEmergency).length,
      newPatientsToday: patients.filter(p =>
        new Date(p.createdAt).toDateString() === today
      ).length
    };

    res.json({ success: true, stats, waitingPatients });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   PATIENT SEARCH & WAITING LIST
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/reception/patients-search
 * Search for existing patients (by name or phone)
 */
router.get('/patients-search', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { search } = req.query;
    const patients = patientService.listPatients({ search });

    // Enrich with assigned doctor info
    const enriched = patients.map(p => {
      const doctor = p.assignedDoctorId ? datastore.findUserById(p.assignedDoctorId) : null;
      return {
        ...p,
        assignedDoctor: doctor ? doctor.toResponse() : null
      };
    });

    res.json({ success: true, patients: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reception/waiting-list
 * Get current waiting patients (sorted: emergencies first)
 */
router.get('/waiting-list', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const patients = datastore.getAllPatients();

    // Waiting list = patients who haven't been checked in yet
    // - new patients with no doctor assigned (just registered)
    // - patients with a doctor assigned but not yet physically checked in
    // EXCLUDE patients who already have checkedInAt set (they've been processed)
    const waitingPatients = patients.filter(p => !p.checkedInAt);

    const enriched = waitingPatients.map(p => {
      const doctor = p.assignedDoctorId ? datastore.findUserById(p.assignedDoctorId) : null;
      return {
        ...p,
        doctorName: doctor ? doctor.name : null,
        waitingMinutes: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 60000)
      };
    }).sort((a, b) => {
      // Emergencies first, then by waiting time (longest first)
      if (b.isEmergency !== a.isEmergency) return (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0);
      return b.waitingMinutes - a.waitingMinutes;
    });

    res.json({ success: true, waitingPatients: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   CREATE PATIENT
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/reception/create-patient
 * Create new patient profile and generate credentials
 */
router.post('/create-patient', authMiddleware, sessionTimeout, requireRole('RECEPTION'), async (req, res) => {
  try {
    const {
      name, age, dob, phone, email, address, gender,
      dosha, language, medicalHistory, isEmergency, abha
    } = req.body;

    // Create patient record
    const patient = patientService.createPatient(
      {
        name, age, dob, phone, email, address, gender,
        dosha: dosha || 'Tridosha',
        preferredLanguage: language || 'en',
        medicalHistory,
        abha: abha || '',
        isEmergency: !!isEmergency,
        registrationType: 'NEW'
      },
      req.user.id,
      'RECEPTION'
    );

    // Auto-assign doctor (emergency → senior doctor, normal → least-load)
    let assignedDoctor;
    try {
      assignedDoctor = rosterService.assignDoctorByLoad(!!isEmergency);
      patientService.assignDoctor(patient.id, assignedDoctor.id, req.user.id);
    } catch (err) {
      console.warn('Doctor auto-assign failed:', err.message);
    }

    // Generate temp credentials for patient login
    const tempUsername = `pat_${patient.id.replace('p_', '').substring(0, 8)}`;
    const passwordUtils = require('../utils/passwordUtils');
    const tempPassword = passwordUtils.generateTempPassword();
    const passwordHash = await passwordUtils.hashPassword(tempPassword);

    const User = require('../models/User');
    const newUser = new User({
      username: tempUsername,
      passwordHash,
      name,
      role: 'PATIENT',
      contact: phone,
      email,
      language: language || 'en'
    });
    const savedUser = datastore.addUser(newUser);

    // Link patient to user account
    datastore.updatePatient(patient.id, { userId: savedUser.id });

    // Welcome notification
    notificationService.createNotification(
      savedUser.id,
      'WELCOME',
      'Welcome to AyurSutra',
      assignedDoctor
        ? `Welcome! You have been assigned to Dr. ${assignedDoctor.name} (${assignedDoctor.specialty}).`
        : 'Welcome to AyurSutra. Your doctor will be assigned shortly.',
      patient.id
    );

    // Emergency notification for doctor
    if (isEmergency && assignedDoctor) {
      notificationService.createNotification(
        assignedDoctor.id,
        'EMERGENCY',
        '🚨 Emergency Case',
        `Emergency patient ${name} has been assigned to you. Please attend immediately.`,
        patient.id
      );
    }

    auditLogger.createLog(
      req.user.id, 'RECEPTION', 'PATIENT_CREDENTIALS_GENERATED', patient.id,
      `Generated login credentials for patient ${name} (${tempUsername})`
    );

    res.json({
      success: true,
      patient: datastore.findPatientById(patient.id),
      credentials: {
        username: tempUsername,
        password: tempPassword,
        message: 'Patient must change password on first login'
      },
      assignedDoctor: assignedDoctor ? {
        id: assignedDoctor.id,
        name: assignedDoctor.name,
        specialty: assignedDoctor.specialty
      } : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   CHECK-IN
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/reception/check-in
 * Check in patient (marks as present, generates visit token)
 */
router.post('/check-in', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const patient = datastore.findPatientById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const visitToken = `VISIT_${Date.now()}_${patientId}`;
    const checkedInAt = new Date().toISOString();

    datastore.updatePatient(patientId, { visitToken, checkedInAt });

    auditLogger.createLog(
      req.user.id, 'RECEPTION', 'PATIENT_CHECKED_IN', patientId,
      `Patient ${patient.name} checked in at ${checkedInAt}`
    );

    // Notify assigned doctor
    if (patient.assignedDoctorId) {
      notificationService.createNotification(
        patient.assignedDoctorId,
        'PATIENT_CHECKED_IN',
        'Patient Checked In',
        `${patient.name} has checked in and is waiting to see you.${patient.isEmergency ? ' ⚠ EMERGENCY CASE' : ''}`,
        patientId
      );
    }

    res.json({
      success: true,
      patient: datastore.findPatientById(patientId),
      visitToken,
      checkedInAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   DOCTOR ASSIGNMENT
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/reception/assign-doctor
 * Manually assign doctor to patient
 */
router.post('/assign-doctor', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    if (!patientId || !doctorId) {
      return res.status(400).json({ error: 'patientId and doctorId are required' });
    }

    const patient = patientService.assignDoctor(patientId, doctorId, req.user.id);
    const doctor = datastore.findUserById(doctorId);

    res.json({
      success: true,
      patient,
      assignedDoctor: doctor ? doctor.toResponse() : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/reception/emergency-assign
 * Emergency assignment to senior doctor
 * body: { patientId, doctorId? } — if no doctorId, picks first available senior doctor
 */
router.post('/emergency-assign', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    if (!patientId) return res.status(400).json({ error: 'patientId is required' });

    const patient = datastore.findPatientById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Use provided doctorId or auto-select senior (first enabled doctor = senior for demo)
    let selectedDoctorId = doctorId;
    if (!selectedDoctorId) {
      const seniorDoctor = rosterService.assignDoctorByLoad(true);
      selectedDoctorId = seniorDoctor.id;
    }

    // Mark as emergency and assign
    datastore.updatePatient(patientId, { isEmergency: true });
    patientService.assignDoctor(patientId, selectedDoctorId, req.user.id);

    const assignedDoctor = datastore.findUserById(selectedDoctorId);

    // Priority notification to doctor
    notificationService.createNotification(
      selectedDoctorId,
      'EMERGENCY',
      '🚨 Emergency Case Assigned',
      `URGENT: Patient ${patient.name} has been assigned to you as an emergency case. Please attend immediately.`,
      patientId
    );

    auditLogger.createLog(
      req.user.id, 'RECEPTION', 'EMERGENCY_PATIENT_ASSIGNED', patientId,
      `Emergency patient ${patient.name} assigned to Dr. ${assignedDoctor ? assignedDoctor.name : selectedDoctorId}`
    );

    res.json({
      success: true,
      patient: datastore.findPatientById(patientId),
      assignedDoctor: assignedDoctor ? assignedDoctor.toResponse() : null,
      emergencyAlert: true
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   DOCTOR LOAD INFO
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/reception/doctors-load
 * Get doctors with current patient load
 */
router.get('/doctors-load', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const doctors = userService.getDoctorsWithLoad();
    res.json({ success: true, doctors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reception/emergency-doctors
 * Get available senior doctors for emergency routing
 */
router.get('/emergency-doctors', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);
    const enriched = doctors.map(d => ({
      ...d.toResponse(),
      patientLoad: datastore.getAllPatients(null, d.id).length
    }));
    // First doctor is senior-most for demo purposes
    res.json({ success: true, emergencyDoctors: enriched });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
