const { initializeDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    const db = await initializeDatabase();
    
    console.log('✅ Database initialized successfully!');
    
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('ℹ️ Database schema is ready. ADMIN_EMAIL/ADMIN_PASSWORD were not supplied; no admin account was created.');
      process.exit(0);
    }
    if (adminPassword.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
    }
    
    // Check if admin exists
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', [adminEmail.toLowerCase()]);
    
    if (!existingAdmin) {
      const password_hash = await bcrypt.hash(adminPassword, 10);
      await db.run(`
        INSERT INTO users (
          first_name, surname, email, password_hash, role, is_approved, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['Admin', 'User', adminEmail.toLowerCase(), password_hash, 'admin', 1, 1]);
      
      console.log(`✅ Admin account created: ${adminEmail}`);
      console.log('🔐 Admin account created from supplied environment variables.');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
    
    console.log('ℹ️ No sample/demo records are created by the production initializer.');

    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
