require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '24h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 90,
  apiVersion: 'v1'
};
