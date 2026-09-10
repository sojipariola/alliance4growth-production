const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let db;

async function initializeDatabase() {
  if (!db) {
    try {
      // Use absolute path
      const dbPath = path.resolve(process.env.DB_PATH || path.join(process.cwd(), 'data', 'a4g_database.sqlite'));
      
      console.log(`📁 Database path: ${dbPath}`);
      
      // Ensure directory exists
      const dir = path.dirname(dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys and WAL mode
      await db.run('PRAGMA foreign_keys = ON');
      await db.run('PRAGMA journal_mode = WAL');
      await db.run('PRAGMA synchronous = NORMAL');
      await db.run('PRAGMA busy_timeout = 5000');
      
      console.log('✅ Connected to SQLite database');
      await createTables();
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }
  return db;
}

async function createTables() {
  try {
    await db.exec(`
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

    await db.exec(`
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

    await db.exec(`
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

    await db.exec(`
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

    await db.exec(`
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

    await db.exec(`
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

    await db.exec(`
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

    // Create indexes
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_approved ON users(is_approved);
      CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
      CREATE INDEX IF NOT EXISTS idx_events_is_past ON events(is_past);
      CREATE INDEX IF NOT EXISTS idx_registrations_user_event ON event_registrations(user_id, event_id);
    `);

    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function getDb() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}

module.exports = { getDb, initializeDatabase };
