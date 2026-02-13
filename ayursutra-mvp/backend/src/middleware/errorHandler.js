const auditLogger = require('../utils/logger');

/**
 * Log all API requests
 */
const requestLogging = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (req.user) {
      // Only log state-changing requests
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        auditLogger.createLog(
          req.user.id,
          req.user.role,
          'API_REQUEST',
          null,
          `${req.method} ${req.path}`
        );
      }
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (req.user) {
    auditLogger.createLog(
      req.user.id,
      req.user.role,
      'API_ERROR',
      null,
      `${err.message || 'Unknown error'}`
    );
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    error: message,
    status
  });
};

module.exports = {
  requestLogging,
  errorHandler
};
