const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  sessionTimeout
} = require('../middleware/auth');
const patientService = require('../services/patientService');
const therapyService = require('../services/therapyService');
const notificationService = require('../services/notificationService');
const datastore = require('../data/datastore');

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/patient/dashboard
 * Patient dashboard - uses userId linking (not fragile name match)
 */
router.get('/dashboard', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    // Look up patient by their linked userId (reliable)
    const patient = datastore.findPatientByUserId(req.user.id);

    if (!patient) {
      return res.status(404).json({
        error: 'Patient profile not found',
        hint: 'Your user account is not linked to a patient record. Contact reception.'
      });
    }

    const progress = patientService.getPatientProgress(patient.id);
    const notifications = notificationService.getUserNotifications(req.user.id);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Assigned doctor & practitioner details
    const doctor = patient.assignedDoctorId ? datastore.findUserById(patient.assignedDoctorId) : null;
    const practitioner = patient.assignedPractitionerId ? datastore.findUserById(patient.assignedPractitionerId) : null;

    res.json({
      success: true,
      patient,
      progress,
      assignedDoctor: doctor ? doctor.toResponse() : null,
      assignedPractitioner: practitioner ? practitioner.toResponse() : null,
      notifications: notifications.slice(0, 5),
      unreadNotifications: unreadCount,
      preferredLanguage: patient.preferredLanguage,
      doshaRecommendations: getDoshaRecommendations(patient.dosha)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/patient/profile
 * Get patient profile with assigned staff
 */
router.get('/profile', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patient = datastore.findPatientByUserId(req.user.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const doctor = patient.assignedDoctorId ? datastore.findUserById(patient.assignedDoctorId) : null;
    const practitioner = patient.assignedPractitionerId ? datastore.findUserById(patient.assignedPractitionerId) : null;

    res.json({
      success: true,
      patient,
      assignedDoctor: doctor ? doctor.toResponse() : null,
      assignedPractitioner: practitioner ? practitioner.toResponse() : null,
      doshaRecommendations: getDoshaRecommendations(patient.dosha)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   PROGRESS & THERAPIES
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/patient/progress
 * Get personal therapy progress with symptom trend data
 */
router.get('/progress', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patient = datastore.findPatientByUserId(req.user.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const progress = patientService.getPatientProgress(patient.id);

    // Build session trend data for charts
    const sessionTrend = [];
    progress.therapies.forEach(({ therapy, sessions }) => {
      sessions.forEach(session => {
        sessionTrend.push({
          date: session.date,
          progress: session.progressPercent,
          symptoms: session.symptoms || [],
          vitals: session.vitals,
          therapyType: therapy.type
        });
      });
    });

    sessionTrend.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      progress,
      sessionTrend,
      dosha: patient.dosha,
      doshaRecommendations: getDoshaRecommendations(patient.dosha)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   THERAPY CALENDAR
═══════════════════════════════════════════════════════════ */

/**
 * GET /api/patient/therapy-calendar
 * Get therapy schedule/calendar for the patient
 */
router.get('/therapy-calendar', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const patient = datastore.findPatientByUserId(req.user.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const therapies = therapyService.getPatientTherapies(patient.id);
    const allSessions = [];

    therapies.forEach(therapy => {
      const sessions = therapyService.getTherapySessions(therapy.id);
      sessions.forEach(s => allSessions.push({ ...s, therapyType: therapy.type }));
    });

    // Build calendar events
    const calendarEvents = therapies.map(therapy => {
      const endDate = therapy.endDate ||
        new Date(new Date(therapy.startDate).getTime() + therapy.durationDays * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: therapy.id,
        title: `${therapy.type} Therapy`,
        startDate: therapy.startDate,
        endDate,
        description: `${therapy.type} - Phase: ${therapy.phase} | Room: ${therapy.room || 'TBD'}`,
        location: therapy.room || 'TBD',
        status: therapy.status,
        phase: therapy.phase,
        progress: therapy.progressPercent || 0
      };
    });

    // Generate ICS content
    const icsContent = generateICS(calendarEvents, patient.name);

    res.json({
      success: true,
      therapies,
      calendar: calendarEvents,
      sessions: allSessions.sort((a, b) => new Date(a.date) - new Date(b.date)),
      icsContent
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   NOTIFICATIONS
═══════════════════════════════════════════════════════════ */

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
 * PATCH /api/patient/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/notifications/read-all', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    const notifications = notificationService.getUserNotifications(req.user.id, true);
    notifications.forEach(n => notificationService.markAsRead(n.id));
    res.json({ success: true, message: `Marked ${notifications.length} notifications as read` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/patient/complete-profile
 * Called by patients who have a login account but no linked patient record.
 * Creates a patient profile and links it to the authenticated user.
 */
router.post('/complete-profile', authMiddleware, sessionTimeout, requireRole('PATIENT'), (req, res) => {
  try {
    // Check if patient profile already exists for this user
    const existing = datastore.findPatientByUserId(req.user.id);
    if (existing) {
      return res.json({ success: true, patient: existing, message: 'Profile already exists' });
    }

    const { name, age, gender, dob, phone, email, address, dosha, emergencyContact, medicalHistory } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Get the users own name if not provided
    const user = datastore.findUserById(req.user.id);
    const Patient = require('../models/Patient');
    const { v4: uuidv4 } = require('uuid');

    const patient = new Patient({
      id: `p_${uuidv4().substring(0, 8)}`,
      userId: req.user.id,
      name: name || user?.name || req.user.name,
      age: age ? parseInt(age) : null,
      gender: gender || '',
      dob: dob || '',
      phone: phone || user?.contact || '',
      email: email || user?.email || '',
      address: address || '',
      dosha: dosha || '',
      emergencyContact: emergencyContact || '',
      medicalHistory: medicalHistory || '',
      registrationType: 'NEW',
    });

    datastore.addPatient(patient);

    // Also update user name if provided
    if (name && user && user.name !== name) {
      datastore.updateUser(req.user.id, { name });
    }

    const auditLogger = require('../utils/logger');
    auditLogger.createLog(
      req.user.id, 'PATIENT', 'PATIENT_PROFILE_COMPLETED', patient.id,
      `Patient ${name} completed their profile`
    );

    res.json({ success: true, patient, message: 'Profile created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
═══════════════════════════════════════════════════════════ */

/**
 * Get dosha-based wellness recommendations
 */
function getDoshaRecommendations(dosha) {
  const recommendations = {
    Vata: {
      type: 'Vata',
      tips: [
        'Maintain warm temperatures',
        'Eat warm, nourishing foods',
        'Establish a daily routine',
        'Practice grounding exercises',
        'Avoid cold and dry environments'
      ],
      herbs: ['Ashwagandha (calming)', 'Brahmi (grounding)', 'Sesame oil (warming)', 'Ghee'],
      diet: 'Warm, oily, sweet, sour, and salty foods. Avoid cold, raw, or dry foods.',
      lifestyle: 'Gentle yoga, warm oil massage (Abhyanga), regular sleep schedule'
    },
    Pitta: {
      type: 'Pitta',
      tips: [
        'Stay cool and calm',
        'Avoid excess heat and sunlight',
        'Practice calming activities',
        'Use cooling herbs',
        'Avoid spicy and fried foods'
      ],
      herbs: ['Brahmi (cooling)', 'Coconut oil', 'Licorice root', 'Coriander', 'Fennel'],
      diet: 'Sweet, bitter, and astringent foods. Avoid spicy, sour, and salty foods.',
      lifestyle: 'Swimming, moonlight walks, meditation, cooling pranayama'
    },
    Kapha: {
      type: 'Kapha',
      tips: [
        'Stay active and exercise regularly',
        'Warm and stimulating environment',
        'Avoid daytime napping',
        'Use invigorating herbs',
        'Avoid heavy, oily foods'
      ],
      herbs: ['Ginger (warming)', 'Turmeric', 'Black pepper', 'Trikatu', 'Guggul'],
      diet: 'Warm, light, dry, spicy foods. Avoid heavy, sweet, and oily foods.',
      lifestyle: 'Vigorous exercise, dry massage, stimulating pranayama'
    },
    Tridosha: {
      type: 'Tridosha',
      tips: [
        'Balance all three doshas',
        'Gentle, moderate activities',
        'Eat seasonally appropriate foods',
        'Maintain regular daily routine',
        'Practice all-dosha pranayama'
      ],
      herbs: ['Triphala (balancing)', 'Brahmi', 'Ashwagandha', 'Shatavari'],
      diet: 'Balanced, seasonal, fresh foods. Avoid extremes.',
      lifestyle: 'Moderate exercise, daily routine, yoga, meditation'
    }
  };

  return recommendations[dosha] || recommendations['Tridosha'];
}

/**
 * Generate ICS calendar content
 */
function generateICS(events, patientName) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AyurSutra//Therapy Calendar//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${patientName} Therapy Schedule`,
  ];

  events.forEach((event, i) => {
    const start = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(
      'BEGIN:VEVENT',
      `UID:ayursutra-${event.id}-${i}@ayursutra.com`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `STATUS:${event.status === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

module.exports = router;
