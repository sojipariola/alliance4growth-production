// src/config/database.js — sql.js version
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db = null;
let SQL = null;
let dbPath = null;
let saveTimer = null;

function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    persist();
  }, 250);
}

function persist() {
  if (!db || !dbPath) return;
  try {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (err) {
    console.error('❌ Failed to persist database:', err);
  }
}

// Compatible wrapper: mimics the `sqlite` package API surface you use
function wrap(sqlDb) {
  return {
    // db.exec(sql) — multiple statements, no params
    async exec(sql) {
      sqlDb.exec(sql);
      scheduleSave();
    },

    // db.run(sql, params) — single statement
    async run(sql, params = []) {
      const stmt = sqlDb.prepare(sql);
      try {
        stmt.bind(params);
        stmt.step();
      } finally {
        stmt.free();
      }
      scheduleSave();
    },

    // db.get(sql, params) — single row
    async get(sql, params = []) {
      const stmt = sqlDb.prepare(sql);
      try {
        stmt.bind(params);
        if (stmt.step()) {
          return stmt.getAsObject();
        }
        return undefined;
      } finally {
        stmt.free();
      }
    },

    // db.all(sql, params) — all rows
    async all(sql, params = []) {
      const stmt = sqlDb.prepare(sql);
      const rows = [];
      try {
        stmt.bind(params);
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        return rows;
      } finally {
        stmt.free();
      }
    },

    // Expose raw for advanced use
    _raw: sqlDb,

    // Manual persist (call before process exit)
    persist,
  };
}

async function initializeDatabase() {
  if (db) return db;

  dbPath = path.resolve(
    process.env.DB_PATH ||
      path.join(process.cwd(), 'data', 'a4g_database.sqlite')
  );

  console.log(`📁 Database path: ${dbPath}`);

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
    console.log('✅ Loaded existing SQLite database');
  } else {
    db = new SQL.Database();
    console.log('✅ Created new SQLite database');
  }

  // sql.js is a single connection — no WAL, no busy_timeout needed
  db.run('PRAGMA foreign_keys = ON');

  await createTables();

  // Save on exit
  process.on('exit', persist);
  process.on('SIGINT', () => {
    persist();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    persist();
    process.exit(0);
  });

  return wrap(db);
}

async function createTables() {
  // Exact same DDL as your current file
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      first_name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      date_of_birth TEXT,
      emergency_contact TEXT,
      interests TEXT,
      how_heard TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      is_approved INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      event_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      location TEXT,
      max_attendees INTEGER,
      image_url TEXT,
      gallery_images TEXT,
      is_past INTEGER DEFAULT 0,
      event_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      status TEXT DEFAULT 'registered',
      registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS site_content (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      page TEXT NOT NULL,
      section TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_by TEXT,
      FOREIGN KEY (updated_by) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'GBP',
      status TEXT DEFAULT 'pending',
      stripe_payment_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      featured_image TEXT,
      author_id TEXT,
      is_published INTEGER DEFAULT 0,
      published_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_approved ON users(is_approved);
    CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_is_past ON events(is_past);
    CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON event_registrations(user_id, event_id);
  `);

  console.log('✅ Database tables created/verified');
}

async function getDb() {
  if (!db) {
    await initializeDatabase();
  }
  return wrap(db);
}

module.exports = { getDb, initializeDatabase };