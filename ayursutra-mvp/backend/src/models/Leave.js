const { v4: uuidv4 } = require('uuid');

class Leave {
  constructor(data) {
    this.id = data.id || `l_${uuidv4().substring(0, 8)}`;
    this.userId = data.userId;
    this.userRole = data.userRole; // DOCTOR | PRACTITIONER
    this.fromDate = data.fromDate; // ISO date
    this.toDate = data.toDate;
    this.reason = data.reason || '';
    this.emergencyCoverRequired = data.emergencyCoverRequired || false;
    this.status = data.status || 'PENDING'; // PENDING | APPROVED | REJECTED
    this.approvedBy = data.approvedBy || null; // admin user ID
    this.approvedAt = data.approvedAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Leave;
