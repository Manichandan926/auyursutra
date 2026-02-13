const bcrypt = require('bcryptjs');
const { bcryptRounds } = require('../config');

class PasswordUtils {
  /**
   * Hash password using bcrypt
   */
  async hashPassword(password) {
    return bcrypt.hash(password, bcryptRounds);
  }

  /**
   * Compare plain password with hash
   */
  async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Generate temporary password
   */
  generateTempPassword() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

module.exports = new PasswordUtils();
