const { v4: uuidv4 } = require('uuid');

class Therapy {
  constructor(data) {
    this.id = data.id || `t_${uuidv4().substring(0, 8)}`;
    this.patientId = data.patientId;
    this.doctorId = data.doctorId;
    this.primaryPractitionerId = data.primaryPractitionerId;
    this.type = data.type; // Virechana, Basti, Nasya, etc
    this.phase = data.phase; // PURVAKARMA, PRADHANAKARMA, PASCHATKARMA
    this.startDate = data.startDate;
    this.durationDays = data.durationDays;
    this.endDate = data.endDate || null;
    this.room = data.room; // Room number
    this.herbs = data.herbs || [];
    this.status = data.status || 'SCHEDULED'; // SCHEDULED | ONGOING | COMPLETED | CANCELLED
    this.notes = data.notes || '';
    this.progressPercent = data.progressPercent || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.sessions = data.sessions || []; // array of session IDs
  }
}

module.exports = Therapy;
