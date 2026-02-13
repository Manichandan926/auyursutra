const Patient = require('../models/Patient');
const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');

class PatientService {
  /**
   * Create patient (Reception or direct)
   */
  createPatient(data, creatorId, creatorRole) {
    const patient = new Patient(data);
    datastore.addPatient(patient);

    auditLogger.createLog(
      creatorId,
      creatorRole,
      'PATIENT_CREATED',
      patient.id,
      `Created patient ${patient.name}`
    );

    return patient;
  }

  /**
   * Get patient by ID
   */
  getPatient(patientId) {
    const patient = datastore.findPatientById(patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }
    return patient;
  }

  /**
   * List patients (with filters)
   */
  listPatients(filters = {}) {
    return datastore.getAllPatients(
      filters.search,
      filters.doctorId,
      filters.practitionerId
    );
  }

  /**
   * Update patient
   */
  updatePatient(patientId, updates, updaterId) {
    const patient = datastore.updatePatient(patientId, updates);
    if (!patient) {
      throw new Error('Patient not found');
    }

    auditLogger.createLog(
      updaterId,
      'ADMIN',
      'PATIENT_UPDATED',
      patientId,
      `Updated patient ${patient.name}`
    );

    return patient;
  }

  /**
   * Assign doctor to patient
   */
  assignDoctor(patientId, doctorId, assignedById) {
    const patient = datastore.updatePatient(patientId, { assignedDoctorId: doctorId });
    if (!patient) {
      throw new Error('Patient not found');
    }

    auditLogger.createLog(
      assignedById,
      'ADMIN',
      'DOCTOR_ASSIGNED',
      patientId,
      `Assigned doctor to patient ${patient.name}`
    );

    return patient;
  }

  /**
   * Reassign practitioner to patient
   */
  reassignPractitioner(patientId, practitionerId, reassignedById) {
    const patient = datastore.updatePatient(patientId, { assignedPractitionerId: practitionerId });
    if (!patient) {
      throw new Error('Patient not found');
    }

    auditLogger.createLog(
      reassignedById,
      'ADMIN',
      'PRACTITIONER_REASSIGNED',
      patientId,
      `Reassigned practitioner to patient ${patient.name}`
    );

    return patient;
  }

  /**
   * Get patient progress (therapies + sessions)
   */
  getPatientProgress(patientId) {
    const patient = this.getPatient(patientId);
    const therapies = datastore.getPatientTherapies(patientId);

    const therapyProgress = therapies.map(therapy => {
      const sessions = datastore.getTherapySessions(therapy.id);
      return {
        therapy,
        sessions,
        sessionCount: sessions.length,
        avgProgress: sessions.length > 0
          ? Math.round(sessions.reduce((sum, s) => sum + s.progressPercent, 0) / sessions.length)
          : 0
      };
    });

    return {
      patient,
      therapies: therapyProgress,
      overallProgress: therapyProgress.length > 0
        ? Math.round(therapyProgress.reduce((sum, t) => sum + t.avgProgress, 0) / therapyProgress.length)
        : 0
    };
  }
}

module.exports = new PatientService();
