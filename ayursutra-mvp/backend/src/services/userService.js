const User = require('../models/User');
const passwordUtils = require('../utils/passwordUtils');
const auditLogger = require('../utils/logger');
const datastore = require('../data/datastore');

class UserService {
  /**
   * Create new user (admin only)
   */
  async createUser(data, adminId) {
    // Check if username exists
    if (datastore.findUserByUsername(data.username)) {
      throw new Error('Username already exists');
    }

    const passwordHash = await passwordUtils.hashPassword(data.password);
    const user = new User({
      username: data.username,
      passwordHash,
      name: data.name,
      role: data.role,
      specialty: data.specialty,
      contact: data.contact,
      email: data.email,
      language: data.language
    });

    datastore.addUser(user);

    // Log
    auditLogger.createLog(
      adminId,
      'ADMIN',
      'ADMIN_CREATED_USER',
      user.id,
      `Created ${data.role} "${data.username}" (${data.name})`
    );

    return user.toResponse();
  }

  /**
   * Authenticate user
   */
  async authenticateUser(username, password) {
    const user = datastore.findUserByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.enabled) {
      throw new Error('User account is disabled');
    }

    const isValid = await passwordUtils.comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    datastore.updateUser(user.id, { lastLogin: new Date().toISOString() });

    // Log
    auditLogger.createLog(user.id, user.role, 'USER_LOGIN', user.id, `${user.name} logged in`);

    return user.toResponse();
  }

  /**
   * Get user by ID
   */
  getUser(userId) {
    const user = datastore.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toResponse();
  }

  /**
   * List users with role filter
   */
  listUsers(roleFilter = null) {
    const users = datastore.getAllUsers(roleFilter);
    return users.map(u => u.toResponse());
  }

  /**
   * Update user
   */
  updateUser(userId, updates, adminId) {
    const user = datastore.updateUser(userId, updates);
    if (!user) {
      throw new Error('User not found');
    }

    auditLogger.createLog(
      adminId,
      'ADMIN',
      'ADMIN_UPDATED_USER',
      userId,
      `Updated user ${user.name}`
    );

    return user.toResponse();
  }

  /**
   * Disable/enable user
   */
  toggleUser(userId, enabled, adminId) {
    const user = datastore.updateUser(userId, { enabled });
    if (!user) {
      throw new Error('User not found');
    }

    auditLogger.createLog(
      adminId,
      'ADMIN',
      enabled ? 'ADMIN_ENABLED_USER' : 'ADMIN_DISABLED_USER',
      userId,
      `${enabled ? 'Enabled' : 'Disabled'} user ${user.name}`
    );

    return user.toResponse();
  }

  /**
   * Get doctors with patient count
   */
  getDoctorsWithLoad() {
    const doctors = datastore.getAllUsers('DOCTOR');
    return doctors.map(doctor => {
      const patientCount = datastore.getAllPatients(null, doctor.id).length;
      return {
        ...doctor.toResponse(),
        patientCount
      };
    });
  }

  /**
   * Get practitioners with patient count
   */
  getPractitionersWithLoad() {
    const practitioners = datastore.getAllUsers('PRACTITIONER');
    return practitioners.map(prac => {
      const patientCount = datastore.getAllPatients(null, null, prac.id).length;
      return {
        ...prac.toResponse(),
        patientCount
      };
    });
  }

  /**
   * Soft-delete user (disable account + mark as deleted)
   */
  deleteUser(userId, adminId) {
    const user = datastore.findUserById(userId);
    if (!user) throw new Error('User not found');

    datastore.updateUser(userId, { enabled: false, deleted: true });

    auditLogger.createLog(
      adminId, 'ADMIN', 'ADMIN_DELETED_USER', userId,
      `Soft-deleted user ${user.name} (${user.username})`
    );

    return true;
  }

  /**
   * Admin changes a user's password
   */
  async changePassword(userId, newPassword, adminId) {
    const user = datastore.findUserById(userId);
    if (!user) throw new Error('User not found');

    const passwordHash = await passwordUtils.hashPassword(newPassword);
    const updated = datastore.updateUser(userId, { passwordHash });

    auditLogger.createLog(
      adminId, 'ADMIN', 'ADMIN_CHANGED_PASSWORD', userId,
      `Admin changed password for user ${user.name}`
    );

    return updated.toResponse();
  }
}

module.exports = new UserService();
