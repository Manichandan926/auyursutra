const datastore = require('../data/datastore');
const auditLogger = require('../utils/logger');
const leaveService = require('./leaveService');

class RosterService {
  /**
   * Auto-assign practitioners when one goes on leave
   * Uses least-load balancing algorithm
   */
  autoAssignOnLeave(leaveUserId, availablePractitionerIds = null) {
    // Get all patients assigned to the on-leave practitioner
    const affectedPatients = datastore.getAllPatients(null, null, leaveUserId);

    if (affectedPatients.length === 0) {
      return { reassigned: [] };
    }

    // Get available practitioners
    let practitioners = datastore.getAllUsers('PRACTITIONER').filter(p => p.enabled);

    if (availablePractitionerIds) {
      practitioners = practitioners.filter(p => availablePractitionerIds.includes(p.id));
    }

    // Remove on-leave practitioner
    practitioners = practitioners.filter(p => p.id !== leaveUserId);

    if (practitioners.length === 0) {
      throw new Error('No available practitioners for reassignment');
    }

    const reassigned = [];

    // Reassign each affected patient to practitioner with least load
    for (const patient of affectedPatients) {
      const loads = practitioners.map(p => ({
        id: p.id,
        load: datastore.getAllPatients(null, null, p.id).length
      }));

      const minLoad = loads.reduce((min, curr) => (curr.load < min.load) ? curr : min);
      const newPracId = minLoad.id;

      datastore.updatePatient(patient.id, { assignedPractitionerId: newPracId });

      auditLogger.createLog(
        'SYSTEM',
        'SYSTEM',
        'PRAC_REASSIGNED',
        patient.id,
        `Reassigned practitioner due to leave`
      );

      reassigned.push({
        patientId: patient.id,
        oldPractitionerId: leaveUserId,
        newPractitionerId: newPracId
      });
    }

    return { reassigned };
  }

  /**
   * Auto-assign doctor for new patient (reception)
   * Uses least-load balancing
   */
  assignDoctorByLoad(isEmergency = false) {
    const doctors = datastore.getAllUsers('DOCTOR').filter(d => d.enabled);

    if (doctors.length === 0) {
      throw new Error('No available doctors');
    }

    // For emergency, assign senior doctor (first in list or configurable)
    if (isEmergency) {
      return doctors[0]; // In production, use specialization/seniority ranking
    }

    // Calculate load for each doctor
    const loads = doctors.map(doc => ({
      doctor: doc,
      load: datastore.getAllPatients(null, doc.id).length
    }));

    // Return doctor with least load
    return loads.reduce((min, curr) => (curr.load < min.load) ? curr : min).doctor;
  }

  /**
   * Get on-call roster (available staff)
   */
  getOnCallRoster(date = new Date()) {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;

    const doctors = datastore.getAllUsers('DOCTOR')
      .filter(d => d.enabled && !leaveService.isUserOnLeave(d.id, dateStr));

    const practitioners = datastore.getAllUsers('PRACTITIONER')
      .filter(p => p.enabled && !leaveService.isUserOnLeave(p.id, dateStr));

    return {
      date: dateStr,
      availableDoctors: doctors.map(d => ({
        ...d.toResponse(),
        patientLoad: datastore.getAllPatients(null, d.id).length
      })),
      availablePractitioners: practitioners.map(p => ({
        ...p.toResponse(),
        patientLoad: datastore.getAllPatients(null, null, p.id).length
      }))
    };
  }

  /**
   * Get practitioner availability for a date range
   */
  getPractitionerAvailability(startDate, endDate) {
    const practitioners = datastore.getAllUsers('PRACTITIONER').filter(p => p.enabled);

    return practitioners.map(prac => {
      const leaves = leaveService.getUserLeaves(prac.id);
      const conflictingLeaves = leaves.filter(leave => {
        if (leave.status !== 'APPROVED') return false;
        return new Date(leave.toDate) >= new Date(startDate) &&
               new Date(leave.fromDate) <= new Date(endDate);
      });

      return {
        practitionerId: prac.id,
        name: prac.name,
        available: conflictingLeaves.length === 0,
        conflictingLeaves: conflictingLeaves.map(l => ({
          fromDate: l.fromDate,
          toDate: l.toDate
        }))
      };
    });
  }
}

module.exports = new RosterService();
