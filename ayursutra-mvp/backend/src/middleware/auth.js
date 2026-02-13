const tokenManager = require('../utils/tokenManager');
const auditLogger = require('../utils/logger');

/**
 * Verify JWT token and attach user to request
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = tokenManager.extractToken(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = tokenManager.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Verify user has required role
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      auditLogger.createLog(
        req.user.id,
        req.user.role,
        'UNAUTHORIZED_ACCESS_ATTEMPT',
        null,
        `User attempted to access restricted ${req.method} ${req.path}`
      );

      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Optional auth - allows anonymous, but attaches user if token present
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = tokenManager.extractToken(authHeader);

    if (token) {
      const decoded = tokenManager.verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
  } catch (error) {
    // Silent fail for optional auth
  }

  next();
};

/**
 * Session timeout middleware (prevent stale sessions)
 */
const sessionTimeout = (req, res, next) => {
  if (req.user && req.user.iat) {
    const tokenAgeSeconds = Math.floor(Date.now() / 1000) - req.user.iat;
    const maxAgeSeconds = 24 * 60 * 60; // 24 hours

    if (tokenAgeSeconds > maxAgeSeconds) {
      return res.status(401).json({ error: 'Session expired' });
    }
  }

  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
  sessionTimeout
};
