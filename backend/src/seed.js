// src/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const { getDb } = require('./config/database');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@alliance4growth.org';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Soji@1111';
const ADMIN_ROLE = 'admin';

// Pass --reset on the command line to update the password of an existing admin.
const RESET = process.argv.includes('--reset');

async function seed() {
  const dbPath = path.resolve(
    process.env.DB_PATH ||
      path.join(process.cwd(), 'data', 'a4g_database.sqlite')
  );
  console.log('📁 Database:', dbPath);
  console.log('👤 Admin email:', ADMIN_EMAIL);
  console.log('🔁 Reset mode:', RESET ? 'yes' : 'no');

  const db = await getDb();

  const existing = await db.get(
    'SELECT id, email FROM users WHERE email = ?',
    [ADMIN_EMAIL]
  );

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existing) {
    if (RESET) {
      await db.run(
        `UPDATE users
           SET password_hash = ?,
               role = ?,
               is_approved = 1,
               is_active = 1,
               updated_at = datetime('now')
         WHERE email = ?`,
        [hash, ADMIN_ROLE, ADMIN_EMAIL]
      );
      await db.persist();
      console.log('✅ Admin user updated (password reset)');
    } else {
      console.log('ℹ️  Admin user already exists:', ADMIN_EMAIL);
      console.log('   Re-run with --reset to force a password update.');
    }
    return;
  }

  await db.run(
    `INSERT INTO users (email, password_hash, role, first_name, surname, is_approved, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))`,
    [ADMIN_EMAIL, hash, ADMIN_ROLE, 'Admin', 'User']
  );

  await db.persist();

  console.log('✅ Admin user created');
  console.log('   Email:    ', ADMIN_EMAIL);
  console.log('   Password: ', RESET || ADMIN_PASSWORD === 'Soji@1111'
    ? ADMIN_PASSWORD
    : '(from ADMIN_PASSWORD env)');
  console.log('   ⚠️  Change this password after first login.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });