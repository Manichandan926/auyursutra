/**
 * In-memory data store for MVP
 * In production, replace with PostgreSQL + FHIR
 */
const User = require('../models/User');
const Patient = require('../models/Patient');
const Therapy = require('../models/Therapy');
const Session = require('../models/Session');
const Leave = require('../models/Leave');
const Notification = require('../models/Notification');

class DataStore {
  constructor() {
    this.users = [];
    this.patients = [];
    this.therapies = [];
    this.sessions = [];
    this.leaves = [];
    this.notifications = [];
  }

  // ===== USER OPERATIONS =====
  addUser(user) {
    this.users.push(user);
    return user;
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  findUserByUsername(username) {
    return this.users.find(u => u.username === username);
  }

  getAllUsers(roleFilter = null) {
    if (roleFilter) {
      return this.users.filter(u => u.role === roleFilter);
    }
    return this.users;
  }

  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  deleteUser(id) {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  // ===== PATIENT OPERATIONS =====
  addPatient(patient) {
    this.patients.push(patient);
    return patient;
  }

  findPatientById(id) {
    return this.patients.find(p => p.id === id);
  }

  getAllPatients(search = null, doctorId = null, practitionerId = null) {
    let filtered = this.patients;
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        p.abha.includes(term)
      );
    }
    if (doctorId) {
      filtered = filtered.filter(p => p.assignedDoctorId === doctorId);
    }
    if (practitionerId) {
      filtered = filtered.filter(p => p.assignedPractitionerId === practitionerId);
    }
    return filtered;
  }

  updatePatient(id, updates) {
    const patient = this.findPatientById(id);
    if (!patient) return null;
    Object.assign(patient, updates);
    return patient;
  }

  // ===== THERAPY OPERATIONS =====
  addTherapy(therapy) {
    this.therapies.push(therapy);
    // Add therapy ID to patient
    const patient = this.findPatientById(therapy.patientId);
    if (patient && !patient.therapies.includes(therapy.id)) {
      patient.therapies.push(therapy.id);
    }
    return therapy;
  }

  findTherapyById(id) {
    return this.therapies.find(t => t.id === id);
  }

  getPatientTherapies(patientId) {
    return this.therapies.filter(t => t.patientId === patientId);
  }

  updateTherapy(id, updates) {
    const therapy = this.findTherapyById(id);
    if (!therapy) return null;
    Object.assign(therapy, updates);
    return therapy;
  }

  // ===== SESSION OPERATIONS =====
  addSession(session) {
    this.sessions.push(session);
    // Add session ID to therapy
    const therapy = this.findTherapyById(session.therapyId);
    if (therapy && !therapy.sessions.includes(session.id)) {
      therapy.sessions.push(session.id);
    }
    return session;
  }

  findSessionById(id) {
    return this.sessions.find(s => s.id === id);
  }

  getTherapySessions(therapyId) {
    return this.sessions.filter(s => s.therapyId === therapyId).sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // ===== LEAVE OPERATIONS =====
  addLeave(leave) {
    this.leaves.push(leave);
    return leave;
  }

  findLeaveById(id) {
    return this.leaves.find(l => l.id === id);
  }

  getPendingLeaves() {
    return this.leaves.filter(l => l.status === 'PENDING');
  }

  getUserLeaves(userId) {
    return this.leaves.filter(l => l.userId === userId);
  }

  updateLeave(id, updates) {
    const leave = this.findLeaveById(id);
    if (!leave) return null;
    Object.assign(leave, updates);
    return leave;
  }

  // ===== NOTIFICATION OPERATIONS =====
  addNotification(notification) {
    this.notifications.push(notification);
    return notification;
  }

  getUserNotifications(userId, unreadOnly = false) {
    let notifications = this.notifications.filter(n => n.userId === userId);
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  markNotificationAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
    }
    return notification;
  }

  // ===== UTILITY =====
  clear() {
    this.users = [];
    this.patients = [];
    this.therapies = [];
    this.sessions = [];
    this.leaves = [];
    this.notifications = [];
  }

  export() {
    return {
      users: this.users,
      patients: this.patients,
      therapies: this.therapies,
      sessions: this.sessions,
      leaves: this.leaves,
      notifications: this.notifications
    };
  }

  import(data) {
    this.clear();
    this.users = data.users || [];
    this.patients = data.patients || [];
    this.therapies = data.therapies || [];
    this.sessions = data.sessions || [];
    this.leaves = data.leaves || [];
    this.notifications = data.notifications || [];
  }
}

module.exports = new DataStore();
