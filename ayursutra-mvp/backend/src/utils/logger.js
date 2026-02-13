const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class AuditLogger {
  constructor() {
    this.logs = [];
    this.logHash = null;
  }

  /**
   * Compute SHA256 hash for log integrity
   */
  computeHash(data, previousHash = '') {
    const combined = previousHash + JSON.stringify(data);
    return crypto.createHash('sha256').update(combined).digest('hex');
  }

  /**
   * Append immutable audit log entry
   */
  createLog(userId, userRole, action, resourceId = null, details = '') {
    const logEntry = {
      id: uuidv4(),
      userId,
      userRole,
      action,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
      hash: this.computeHash({ userId, userRole, action, resourceId, details }, this.logHash)
    };

    // Update chain hash for next entry
    this.logHash = logEntry.hash;
    this.logs.push(logEntry);

    return logEntry;
  }

  /**
   * Retrieve all logs (admin only - read-only)
   */
  getLogs(filters = {}) {
    let filtered = this.logs;

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.endDate));
    }

    return filtered;
  }

  /**
   * Verify log integrity (detect tampering)
   */
  verifyIntegrity() {
    let previousHash = '';
    for (let i = 0; i < this.logs.length; i++) {
      const log = this.logs[i];
      const expectedHash = this.computeHash(
        { userId: log.userId, userRole: log.userRole, action: log.action, resourceId: log.resourceId, details: log.details },
        previousHash
      );
      if (log.hash !== expectedHash) {
        return {
          valid: false,
          tamperedAt: i,
          message: `Log tampering detected at index ${i}`
        };
      }
      previousHash = log.hash;
    }
    return { valid: true };
  }

  /**
   * Clear logs (should not be called - for demo reset only)
   */
  clearLogs() {
    this.logs = [];
    this.logHash = null;
  }
}

module.exports = new AuditLogger();
