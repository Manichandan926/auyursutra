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
 * GET /api/practitioner/dashboard
 * Practitioner dashboard overview
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const patients = patientService.listPatients({ practitionerId: req.user.id });
    const sessions = datastore.getPractitionerSessions(req.user.id);
    const leaves = leaveService.getUserLeaves(req.user.id);

    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);

    const stats = {
      totalPatients: patients.length,
      sessionsToday: todaySessions.length,
      totalSessions: sessions.length,
      avgProgress: sessions.length > 0
        ? Math.round(sessions.reduce((sum, s) => sum + s.progressPercent, 0) / sessions.length)
        : 0,
      pendingLeaves: leaves.filter(l => l.status === 'PENDING').length
    };

    res.json({ success: true, stats, patients, todaySessions });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   PATIENTS
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/practitioner/patients
 * Get patients assigned to this practitioner
 */
router.get('/patients', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const patients = patientService.listPatients({ practitionerId: req.user.id });

    const enriched = patients.map(p => {
      const therapies = therapyService.getPatientTherapies(p.id);
      const ongoing = therapies.find(t => t.status === 'ONGOING' && t.primaryPractitionerId === req.user.id);
      return {
        ...p,
        therapiesCount: therapies.length,
        ongoingTherapy: ongoing || null
      };
    });

    res.json({ success: true, patients: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/practitioner/patient/:id/therapy
 * Get patient's therapy details and progress
 */
router.get('/patient/:id/therapy', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    res.json({ success: true, progress });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   SESSIONS
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/practitioner/session
 * Record therapy session progress
 * body: { therapyId, date, notes, progressPercent, vitals, attended, symptoms }
 */
router.post('/session', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const { therapyId, date, notes, progressPercent, vitals, attended, symptoms } = req.body;

    if (!therapyId) return res.status(400).json({ error: 'therapyId is required' });

    const session = therapyService.recordSession(
      therapyId,
      { date: date || new Date().toISOString(), notes, progressPercent, vitals, attended, symptoms },
      req.user.id
    );

    // Get updated therapy for progress info
    const therapy = datastore.findTherapyById(therapyId);

    // Notify patient of session completion
    const patient = therapy ? datastore.findPatientById(therapy.patientId) : null;
    if (patient && patient.userId) {
      notificationService.createNotification(
        patient.userId,
        'SESSION_COMPLETED',
        'Session Completed',
        `Your therapy session (${therapy.type}) has been recorded. Progress: ${therapy.progressPercent || 0}%`,
        therapyId
      );
    }

    res.json({
      success: true,
      session,
      updatedTherapy: therapy,
      message: 'Session progress recorded'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/practitioner/therapy/:id/sessions
 * Get therapy sessions
 */
router.get('/therapy/:id/sessions', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const sessions = therapyService.getTherapySessions(req.params.id);
    const therapy = datastore.findTherapyById(req.params.id);
    res.json({ success: true, sessions, count: sessions.length, therapy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/practitioner/sessions/today
 * Get today's sessions for this practitioner
 */
router.get('/sessions/today', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const sessions = datastore.getPractitionerSessions(req.user.id);
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === today);

    const enriched = todaySessions.map(s => {
      const patient = datastore.findPatientById(s.patientId);
      const therapy = datastore.findTherapyById(s.therapyId);
      return { ...s, patient, therapy };
    });

    res.json({ success: true, sessions: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   LEAVE
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/practitioner/leave-request
 * Submit leave request
 */
router.post('/leave-request', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const leave = leaveService.submitLeaveRequest(req.body, req.user.id, 'PRACTITIONER');
    res.json({ success: true, leave, message: 'Leave request submitted for admin approval' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/practitioner/leaves
 * Get practitioner's leave requests
 */
router.get('/leaves', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
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
 * GET /api/practitioner/notifications
 * Get notifications
 */
router.get('/notifications', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = notificationService.getUserNotifications(req.user.id, unreadOnly === 'true');
    res.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/practitioner/notifications/:id/read
 * Mark notification as read
 */
router.patch('/notifications/:id/read', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const notification = notificationService.markAsRead(req.params.id);
    res.json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
