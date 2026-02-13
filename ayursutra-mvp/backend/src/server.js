const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();

const config = require('./config');
const { authMiddleware, sessionTimeout } = require('./middleware/auth');
const { requestLogging, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const practitionerRoutes = require('./routes/practitioner');
const patientRoutes = require('./routes/patient');
const receptionRoutes = require('./routes/reception');
const generalRoutes = require('./routes/general');

const app = express();

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogging);

// ===== ROUTES =====

// Public auth routes
app.use('/api/auth', authRoutes);

// Role-based protected routes
app.use('/api/admin', authMiddleware, sessionTimeout, adminRoutes);
app.use('/api/doctor', authMiddleware, sessionTimeout, doctorRoutes);
app.use('/api/practitioner', authMiddleware, sessionTimeout, practitionerRoutes);
app.use('/api/patient', authMiddleware, sessionTimeout, patientRoutes);
app.use('/api/reception', authMiddleware, sessionTimeout, receptionRoutes);

// General routes (auth required for some)
app.use('/api', generalRoutes);

// ===== SEED DATA (for demo) =====
app.post('/api/seed-data', (req, res) => {
  try {
    const datastore = require('./data/datastore');
    const User = require('./models/User');
    const Patient = require('./models/Patient');
    const Therapy = require('./models/Therapy');
    const passwordUtils = require('./utils/passwordUtils');
    const seedData = require('./data/seedData');

    // Check if already seeded
    if (datastore.users.length > 0) {
      return res.json({ success: false, message: 'Data already exists. Clear first.' });
    }

    datastore.clear();

    // Create seed users
    (async () => {
      // Admin
      let passwordHash = await passwordUtils.hashPassword('admin123');
      const admin = new User({
        username: 'admin',
        passwordHash,
        name: 'Admin Manager',
        role: 'ADMIN'
      });
      datastore.addUser(admin);

      // Doctors
      for (let doc of seedData.doctors) {
        passwordHash = await passwordUtils.hashPassword('doctor123');
        const doctor = new User({
          ...doc,
          passwordHash
        });
        datastore.addUser(doctor);
      }

      // Practitioners
      for (let prac of seedData.practitioners) {
        passwordHash = await passwordUtils.hashPassword('prac123');
        const practitioner = new User({
          ...prac,
          passwordHash
        });
        datastore.addUser(practitioner);
      }

      // Reception
      for (let rec of seedData.reception) {
        passwordHash = await passwordUtils.hashPassword('rec123');
        const reception = new User({
          ...rec,
          passwordHash
        });
        datastore.addUser(reception);
      }

      // Patients
      const doctors = datastore.getAllUsers('DOCTOR');
      const practitioners = datastore.getAllUsers('PRACTITIONER');

      for (let pat of seedData.patients) {
        const patient = new Patient({
          ...pat,
          assignedDoctorId: doctors[Math.floor(Math.random() * doctors.length)].id,
          assignedPractitionerId: practitioners[Math.floor(Math.random() * practitioners.length)].id
        });
        datastore.addPatient(patient);
      }

      // Therapies
      patients = datastore.patients;
      for (let therapy of seedData.therapies) {
        const pat = patients[Math.floor(Math.random() * patients.length)];
        const doc = datastore.findUserById(pat.assignedDoctorId);
        const prac = datastore.findUserById(pat.assignedPractitionerId);

        const therap = new Therapy({
          ...therapy,
          patientId: pat.id,
          doctorId: doc.id,
          primaryPractitionerId: prac.id
        });
        datastore.addTherapy(therap);
      }

      res.json({
        success: true,
        message: 'Seed data loaded successfully',
        credentials: {
          admin: { username: 'admin', password: 'admin123' },
          doctor: { username: 'doctor1', password: 'doctor123' },
          practitioner: { username: 'prac1', password: 'prac123' },
          reception: { username: 'rec1', password: 'rec123' }
        }
      });
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  AyurSutra Backend Server                                  ║
║  Role-based Ayurvedic Hospital Management System           ║
╚════════════════════════════════════════════════════════════╝
  
Server running on port ${config.port}
Environment: ${config.nodeEnv}
Version: ${config.apiVersion}

API Endpoints:
┣ 📝 Auth: POST /api/auth/login
┣ 👤 Admin: /api/admin/*
┣ 🏥 Doctor: /api/doctor/*
┣ 💊 Practitioner: /api/practitioner/*
┣ 🧑‍🤝‍🧑 Patient: /api/patient/*
┣ 🛎️  Reception: /api/reception/*
┗ 🔔 General: /api/health, /api/notifications

🌱 Seed Demo Data: POST /api/seed-data

Documentation:
Swagger: http://localhost:${config.port}/api-docs
Health: http://localhost:${config.port}/api/health
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
