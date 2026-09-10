// src/seed.js
require('dotenv').config();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH =
  process.env.DATABASE_PATH ||
  process.env.DB_PATH ||
  path.join(__dirname, '..', 'data', 'a4g_database.sqlite');

const ADMIN_EMAIL = 'admin@alliance4growth.org';
const ADMIN_PASSWORD = 'Soji@1111'; // change after first login
const ADMIN_ROLE = 'admin';

const db = new sqlite3.Database(DB_PATH);

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

async function seed() {
  console.log('🌱 Seeding admin user in:', DB_PATH);

  const existing = await get('SELECT id FROM users WHERE email = ?', [ADMIN_EMAIL]);
  if (existing) {
    console.log('ℹ️  Admin user already exists:', ADMIN_EMAIL);
    db.close();
    return;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await run(
    `INSERT INTO users (email, password_hash, role, first_name, surname, created_at, is_approved)
     VALUES (?, ?, ?, ?, ?, datetime('now'), 1)`,
    [ADMIN_EMAIL, hash, ADMIN_ROLE, 'Admin', 'User']
  );

  console.log('✅ Admin user created');
  console.log('   Email:    ', ADMIN_EMAIL);
  console.log('   Password: ', ADMIN_PASSWORD);
  console.log('   ⚠️  Change this password after first login.');
  db.close();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  db.close();
  process.exit(1);
});

// sqlite3 data/a4g_database.sqlite "UPDATE users SET is_approved = 1 WHERE email = 'admin@alliance4growth.org';"
// node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
// 