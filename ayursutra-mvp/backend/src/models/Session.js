const { v4: uuidv4 } = require('uuid');

class Session {
  constructor(data) {
    this.id = data.id || `s_${uuidv4().substring(0, 8)}`;
    this.therapyId = data.therapyId;
    this.patientId = data.patientId;
    this.date = data.date; // ISO datetime
    this.practitionerId = data.practitionerId;
    this.notes = data.notes || '';
    this.progressPercent = data.progressPercent || 0; // 0-100
    this.attended = data.attended !== false;
    this.vitals = data.vitals || {
      pulse: null,
      bp: null,
      temperature: null,
      respiration: null
    };
    this.attachments = data.attachments || []; // image/document paths
    this.symptoms = data.symptoms || []; // reported symptoms
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Session;
