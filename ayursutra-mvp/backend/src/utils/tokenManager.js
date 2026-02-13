const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiry } = require('../config');

class TokenManager {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };
    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
  }

  /**
   * Verify and decode token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

module.exports = new TokenManager();
