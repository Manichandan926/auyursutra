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

/* ═══════════════════════════════════════════════════════════
   USER MANAGEMENT
═══════════════════════════════════════════════════════════ */

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
 * DELETE /api/admin/users/:id
 * Soft-delete a user (disable + mark deleted flag)
 */
router.delete('/users/:id', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const user = datastore.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Soft-delete: mark as disabled and deleted
    datastore.updateUser(req.params.id, { enabled: false, deleted: true });

    auditLogger.createLog(
      req.user.id, 'ADMIN', 'USER_DELETED', req.params.id,
      `Admin deleted user ${user.name} (${user.role})`
    );

    res.json({ success: true, message: `User ${user.name} has been deleted` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


/**
 * PATCH /api/admin/users/:id/password
 * Admin changes a user's password
 */
router.patch('/users/:id/password', authMiddleware, sessionTimeout, requireRole('ADMIN'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const user = await userService.changePassword(req.params.id, newPassword, req.user.id);
    res.json({ success: true, message: 'Password updated', userId: user.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Soft-delete a user (sets enabled: false and marks deleted)
 */
router.delete('/users/:id', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    userService.deleteUser(req.params.id, req.user.id);
    res.json({ success: true, message: 'User disabled/deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   AUDIT LOGS
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/admin/logs
 * View audit logs (read-only, filterable)
 */
router.get('/logs', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    const logs = auditLogger.getLogs({ userId, action, startDate, endDate });
    const integrity = auditLogger.verifyIntegrity();

    res.json({
      success: true,
      logs,
      count: logs.length,
      integrity: {
        valid: integrity.valid,
        message: integrity.valid
          ? `✓ All ${logs.length} logs verified. No tampering detected.`
          : `⚠ Log integrity check failed: ${integrity.message}`
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/logs/verify
 * Explicitly verify log chain integrity
 */
router.get('/logs/verify', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const integrity = auditLogger.verifyIntegrity();
    const logs = auditLogger.getLogs({});
    res.json({
      success: true,
      valid: integrity.valid,
      totalLogs: logs.length,
      message: integrity.valid
        ? `✓ All ${logs.length} logs verified. No tampering detected.`
        : `⚠ ${integrity.message}`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   DASHBOARD METRICS
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/admin/dashboard/overview
 * Get admin dashboard KPI metrics
 */
router.get('/dashboard/overview', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const patients = datastore.getAllPatients();
    const therapies = datastore.getAllTherapies ? datastore.getAllTherapies() : [];
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);
    const practitioners = datastore.getAllUsers('PRACTITIONER').filter(p => p.enabled);
    const pendingLeaves = leaveService.getPendingLeaves();

    const today = new Date().toDateString();

    // Session counts — query DB directly
    const allSessions = datastore.getAllSessions ? datastore.getAllSessions() : [];
    const sessionToday = allSessions.filter(s => new Date(s.date).toDateString() === today).length;

    const ongoingTherapies = therapies.filter(t => t.status === 'ONGOING').length;
    const completedTherapies = therapies.filter(t => t.status === 'COMPLETED').length;
    const successRate = (completedTherapies + ongoingTherapies) > 0
      ? Math.round((completedTherapies / (completedTherapies + ongoingTherapies)) * 100)
      : 0;

    const avgDocLoad = doctors.length > 0
      ? Math.round(patients.filter(p => p.assignedDoctorId).length / doctors.length)
      : 0;

    const avgPracLoad = practitioners.length > 0
      ? Math.round(patients.filter(p => p.assignedPractitionerId).length / practitioners.length)
      : 0;

    res.json({
      success: true,
      metrics: {
        totalPatients: patients.length,
        totalDoctors: doctors.length,
        totalPractitioners: practitioners.length,
        ongoingTherapies,
        completedTherapies,
        scheduledTherapies: therapies.filter(t => t.status === 'SCHEDULED').length,
        successRate,
        avgDocLoad,
        avgPracLoad,
        pendingLeaveRequests: pendingLeaves.length,
        sessionToday,
        checkedInToday: patients.filter(p =>
          p.checkedInAt && new Date(p.checkedInAt).toDateString() === today
        ).length,
        emergencyCases: patients.filter(p => p.isEmergency).length
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   LEAVE MANAGEMENT
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/admin/leaves
 * Get all leave requests (all statuses)
 */
router.get('/leaves', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { status } = req.query;
    let leaves = status === 'pending'
      ? leaveService.getPendingLeaves()
      : datastore.getAllLeaves ? datastore.getAllLeaves() : leaveService.getPendingLeaves();

    // Enrich with user names
    const enriched = leaves.map(l => {
      const user = datastore.findUserById(l.userId);
      return {
        ...l,
        userName: user ? user.name : 'Unknown',
        userRole: l.userRole || (user ? user.role : ''),
        patientLoad: user
          ? datastore.getAllPatients(null, null, l.userId).length
          : 0
      };
    });

    res.json({ success: true, leaves: enriched, count: enriched.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/admin/leave/approve
 * Approve leave request (legacy route kept for compatibility)
 */
router.post('/leave/approve', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { leaveId } = req.body;
    const leave = leaveService.approveLeave(leaveId, req.user.id);

    notificationService.notifyLeaveApproved(leave.userId, {
      fromDate: leave.fromDate,
      toDate: leave.toDate,
      leaveId
    });

    // Auto-reassign patients if practitioner leave
    if (leave.userRole === 'PRACTITIONER') {
      try {
        const result = rosterService.autoAssignOnLeave(leave.userId);
        auditLogger.createLog(req.user.id, 'ADMIN', 'LEAVE_AUTO_REASSIGNED', leaveId,
          `Auto-reassigned ${result.reassigned.length} patients from ${leave.userId}`);
      } catch (err) {
        console.warn('Auto-assign failed:', err.message);
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
 * PATCH /api/admin/leaves/:id
 * RESTful approve/reject leave
 * body: { action: 'approve'|'reject', reason? }
 */
router.patch('/leaves/:id', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { action, reason } = req.body;
    const leaveId = req.params.id;

    let leave;
    if (action === 'approve') {
      leave = leaveService.approveLeave(leaveId, req.user.id);
      notificationService.notifyLeaveApproved(leave.userId, {
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        leaveId
      });
      if (leave.userRole === 'PRACTITIONER') {
        try {
          const result = rosterService.autoAssignOnLeave(leave.userId);
          auditLogger.createLog(req.user.id, 'ADMIN', 'LEAVE_AUTO_REASSIGNED', leaveId,
            `Auto-reassigned ${result.reassigned.length} patients`);
        } catch (err) {
          console.warn('Auto-assign failed:', err.message);
        }
      }
    } else if (action === 'reject') {
      leave = leaveService.rejectLeave(leaveId, reason || 'Rejected', req.user.id);
      notificationService.notifyLeaveRejected(leave.userId, {
        fromDate: leave.fromDate,
        toDate: leave.toDate,
        leaveId
      });
    } else {
      return res.status(400).json({ error: 'action must be "approve" or "reject"' });
    }

    res.json({ success: true, leave });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   ROSTER / REASSIGNMENT
═══════════════════════════════════════════════════════════ */

/**
 * POST /api/admin/practitioner/reassign
 * Manually reassign practitioner for a patient
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
 * POST /api/admin/roster/auto-assign
 * Manually trigger auto-assignment for a user on leave
 */
router.post('/roster/auto-assign', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const result = rosterService.autoAssignOnLeave(userId);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/roster/on-call
 * Get on-call staff for a date
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

/* ═══════════════════════════════════════════════════════════
   PATIENTS (Admin view all)
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/admin/patients
 * List all patients
 */
router.get('/patients', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const { search } = req.query;
    const patients = patientService.listPatients({ search });
    res.json({ success: true, patients, count: patients.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/admin/patients/:id
 * Get specific patient (admin)
 */
router.get('/patients/:id', authMiddleware, sessionTimeout, requireRole('ADMIN'), (req, res) => {
  try {
    const progress = patientService.getPatientProgress(req.params.id);
    res.json({ success: true, ...progress });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
