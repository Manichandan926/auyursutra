const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  optionalAuth,
  sessionTimeout
} = require('../middleware/auth');
const patientService = require('../services/patientService');
const therapyService = require('../services/therapyService');
const notificationService = require('../services/notificationService');
const datastore = require('../data/datastore');

/**
 * GET /api/patient/dashboard
 * Patient dashboard with therapy info
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    // Get patient profile from user ID
    // In real system, would have Patient.userId mapping
    const patients = datastore.patients;
    const patient = patients.find(p => {
      const user = datastore.findUserById(req.user.id);
      return p.name === user.name; // Simple matching for demo
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const progress = patientService.getPatientProgress(patient.id);
    const notifications = notificationService.getUserNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      success: true,
      patient,
      progress,
      notifications: notifications.slice(0, 5),
      unreadNotifications: unreadCount,
      preferredLanguage: patient.preferredLanguage
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/therapy-calendar
 * Get therapy schedule/calendar
 */
router.get('/therapy-calendar', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patients = datastore.patients;
    const patient = patients.find(p => p.name === datastore.findUserById(req.user.id).name);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const therapies = therapyService.getPatientTherapies(patient.id);
    const sessions = [];

    therapies.forEach(therapy => {
      const therapySessions = therapyService.getTherapySessions(therapy.id);
      sessions.push(...therapySessions);
    });

    // Generate ICS format for calendar
    const calendarEvents = therapies.map(therapy => ({
      id: therapy.id,
      title: therapy.type,
      startDate: therapy.startDate,
      endDate: therapy.endDate || new Date(new Date(therapy.startDate).getTime() + therapy.durationDays * 24 * 60 * 60 * 1000),
      description: `${therapy.type} therapy - Room ${therapy.room}`,
      location: therapy.room
    }));

    res.json({
      success: true,
      therapies,
      calendar: calendarEvents,
      sessions: sessions.sort((a, b) => new Date(a.date) - new Date(b.date))
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/progress
 * Get personal therapy progress
 */
router.get('/progress', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patients = datastore.patients;
    const patient = patients.find(p => p.name === datastore.findUserById(req.user.id).name);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const progress = patientService.getPatientProgress(patient.id);

    // Add symptom trending data
    const therapies = therapyService.getPatientTherapies(patient.id);
    const sessionTrend = [];

    therapies.forEach(therapy => {
      const sessions = therapyService.getTherapySessions(therapy.id);
      sessions.forEach(session => {
        sessionTrend.push({
          date: session.date,
          progress: session.progressPercent,
          symptoms: session.symptoms || [],
          vitals: session.vitals
        });
      });
    });

    res.json({
      success: true,
      progress,
      sessionTrend: sessionTrend.sort((a, b) => new Date(a.date) - new Date(b.date)),
      dosha: patient.dosha,
      doshaRecommendations: getDoshaRecommendations(patient.dosha)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/notifications
 * Get patient notifications
 */
router.get('/notifications', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = notificationService.getUserNotifications(req.user.id, unreadOnly === 'true');
    res.json({ success: true, notifications, count: notifications.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/patient/notifications/:id/read
 * Mark notification as read
 */
router.patch('/notifications/:id/read', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const notification = notificationService.markAsRead(req.params.id);
    res.json({ success: true, notification });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/profile
 * Get patient profile
 */
router.get('/profile', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patients = datastore.patients;
    const patient = patients.find(p => p.name === datastore.findUserById(req.user.id).name);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const doctor = patient.assignedDoctorId ? datastore.findUserById(patient.assignedDoctorId) : null;
    const practitioner = patient.assignedPractitionerId ? datastore.findUserById(patient.assignedPractitionerId) : null;

    res.json({
      success: true,
      patient,
      assignedDoctor: doctor ? doctor.toResponse() : null,
      assignedPractitioner: practitioner ? practitioner.toResponse() : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Helper: Get dosha-based recommendations
 */
function getDoshaRecommendations(dosha) {
  const recommendations = {
    Vata: {
      tips: ['Stay warm and grounded', 'Maintain regular routine', 'Use calming herbs like Ashwagandha'],
      herbs: ['Ashwagandha', 'Sesame oil', 'Ghee'],
      diet: 'Warm, nourishing foods'
    },
    Pitta: {
      tips: ['Cool and calm environment', 'Avoid excess heat', 'Use cooling herbs like Brahmi'],
      herbs: ['Brahmi', 'Coconut oil', 'Licorice'],
      diet: 'Cooling, hydrating foods'
    },
    Kapha: {
      tips: ['Stay active', 'Warm and stimulating environment', 'Use invigorating herbs like Ginger'],
      herbs: ['Ginger', 'Turmeric', 'Black pepper'],
      diet: 'Light, stimulating foods'
    },
    Tridosha: {
      tips: ['Balance all three doshas', 'Gentle movement', 'Harmonizing herbs'],
      herbs: ['Triphala', 'Brahmi', 'Ashwagandha'],
      diet: 'Balanced, seasonal diet'
    }
  };

  return recommendations[dosha] || recommendations['Tridosha'];
}

module.exports = router;
