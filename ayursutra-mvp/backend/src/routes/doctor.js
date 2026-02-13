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
 * POST /api/doctor/assign-therapy
 * Doctor assigns therapy to patient
 */
router.post('/assign-therapy', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const therapy = therapyService.createTherapy(req.body, req.user.id);

    // Notify patient
    notificationService.notifyTherapyAssigned(therapy.patientId, {
      type: therapy.type,
      room: therapy.room,
      therapyId: therapy.id
    });

    res.json({ success: true, therapy });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/doctor/patient/:id/progress
 * Get patient treatment progress
 */
router.get('/patient/:id/progress', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    res.json({ success: true, progress });
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

/**
 * GET /api/doctor/dashboard
 * Doctor dashboard
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('DOCTOR'), (req, res) => {
  try {
    const patients = patientService.listPatients({ doctorId: req.user.id });
    const therapies = datastore.therapies.filter(t => t.doctorId === req.user.id);
    const leaves = leaveService.getUserLeaves(req.user.id);

    const stats = {
      totalPatients: patients.length,
      activeTherapies: therapies.filter(t => t.status === 'ONGOING').length,
      completedTherapies: therapies.filter(t => t.status === 'COMPLETED').length,
      pendingLeaves: leaves.filter(l => l.status === 'PENDING').length
    };

    res.json({ success: true, stats, patients, therapies });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
