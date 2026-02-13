const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  optionalAuth,
  sessionTimeout
} = require('../middleware/auth');
const patientService = require('../services/patientService');
const userService = require('../services/userService');
const rosterService = require('../services/rosterService');
const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');

/**
 * GET /api/reception/patients-search
 * Search for existing patients
 */
router.get('/patients-search', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { search } = req.query;
    const patients = patientService.listPatients({ search });
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reception/waiting-list
 * Get current waiting patients
 */
router.get('/waiting-list', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const patients = datastore.patients;
    // Filter patients created today or with no assigned doctor
    const waitingPatients = patients.filter(p => !p.assignedDoctorId);

    const enriched = waitingPatients.map(p => {
      const therapies = datastore.getPatientTherapies(p.id);
      return {
        ...p,
        waitingMinutes: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 60000),
        isEmergency: p.medicalHistory && p.medicalHistory.toLowerCase().includes('emergency')
      };
    }).sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0));

    res.json({ success: true, waitingPatients: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/reception/create-patient
 * Create new patient profile and generate credentials
 */
router.post('/create-patient', authMiddleware, sessionTimeout, requireRole('RECEPTION'), async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      email,
      address,
      gender,
      dosha,
      language,
      medicalHistory,
      isEmergency
    } = req.body;

    // Create patient
    const patient = patientService.createPatient(
      {
        name,
        age,
        phone,
        email,
        address,
        gender,
        dosha: dosha || 'Tridosha',
        preferredLanguage: language || 'en',
        medicalHistory,
        registrationType: 'NEW'
      },
      req.user.id,
      'RECEPTION'
    );

    // Auto-assign doctor
    const assignedDoctor = rosterService.assignDoctorByLoad(isEmergency === true);
    patientService.assignDoctor(patient.id, assignedDoctor.id, req.user.id);

    // Generate temporary username and password
    const tempUsername = `pat_${patient.id.substring(0, 8)}`;
    const passwordUtils = require('../utils/passwordUtils');
    const tempPassword = passwordUtils.generateTempPassword();

    // Create user account
    const User = require('../models/User');
    const passwordHash = await passwordUtils.hashPassword(tempPassword);
    const user = new User({
      username: tempUsername,
      passwordHash,
      name,
      role: 'PATIENT',
      contact: phone,
      email,
      language: language || 'en'
    });

    datastore.addUser(user);

    auditLogger.createLog(
      req.user.id,
      'RECEPTION',
      'PATIENT_CREDENTIALS_GENERATED',
      patient.id,
      `Generated login credentials for patient ${name}`
    );

    res.json({
      success: true,
      patient,
      credentials: {
        username: tempUsername,
        password: tempPassword,
        message: 'Patient must change password on first login'
      },
      assignedDoctor: {
        id: assignedDoctor.id,
        name: assignedDoctor.name,
        specialty: assignedDoctor.specialty
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/reception/assign-doctor
 * Manually assign doctor to patient
 */
router.post('/assign-doctor', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { patientId, doctorId } = req.body;
    const patient = patientService.assignDoctor(patientId, doctorId, req.user.id);
    res.json({ success: true, patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
 * POST /api/reception/check-in
 * Check in patient (marks as present)
 */
router.post('/check-in', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const { patientId } = req.body;
    const patient = datastore.findPatientById(patientId);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const visitToken = `VISIT_${Date.now()}_${patientId}`;

    auditLogger.createLog(
      req.user.id,
      'RECEPTION',
      'PATIENT_CHECKED_IN',
      patientId,
      `Patient ${patient.name} checked in`
    );

    res.json({
      success: true,
      patient,
      visitToken,
      checkedInAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reception/emergency-doctors
 * Get senior doctors available for emergency
 */
router.get('/emergency-doctors', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);
    // In production, would sort by seniority/experience
    res.json({ success: true, emergencyDoctors: doctors.map(d => d.toResponse()) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reception/dashboard
 * Reception dashboard
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('RECEPTION'), (req, res) => {
  try {
    const patients = datastore.patients;
    const waitingPatients = patients.filter(p => !p.assignedDoctorId);
    const checkedInToday = patients.filter(p => {
      const dateStr = new Date(p.createdAt).toDateString();
      return dateStr === new Date().toDateString();
    }).length;

    const stats = {
      totalPatients: patients.length,
      waitingPatients: waitingPatients.length,
      checkedInToday,
      emergencyCases: patients.filter(p => p.medicalHistory && p.medicalHistory.toLowerCase().includes('emergency')).length
    };

    res.json({ success: true, stats, waitingPatients });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
