const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || `u_${uuidv4().substring(0, 8)}`;
    this.username = data.username;
    this.passwordHash = data.passwordHash;
    this.name = data.name;
    this.role = data.role; // ADMIN | DOCTOR | PRACTITIONER | RECEPTION | PATIENT
    this.specialty = data.specialty || null; // for doctors & practitioners
    this.contact = data.contact || '';
    this.email = data.email || '';
    this.language = data.language || 'en';
    this.enabled = data.enabled !== false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
  }

  // Sanitize for API response (exclude password)
  toResponse() {
    const { passwordHash, ...user } = this;
    return user;
  }
}

module.exports = User;
