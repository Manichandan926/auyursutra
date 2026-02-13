const { v4: uuidv4 } = require('uuid');

class Notification {
  constructor(data) {
    this.id = data.id || `n_${uuidv4().substring(0, 8)}`;
    this.userId = data.userId;
    this.type = data.type; // SESSION_REMINDER, LEAVE_APPROVED, THERAPY_ASSIGNED
    this.title = data.title;
    this.message = data.message;
    this.relatedId = data.relatedId || null; // therapy ID, session ID, etc
    this.read = data.read || false;
    this.readAt = data.readAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}

module.exports = Notification;
