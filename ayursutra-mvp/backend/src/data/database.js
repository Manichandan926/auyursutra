/**
 * SQLite Database Initialization
 * Uses better-sqlite3 for synchronous, zero-config persistence.
 * DB file: backend/data/ayursutra.db
 */
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Ensure the data directory exists
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'ayursutra.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ===== SCHEMA =====
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL CHECK(role IN ('ADMIN','DOCTOR','PRACTITIONER','RECEPTION','PATIENT')),
    specialty   TEXT,
    contact     TEXT DEFAULT '',
    email       TEXT DEFAULT '',
    language    TEXT DEFAULT 'en',
    enabled     INTEGER DEFAULT 1,
    last_login  TEXT,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id                       TEXT PRIMARY KEY,
    user_id                  TEXT REFERENCES users(id),
    name                     TEXT NOT NULL,
    dob                      TEXT,
    age                      INTEGER,
    gender                   TEXT,
    dosha                    TEXT DEFAULT '',
    preferred_language       TEXT DEFAULT 'en',
    abha                     TEXT DEFAULT '',
    phone                    TEXT DEFAULT '',
    email                    TEXT DEFAULT '',
    address                  TEXT DEFAULT '',
    assigned_doctor_id       TEXT REFERENCES users(id),
    assigned_practitioner_id TEXT REFERENCES users(id),
    therapies                TEXT DEFAULT '[]', -- JSON array of therapy IDs
    emergency_contact        TEXT DEFAULT '',
    medical_history          TEXT DEFAULT '',
    is_emergency             INTEGER DEFAULT 0,
    visit_token              TEXT,
    checked_in_at            TEXT,
    registration_type        TEXT DEFAULT 'NEW',
    created_at               TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS therapies (
    id                       TEXT PRIMARY KEY,
    patient_id               TEXT NOT NULL REFERENCES patients(id),
    doctor_id                TEXT REFERENCES users(id),
    primary_practitioner_id  TEXT REFERENCES users(id),
    type                     TEXT NOT NULL,
    phase                    TEXT,
    start_date               TEXT,
    duration_days            INTEGER,
    end_date                 TEXT,
    room                     TEXT,
    herbs                    TEXT DEFAULT '[]', -- JSON array
    status                   TEXT DEFAULT 'SCHEDULED',
    notes                    TEXT DEFAULT '',
    progress_percent         INTEGER DEFAULT 0,
    sessions                 TEXT DEFAULT '[]', -- JSON array of session IDs
    created_at               TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id               TEXT PRIMARY KEY,
    therapy_id       TEXT NOT NULL REFERENCES therapies(id),
    patient_id       TEXT REFERENCES patients(id),
    date             TEXT NOT NULL,
    practitioner_id  TEXT REFERENCES users(id),
    notes            TEXT DEFAULT '',
    progress_percent INTEGER DEFAULT 0,
    attended         INTEGER DEFAULT 1,
    vitals           TEXT DEFAULT '{}', -- JSON object
    attachments      TEXT DEFAULT '[]', -- JSON array
    symptoms         TEXT DEFAULT '[]', -- JSON array
    created_at       TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leaves (
    id                      TEXT PRIMARY KEY,
    user_id                 TEXT NOT NULL REFERENCES users(id),
    user_role               TEXT DEFAULT '',
    from_date               TEXT NOT NULL,
    to_date                 TEXT NOT NULL,
    reason                  TEXT DEFAULT '',
    emergency_cover_required INTEGER DEFAULT 0,
    status                  TEXT DEFAULT 'PENDING',
    reviewed_by             TEXT,
    reviewed_at             TEXT,
    created_at              TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id),
    type       TEXT NOT NULL,
    message    TEXT NOT NULL,
    read       INTEGER DEFAULT 0,
    read_at    TEXT,
    created_at TEXT NOT NULL
  );
`);

// ===== MIGRATIONS =====
// Safely adds new columns to existing tables without dropping data.
// SQLite does not support ALTER TABLE ADD COLUMN IF NOT EXISTS,
// so we query table_info first and only add what's missing.
function addColumnIfMissing(table, column, definition) {
  const cols = db.pragma(`table_info(${table})`).map(c => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`  ↳ migration: added ${table}.${column}`);
  }
}

function runMigrations() {
  // patients — columns added in v2
  addColumnIfMissing('patients', 'user_id', 'TEXT');
  addColumnIfMissing('patients', 'is_emergency', 'INTEGER DEFAULT 0');
  addColumnIfMissing('patients', 'visit_token', 'TEXT');
  addColumnIfMissing('patients', 'checked_in_at', 'TEXT');

  // leaves — new columns in v2 (renamed from start_date/end_date)
  addColumnIfMissing('leaves', 'user_role', 'TEXT DEFAULT \'\'');
  addColumnIfMissing('leaves', 'from_date', 'TEXT');
  addColumnIfMissing('leaves', 'to_date', 'TEXT');
  addColumnIfMissing('leaves', 'emergency_cover_required', 'INTEGER DEFAULT 0');

  // users — soft-delete support
  addColumnIfMissing('users', 'deleted', 'INTEGER DEFAULT 0');

  // notifications — extra fields
  addColumnIfMissing('notifications', 'title', 'TEXT DEFAULT \'\'');
  addColumnIfMissing('notifications', 'related_id', 'TEXT');

  // Backfill from_date/to_date from old start_date/end_date rows
  try {
    const leaveCols = db.pragma('table_info(leaves)').map(c => c.name);
    if (leaveCols.includes('start_date')) {
      db.exec(`
        UPDATE leaves SET from_date = start_date WHERE from_date IS NULL AND start_date IS NOT NULL;
        UPDATE leaves SET to_date   = end_date   WHERE to_date   IS NULL AND end_date   IS NOT NULL;
      `);
    }
  } catch (_) { /* ignore */ }
}

runMigrations();

console.log(`✅ SQLite DB ready: ${DB_PATH}`);

module.exports = db;
