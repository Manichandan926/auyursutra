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
const datastore = require('../data/datastore');

/**
 * GET /api/practitioner/patients
 * Get patients assigned to this practitioner
 */
router.get('/patients', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const patients = patientService.listPatients({ practitionerId: req.user.id });
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/practitioner/session
 * Record therapy session progress
 */
router.post('/session', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const { therapyId, date, notes, progressPercent, vitals, attended, symptoms } = req.body;

    const session = therapyService.recordSession(
      therapyId,
      { date, notes, progressPercent, vitals, attended, symptoms },
      req.user.id
    );

    res.json({ success: true, session, message: 'Session progress recorded' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/practitioner/patient/:id/therapy
 * Get patient's therapy details
 */
router.get('/patient/:id/therapy', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    res.json({ success: true, progress });
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
    res.json({ success: true, sessions, count: sessions.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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

/**
 * GET /api/practitioner/dashboard
 * Practitioner dashboard
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('PRACTITIONER'), (req, res) => {
  try {
    const patients = patientService.listPatients({ practitionerId: req.user.id });
    const sessions = datastore.sessions.filter(s => s.practitionerId === req.user.id);
    const leaves = leaveService.getUserLeaves(req.user.id);

    const todayDate = new Date().toDateString();
    const todaySessions = sessions.filter(s => new Date(s.date).toDateString() === todayDate);

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

module.exports = router;
