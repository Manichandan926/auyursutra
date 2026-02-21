const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  sessionTimeout
} = require('../middleware/auth');
const patientService = require('../services/patientService');
const therapyService = require('../services/therapyService');
const leaveService = require('../services/leaveService');
const notificationService = require('../services/notificationService');
const datastore = require('../data/datastore');

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/doctor/dashboard
 * Doctor dashboard overview
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const patients = patientService.listPatients({ doctorId: req.user.id });
    const allTherapies = datastore.getAllTherapies
      ? datastore.getAllTherapies().filter(t => t.doctorId === req.user.id)
      : patients.flatMap(p => datastore.getPatientTherapies(p.id));
    const leaves = leaveService.getUserLeaves(req.user.id);

    const today = new Date().toDateString();
    const allSessions = datastore.getAllSessions ? datastore.getAllSessions() : [];
    const todaySessions = allSessions.filter(s => {
      const therapy = datastore.findTherapyById(s.therapyId);
      return therapy && therapy.doctorId === req.user.id
        && new Date(s.date).toDateString() === today;
    });

    const stats = {
      totalPatients: patients.length,
      activeTherapies: allTherapies.filter(t => t.status === 'ONGOING').length,
      scheduledTherapies: allTherapies.filter(t => t.status === 'SCHEDULED').length,
      completedTherapies: allTherapies.filter(t => t.status === 'COMPLETED').length,
      sessionsToday: todaySessions.length,
      pendingLeaves: leaves.filter(l => l.status === 'PENDING').length
    };

    res.json({ success: true, stats, patients, therapies: allTherapies });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   PATIENTS
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/doctor/patients
 * Get patients assigned to this doctor
 */
router.get('/patients', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const { search } = req.query;
    const patients = patientService.listPatients({ search, doctorId: req.user.id });

    const enriched = patients.map(p => {
      const therapies = therapyService.getPatientTherapies(p.id);
      return {
        ...p,
        therapiesCount: therapies.length,
        ongoingTherapies: therapies.filter(t => t.status === 'ONGOING').length
      };
    });

    res.json({ success: true, patients: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/doctor/patient/:id/profile
 * View full patient profile + therapy history
 */
router.get('/patient/:id/profile', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    const patient = progress.patient;
    const doctor = patient.assignedDoctorId ? datastore.findUserById(patient.assignedDoctorId) : null;
    const practitioner = patient.assignedPractitionerId ? datastore.findUserById(patient.assignedPractitionerId) : null;
    res.json({
      success: true,
      ...progress,
      assignedDoctor: doctor ? doctor.toResponse() : null,
      assignedPractitioner: practitioner ? practitioner.toResponse() : null
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * GET /api/doctor/patient/:id/progress
 * Get patient treatment progress (symptom trends, session history)
 */
router.get('/patient/:id/progress', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    res.json({ success: true, progress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   THERAPIES
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/doctor/assign-therapy
 * Doctor assigns therapy to patient
 */
router.post('/assign-therapy', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const therapy = therapyService.createTherapy(req.body, req.user.id);

    // Notify patient using their userId
    const patient = datastore.findPatientById(therapy.patientId);
    if (patient && patient.userId) {
      notificationService.notifyTherapyAssigned(patient.userId, {
        type: therapy.type,
        room: therapy.room,
        therapyId: therapy.id
      });
    }

    res.json({ success: true, therapy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/doctor/therapy/:id/sessions
 * View therapy sessions
 */
router.get('/therapy/:id/sessions', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const sessions = therapyService.getTherapySessions(req.params.id);
    res.json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/doctor/therapy/:id
 * Update therapy (e.g. reassign practitioner, change phase/room)
 */
router.patch('/therapy/:id', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const { primaryPractitionerId, phase, room, notes } = req.body;
    const updates = {};
    if (primaryPractitionerId !== undefined) updates.primaryPractitionerId = primaryPractitionerId;
    if (phase !== undefined) updates.phase = phase;
    if (room !== undefined) updates.room = room;
    if (notes !== undefined) updates.notes = notes;

    const therapy = datastore.updateTherapy(req.params.id, updates);
    if (!therapy) return res.status(404).json({ error: 'Therapy not found' });

    res.json({ success: true, therapy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/doctor/therapy/:id/complete
 * Mark therapy as completed
 */
router.post('/therapy/:id/complete', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const therapy = therapyService.completeTherapy(req.params.id, req.user.id);

    // Notify patient
    const patient = datastore.findPatientById(therapy.patientId);
    if (patient && patient.userId) {
      notificationService.createNotification(
        patient.userId, 'THERAPY_COMPLETED', 'Therapy Completed',
        `Your ${therapy.type} therapy has been marked as completed.`, therapy.id
      );
    }

    res.json({ success: true, therapy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   LEAVE
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/doctor/leave-request
 * Submit leave request
 */
router.post('/leave-request', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const leave = leaveService.submitLeaveRequest(req.body, req.user.id, 'DOCTOR');
    res.json({ success: true, leave, message: 'Leave request submitted for admin approval' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/doctor/leaves
 * Get doctor's leave requests
 */
router.get('/leaves', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const leaves = leaveService.getUserLeaves(req.user.id);
    res.json({ success: true, leaves, count: leaves.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/doctor/notifications
 * Get doctor's notifications
 */
router.get('/notifications', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = notificationService.getUserNotifications(req.user.id, unreadOnly === 'true');
    res.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/doctor/notifications/:id/read
 * Mark notification as read
 */
router.patch('/notifications/:id/read', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const notification = notificationService.markAsRead(req.params.id);
    res.json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
