const express = require('express');
const router = express.Router();
const {
  authMiddleware,
  requireRole,
  sessionTimeout
} = require('../middleware/auth');
const tokenManager = require('../utils/tokenManager');
const userService = require('../services/userService');
const auditLogger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Public endpoint - authenticate user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await userService.authenticateUser(username, password);
    const token = tokenManager.generateToken(user);

    res.json({
      success: true,
      token,
      user,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/auth/logout
 * Log out user
 */
router.post('/logout', authMiddleware, sessionTimeout, (req, res) => {
  auditLogger.createLog(
    req.user.id,
    req.user.role,
    'USER_LOGOUT',
    req.user.id,
    `User logged out`
  );

  res.json({ success: true, message: 'Logged out' });
});

/**
 * POST /api/auth/patient-signup
 * Public endpoint - allow reception or patient to signup
 */
router.post('/patient-signup', async (req, res, next) => {
  try {
    const { username, password, name, age, phone, email, language, address, dosha } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user account for patient
    const User = require('../models/User');
    const passwordUtils = require('../utils/passwordUtils');
    const datastore = require('../data/datastore');

    if (datastore.findUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const passwordHash = await passwordUtils.hashPassword(password);
    const user = new User({
      username,
      passwordHash,
      name,
      role: 'PATIENT',
      contact: phone,
      email,
      language
    });

    datastore.addUser(user);

    // Create patient profile
    const Patient = require('../models/Patient');
    const patientService = require('../services/patientService');

    const patient = patientService.createPatient({
      name,
      age,
      phone,
      email,
      address,
      dosha,
      preferredLanguage: language
    }, user.id, 'PATIENT');

    auditLogger.createLog(
      user.id,
      'PATIENT',
      'PATIENT_SIGNUP',
      patient.id,
      `Patient ${name} signed up`
    );

    // Generate token
    const token = tokenManager.generateToken(user.toResponse());

    res.json({
      success: true,
      message: 'Patient registered successfully',
      token,
      user: user.toResponse(),
      patient
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authMiddleware, (req, res) => {
  try {
    const userService = require('../services/userService');
    const user = userService.getUser(req.user.id);
    const newToken = tokenManager.generateToken(user);

    res.json({
      success: true,
      token: newToken,
      expiresIn: '24h'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
