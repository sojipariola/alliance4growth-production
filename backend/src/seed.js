// src/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('./config/database');

const ADMIN_EMAIL = 'admin@alliance4growth.org';
const ADMIN_PASSWORD = 'Soji@1111';
const ADMIN_ROLE = 'admin';

async function seed() {
  const db = await getDb();

  console.log('🌱 Seeding admin user...');

  const existing = await db.get(
    'SELECT id FROM users WHERE email = ?',
    [ADMIN_EMAIL]
  );

  if (existing) {
    console.log('ℹ️  Admin user already exists:', ADMIN_EMAIL);
    await db.persist();
    return;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await db.run(
    `INSERT INTO users (email, password_hash, role, first_name, surname, is_approved, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))`,
    [ADMIN_EMAIL, hash, ADMIN_ROLE, 'Admin', 'User']
  );

  await db.persist();

  console.log('✅ Admin user created');
  console.log('   Email:    ', ADMIN_EMAIL);
  console.log('   Password: ', ADMIN_PASSWORD);
  console.log('   ⚠️  Change this password after first login.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });