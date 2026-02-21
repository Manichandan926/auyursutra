const Therapy = require('../models/Therapy');
const Session = require('../models/Session');
const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');

class TherapyService {
  /**
   * Create therapy plan (doctor assigns)
   */
  createTherapy(data, doctorId) {
    const therapy = new Therapy({
      ...data,
      doctorId,
      status: 'SCHEDULED'
    });

    datastore.addTherapy(therapy);

    auditLogger.createLog(
      doctorId,
      'DOCTOR',
      'THERAPY_ASSIGNED',
      therapy.id,
      `Assigned therapy to patient ${data.patientId}`
    );

    return therapy;
  }

  /**
   * Get therapy by ID
   */
  getTherapy(therapyId) {
    const therapy = datastore.findTherapyById(therapyId);
    if (!therapy) {
      throw new Error('Therapy not found');
    }
    return therapy;
  }

  /**
   * Record session progress (practitioner)
   */
  recordSession(therapyId, sessionData, practitionerId) {
    const therapy = this.getTherapy(therapyId);

    const session = new Session({
      ...sessionData,
      therapyId,
      patientId: therapy.patientId,
      practitionerId
    });

    datastore.addSession(session);

    // Update therapy progress (average of all sessions)
    const allSessions = datastore.getTherapySessions(therapyId);
    const avgProgress = Math.round(
      allSessions.reduce((sum, s) => sum + s.progressPercent, 0) / allSessions.length
    );

    // ── THERAPY STATE MACHINE ─────────────────────────────────────────────────
    // SCHEDULED → ONGOING when first session is recorded
    // ONGOING   → COMPLETED when average progress reaches 100%
    let newStatus = therapy.status;
    if (therapy.status === 'SCHEDULED') {
      newStatus = 'ONGOING';
    }
    if (avgProgress >= 100 && therapy.status !== 'COMPLETED') {
      newStatus = 'COMPLETED';
    }

    const updatedTherapy = datastore.updateTherapy(therapyId, {
      progressPercent: avgProgress,
      status: newStatus,
      endDate: newStatus === 'COMPLETED' ? new Date().toISOString() : therapy.endDate
    });

    auditLogger.createLog(
      practitionerId,
      'PRACTITIONER',
      'SESSION_RECORDED',
      therapy.id,
      `Recorded session for patient ${therapy.patientId}; therapy progress: ${avgProgress}%${newStatus === 'COMPLETED' ? ' [COMPLETED]' : ''}`
    );

    return session;
  }

  /**
   * Get therapy sessions
   */
  getTherapySessions(therapyId) {
    return datastore.getTherapySessions(therapyId);
  }

  /**
   * Reassign practitioner for therapy (doctor/admin)
   */
  reassignPractitioner(therapyId, newPractitionerId, reassignedById) {
    const therapy = datastore.updateTherapy(therapyId, {
      primaryPractitionerId: newPractitionerId
    });

    if (!therapy) {
      throw new Error('Therapy not found');
    }

    auditLogger.createLog(
      reassignedById,
      'ADMIN',
      'THERAPY_PRACTITIONER_REASSIGNED',
      therapyId,
      `Reassigned practitioner for therapy`
    );

    return therapy;
  }

  /**
   * Complete therapy
   */
  completeTherapy(therapyId, completedById) {
    const therapy = datastore.updateTherapy(therapyId, {
      status: 'COMPLETED',
      endDate: new Date().toISOString()
    });

    if (!therapy) {
      throw new Error('Therapy not found');
    }

    auditLogger.createLog(
      completedById,
      'DOCTOR',
      'THERAPY_COMPLETED',
      therapyId,
      `Completed therapy`
    );

    return therapy;
  }

  /**
   * Get patient therapies
   */
  getPatientTherapies(patientId) {
    return datastore.getPatientTherapies(patientId);
  }
}

module.exports = new TherapyService();
