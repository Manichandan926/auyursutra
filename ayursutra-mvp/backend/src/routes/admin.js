const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  sessionTimeout
} = require('../middleware/auth');
const userService = require('../services/userService');
const patientService = require('../services/patientService');
const leaveService = require('../services/leaveService');
const therapyService = require('../services/therapyService');
const notificationService = require('../services/notificationService');
const rosterService = require('../services/rosterService');
const auditLogger = require('../utils/logger');
const datastore = require('../data/datastore');

/**
 * POST /api/admin/users
 * Create new user (doctor, practitioner, reception)
 */
router.post('/users', authMiddleware, sessionTimeout, requireRole('ADMIN'), async (req, res) => {
  try {
    const user = await userService.createUser(req.body, req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users
 * List all users with optional role filter
 */
router.get('/users', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { role } = req.query;
    const users = userService.listUsers(role);
    res.json({ success: true, users, count: users.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Enable/disable user
 */
router.patch('/users/:id', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { enabled } = req.body;
    const user = userService.toggleUser(req.params.id, enabled, req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/logs
 * View audit logs (read-only)
 */
router.get('/logs', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    const logs = auditLogger.getLogs({ userId, action, startDate, endDate });

    // Verify integrity
    const integrity = auditLogger.verifyIntegrity();

    res.json({
      success: true,
      logs,
      count: logs.length,
      integrity: {
        valid: integrity.valid,
        message: integrity.valid ? 'All logs verified' : integrity.message
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/dashboard/overview
 * Get admin dashboard metrics
 */
router.get('/dashboard/overview', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const patients = datastore.patients;
    const therapies = datastore.therapies;
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);
    const practitioners = datastore.getAllUsers('PRACTITIONER').filter(p => p.enabled);
    const pendingLeaves = leaveService.getPendingLeaves();
    const sessions = datastore.sessions;

    // Calculate metrics
    const totalPatients = patients.length;
    const ongoingTherapies = therapies.filter(t => t.status === 'ONGOING').length;
    const completedTherapies = therapies.filter(t => t.status === 'COMPLETED').length;
    const successRate = completedTherapies > 0
      ? Math.round((therapies.filter(t => t.status === 'COMPLETED' && t.progressPercent === 100).length / completedTherapies) * 100)
      : 0;

    const avgDocLoad = doctors.length > 0
      ? Math.round(patients.filter(p => p.assignedDoctorId).length / doctors.length)
      : 0;

    const avgPracLoad = practitioners.length > 0
      ? Math.round(patients.filter(p => p.assignedPractitionerId).length / practitioners.length)
      : 0;

    const sessionToday = sessions.filter(s => {
      const sessionDate = new Date(s.date).toDateString();
      const today = new Date().toDateString();
      return sessionDate === today;
    }).length;

    res.json({
      success: true,
      metrics: {
        totalPatients,
        totalDoctors: doctors.length,
        totalPractitioners: practitioners.length,
        ongoingTherapies,
        completedTherapies,
        successRate,
        avgDocLoad,
        avgPracLoad,
        pendingLeaveRequests: pendingLeaves.length,
        sessionToday
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/leave/approve
 * Approve leave request
 */
router.post('/leave/approve', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { leaveId } = req.body;
    const leave = leaveService.approveLeave(leaveId, req.user.id);

    // Notify user
    notificationService.notifyLeaveApproved(leave.userId, {
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      leaveId
    });

    // Auto-reassign if required
    if (leave.userRole === 'PRACTITIONER' && leave.emergencyCoverRequired) {
      try {
        rosterService.autoAssignOnLeave(leave.userId);
      } catch (error) {
        console.log('Auto-assign failed:', error.message);
      }
    }

    res.json({ success: true, leave });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/leave/reject
 * Reject leave request
 */
router.post('/leave/reject', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { leaveId, reason } = req.body;
    const leave = leaveService.rejectLeave(leaveId, reason, req.user.id);

    notificationService.notifyLeaveRejected(leave.userId, {
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      leaveId
    });

    res.json({ success: true, leave });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/leaves
 * Get pending leave requests
 */
router.get('/leaves', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const leaves = leaveService.getPendingLeaves();
    res.json({ success: true, leaves, count: leaves.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/practitioner/reassign
 * Reassign practitioner for a patient
 */
router.post('/practitioner/reassign', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { patientId, newPractitionerId } = req.body;
    const patient = patientService.reassignPractitioner(patientId, newPractitionerId, req.user.id);
    res.json({ success: true, patient });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/roster/on-call
 * Get on-call staff
 */
router.get('/roster/on-call', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { date } = req.query;
    const roster = rosterService.getOnCallRoster(date);
    res.json({ success: true, roster });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
