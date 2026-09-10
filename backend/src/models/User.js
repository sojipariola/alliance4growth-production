const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    console.log('📝 User.create called with:', { ...userData, password: '***' });
    
    try {
      const db = await getDb();
      console.log('✅ Database connection acquired');
      
      const {
        first_name,
        surname,
        email,
        phone,
        address,
        date_of_birth,
        emergency_contact,
        interests,
        how_heard,
        password,
        role = 'member'
      } = userData;

      // Check if db is available
      if (!db) {
        console.error('❌ Database connection not available');
        throw new Error('Database connection not available');
      }
      
      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed');
      
      // Convert interests array to JSON string for SQLite
      const interestsJson = interests && Array.isArray(interests) && interests.length > 0 
        ? JSON.stringify(interests) 
        : null;
      
      // Check if the table exists
      const tableCheck = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      console.log('📊 Table exists:', tableCheck ? 'Yes' : 'No');
      
      if (!tableCheck) {
        console.error('❌ Users table does not exist!');
        throw new Error('Users table does not exist');
      }
      
      // Generate a unique ID for the user
      const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      
      const query = `
        INSERT INTO users (
          id, first_name, surname, email, phone, address, 
          date_of_birth, emergency_contact, interests, 
          how_heard, password_hash, role
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        first_name, 
        surname, 
        email.toLowerCase(), 
        phone || null, 
        address || null,
        date_of_birth || null, 
        emergency_contact || null, 
        interestsJson, 
        how_heard || null,
        password_hash, 
        role
      ];

      console.log('🔍 Executing INSERT with ID:', id);
      console.log('🔍 Values:', values.map((v, i) => {
        if (i === 10) return '***'; // Hide password_hash
        return v;
      }));
      
      // Try the insert
      try {
        const result = await db.run(query, values);
        console.log('✅ Insert result:', result);
        console.log('✅ Changes:', result.changes);
        
        if (result && result.changes > 0) {
          console.log(`📎 User created with ID: ${id}`);
          const user = await this.findById(id);
          console.log('📦 Retrieved user:', user ? { ...user, password_hash: '***' } : null);
          return user;
        }
        
        console.error('❌ No changes made to database');
        return null;
      } catch (insertError) {
        console.error('❌ Insert error:', insertError);
        console.error('❌ Insert error message:', insertError.message);
        if (insertError.message.includes('UNIQUE')) {
          throw new Error('Email already registered');
        }
        throw insertError;
      }
    } catch (error) {
      console.error('❌ Database insert error:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const db = await getDb();
    try {
      console.log('🔍 Finding user by email:', email);
      const result = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
      if (result && result.interests) {
        try {
          result.interests = JSON.parse(result.interests);
        } catch {
          result.interests = [];
        }
      }
      console.log('📦 Found user:', result ? { ...result, password_hash: '***' } : null);
      return result;
    } catch (error) {
      console.error('Find by email error:', error);
      return null;
    }
  }

  static async findById(id) {
    const db = await getDb();
    try {
      console.log('🔍 Finding user by ID:', id);
      const query = `
        SELECT id, first_name, surname, email, phone, address,
               date_of_birth, emergency_contact, interests, how_heard,
               role, is_approved, is_active, created_at, last_login
        FROM users WHERE id = ?
      `;
      const result = await db.get(query, [id]);
      if (result && result.interests) {
        try {
          result.interests = JSON.parse(result.interests);
        } catch {
          result.interests = [];
        }
      }
      console.log('📦 Found user:', result ? { ...result, password_hash: '***' } : null);
      return result;
    } catch (error) {
      console.error('Find by id error:', error);
      return null;
    }
  }

  static async update(id, updates) {
    const db = await getDb();
    const allowedFields = [
      'first_name', 'surname', 'phone', 'address',
      'date_of_birth', 'emergency_contact', 'how_heard'
    ];
    
    let interestsJson = null;
    if (updates.interests !== undefined) {
      interestsJson = JSON.stringify(updates.interests);
      allowedFields.push('interests');
    }
    
    const fields = allowedFields.filter(field => updates[field] !== undefined);
    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      if (field === 'interests') return interestsJson;
      return updates[field];
    });
    values.push(id);

    try {
      await db.run(`
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);
      
      return await this.findById(id);
    } catch (error) {
      console.error('Update error:', error);
      return null;
    }
  }

  static async updateApproval(id, isApproved) {
    const db = await getDb();
    try {
      await db.run('UPDATE users SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        isApproved ? 1 : 0, id
      ]);
      return await this.findById(id);
    } catch (error) {
      console.error('Update approval error:', error);
      return null;
    }
  }

  static async updateLastLogin(id) {
    const db = await getDb();
    try {
      await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    } catch (error) {
      console.error('Update last login error:', error);
    }
  }

  static async getAllPending() {
    const db = await getDb();
    try {
      const results = await db.all(`
        SELECT id, first_name, surname, email, phone, address,
               date_of_birth, emergency_contact, interests, how_heard,
               created_at
        FROM users 
        WHERE is_approved = 0 AND is_active = 1
        ORDER BY created_at ASC
      `);
      return results.map(user => {
        let interests = [];
        if (user.interests) {
          try {
            interests = JSON.parse(user.interests);
          } catch {
            interests = [];
          }
        }
        return { ...user, interests };
      });
    } catch (error) {
      console.error('Get pending users error:', error);
      return [];
    }
  }

  static async getAllApproved() {
    const db = await getDb();
    try {
      return await db.all(`
        SELECT id, first_name, surname, email, phone, role,
               is_approved, created_at, last_login
        FROM users 
        WHERE is_approved = 1 AND is_active = 1
        ORDER BY created_at DESC
      `);
    } catch (error) {
      console.error('Get approved users error:', error);
      return [];
    }
  }

  static async comparePassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('Compare password error:', error);
      return false;
    }
  }

  static async delete(id) {
    const db = await getDb();
    try {
      await db.run('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      console.error('Delete user error:', error);
      return null;
    }
  }
}

module.exports = User;
