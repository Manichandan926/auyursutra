const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  sessionTimeout
} = require('../middleware/auth');
const notificationService = require('../services/notificationService');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  const datastore = require('../data/datastore');
  const auditLogger = require('../utils/logger');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    data: {
      users: datastore.users.length,
      patients: datastore.patients.length,
      therapies: datastore.therapies.length,
      sessions: datastore.sessions.length,
      leaves: datastore.leaves.length,
      notifications: datastore.notifications.length,
      auditLogs: auditLogger.logs.length
    },
    logIntegrity: auditLogger.verifyIntegrity().valid ? 'VERIFIED' : 'TAMPERED'
  };

  res.json(health);
});

/**
 * GET /api/notifications
 * Get user notifications (authenticated)
 */
router.get('/notifications', authMiddleware, sessionTimeout, (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = notificationService.getUserNotifications(req.user.id, unreadOnly === 'true');
    res.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/export-data
 * Export clinic data as JSON (admin only)
 */
router.post('/export-data', authMiddleware, sessionTimeout, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can export data' });
    }

    const datastore = require('../data/datastore');
    const exportData = datastore.export();

    res.json({
      success: true,
      message: 'Clinic data exported',
      timestamp: new Date().toISOString(),
      data: exportData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/import-data
 * Import clinic data from JSON backup (admin only)
 */
router.post('/import-data', authMiddleware, sessionTimeout, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can import data' });
    }

    const { data } = req.body;
    const datastore = require('../data/datastore');
    const auditLogger = require('../utils/logger');

    datastore.import(data);

    auditLogger.createLog(
      req.user.id,
      'ADMIN',
      'DATA_IMPORTED',
      null,
      'Clinic data imported from backup'
    );

    res.json({ success: true, message: 'Data imported successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:id/export-pdf
 * Export patient therapy summary (PDF placeholder)
 */
router.get('/patient/:id/export-pdf', authMiddleware, sessionTimeout, (req, res) => {
  try {
    const patientService = require('../services/patientService');
    const progress = patientService.getPatientProgress(req.params.id);

    // In production, use pdfkit or similar
    const pdfPlaceholder = {
      format: 'PDF',
      title: `Patient Therapy Summary - ${progress.patient.name}`,
      patientId: progress.patient.id,
      generatedAt: new Date().toISOString(),
      summary: {
        dosha: progress.patient.dosha,
        preferredLanguage: progress.patient.preferredLanguage,
        therapies: progress.therapies.map(t => ({
          type: t.therapy.type,
          phase: t.therapy.phase,
          progress: t.avgProgress,
          sessions: t.sessionCount
        })),
        overallProgress: progress.overallProgress
      },
      note: 'In production, this would be a real PDF file'
    };

    res.json({
      success: true,
      message: 'PDF export prepared',
      pdf: pdfPlaceholder
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/reports/clinic-metrics
 * Get admin analytics KPIs (admin only)
 */
router.get('/reports/clinic-metrics', authMiddleware, sessionTimeout, (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admin can view reports' });
    }

    const datastore = require('../data/datastore');
    const therapyService = require('../services/therapyService');

    const patients = datastore.patients;
    const therapies = datastore.therapies;
    const sessions = datastore.sessions;
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);
    const practitioners = datastore.getAllUsers('PRACTITIONER').filter(p => p.enabled);

    // Calculate KPIs
    const avgWaitTime = patients.length > 0
      ? Math.round(patients.reduce((sum, p) => {
        const wait = (Date.now() - new Date(p.createdAt).getTime()) / 60000;
        return sum + wait;
      }, 0) / patients.length)
      : 0;

    const roomUtilization = {};
    therapies.forEach(t => {
      if (!roomUtilization[t.room]) {
        roomUtilization[t.room] = 0;
      }
      roomUtilization[t.room]++;
    });

    const successRate = therapies.filter(t => t.status === 'COMPLETED').length > 0
      ? Math.round((therapies.filter(t => t.status === 'COMPLETED' && t.progressPercent === 100).length /
        therapies.filter(t => t.status === 'COMPLETED').length) * 100)
      : 0;

    const complaintCategories = {};
    sessions.forEach(s => {
      if (s.symptoms && s.symptoms.length > 0) {
        s.symptoms.forEach(symptom => {
          complaintCategories[symptom] = (complaintCategories[symptom] || 0) + 1;
        });
      }
    });

    const topComplaints = Object.entries(complaintCategories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([complaint, count]) => ({ complaint, count }));

    res.json({
      success: true,
      metrics: {
        timestamp: new Date().toISOString(),
        patients: {
          total: patients.length,
          newToday: patients.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString()).length,
          avgWaitTimeMinutes: avgWaitTime
        },
        therapies: {
          total: therapies.length,
          ongoing: therapies.filter(t => t.status === 'ONGOING').length,
          completed: therapies.filter(t => t.status === 'COMPLETED').length,
          successRate: `${successRate}%`
        },
        sessions: {
          total: sessions.length,
          today: sessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length
        },
        staffLoad: {
          doctors: doctors.length,
          avgPatientsPerDoctor: doctors.length > 0
            ? Math.round(patients.filter(p => p.assignedDoctorId).length / doctors.length)
            : 0,
          practitioners: practitioners.length,
          avgPatientsPerPractitioner: practitioners.length > 0
            ? Math.round(patients.filter(p => p.assignedPractitionerId).length / practitioners.length)
            : 0
        },
        utilization: {
          roomUtilization,
          avgSessionsPerDay: Math.round(sessions.length / 30) // rough estimate
        },
        topComplaints
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
