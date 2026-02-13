const { v4: uuidv4 } = require('uuid');

class Patient {
  constructor(data) {
    this.id = data.id || `p_${uuidv4().substring(0, 8)}`;
    this.name = data.name;
    this.dob = data.dob; // YYYY-MM-DD
    this.age = data.age;
    this.gender = data.gender; // Male | Female | Other
    this.dosha = data.dosha || ''; // Vata | Pitta | Kapha | Tridosha
    this.preferredLanguage = data.preferredLanguage || 'en';
    this.abha = data.abha || ''; // ABHA ID
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.address = data.address || '';
    this.assignedDoctorId = data.assignedDoctorId || null;
    this.assignedPractitionerId = data.assignedPractitionerId || null;
    this.therapies = data.therapies || []; // array of therapy IDs
    this.emergencyContact = data.emergencyContact || '';
    this.medicalHistory = data.medicalHistory || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.registrationType = data.registrationType || 'NEW'; // NEW | RETURNING
  }
}

module.exports = Patient;
