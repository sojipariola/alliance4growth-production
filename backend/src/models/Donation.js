const { getDb } = require('../config/database');

class Donation {
  static async create(donationData) {
    console.log('📝 [MODEL] Creating donation...');
    console.log('📦 [MODEL] Data:', JSON.stringify(donationData, null, 2));
    
    try {
      const db = await getDb();
      console.log('✅ [MODEL] Database connection acquired');
      
      const {
        user_id,
        amount,
        currency = 'GBP',
        donor_name,
        donor_email,
        donor_phone,
        message,
        anonymous = 0,
        status = 'completed',
        payment_method = 'card',
        payment_id,
        transaction_id
      } = donationData;

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid donation amount');
      }

      // Generate a simple ID manually since SQLite's lastID doesn't work with randomblob
      const id = 'donation_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      const query = `
        INSERT INTO donations (
          id, user_id, amount, currency, donor_name, donor_email,
          donor_phone, message, anonymous, status,
          payment_method, payment_id, transaction_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        id,
        user_id || null,
        parseFloat(amount),
        currency || 'GBP',
        donor_name || null,
        donor_email || null,
        donor_phone || null,
        message || null,
        anonymous ? 1 : 0,
        status || 'pending',
        payment_method || 'card',
        payment_id || null,
        transaction_id || null
      ];

      console.log('🔍 [MODEL] Executing SQL with values:', values);

      // Execute the insert
      const result = await db.run(query, values);
      console.log('✅ [MODEL] Insert result:', result);
      
      // Get the inserted donation using the ID we generated
      console.log(`🔍 [MODEL] Getting donation with ID: ${id}`);
      const donation = await db.get('SELECT * FROM donations WHERE id = ?', [id]);
      console.log('📦 [MODEL] Retrieved donation:', donation);
      
      if (!donation) {
        console.error('❌ [MODEL] Failed to retrieve donation with ID:', id);
        return null;
      }
      
      return donation;
    } catch (error) {
      console.error('❌ [MODEL] Database error:', error);
      console.error('❌ [MODEL] Error stack:', error.stack);
      throw error;
    }
  }

  static async findById(id) {
    const db = await getDb();
    try {
      const result = await db.get(`
        SELECT d.*, 
               u.first_name || ' ' || u.surname as user_name,
               u.email as user_email
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.id = ?
      `, [id]);
      return result;
    } catch (error) {
      console.error('Find by id error:', error);
      return null;
    }
  }

  static async findAll(filters = {}) {
    const db = await getDb();
    try {
      let query = `
        SELECT d.*, 
               u.first_name || ' ' || u.surname as user_name,
               u.email as user_email
        FROM donations d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE 1=1
      `;
      
      const conditions = [];
      const values = [];

      if (filters.status) {
        conditions.push(`d.status = ?`);
        values.push(filters.status);
      }

      if (filters.user_id) {
        conditions.push(`d.user_id = ?`);
        values.push(filters.user_id);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ` ORDER BY d.created_at DESC`;

      return await db.all(query, values);
    } catch (error) {
      console.error('Find all error:', error);
      return [];
    }
  }

  static async findByUser(userId) {
    const db = await getDb();
    try {
      return await db.all(`
        SELECT * FROM donations
        WHERE user_id = ? AND status = 'completed'
        ORDER BY created_at DESC
      `, [userId]);
    } catch (error) {
      console.error('Find by user error:', error);
      return [];
    }
  }

  static async getStats() {
    const db = await getDb();
    try {
      const totalDonations = await db.get(
        'SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = "completed"'
      );
      
      const pendingDonations = await db.get(
        'SELECT COUNT(*) as count FROM donations WHERE status = "pending"'
      );
      
      return {
        total_donations: totalDonations?.count || 0,
        total_amount: totalDonations?.total || 0,
        pending_count: pendingDonations?.count || 0
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        total_donations: 0,
        total_amount: 0,
        pending_count: 0
      };
    }
  }

  static async delete(id) {
    const db = await getDb();
    try {
      await db.run('DELETE FROM donations WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      console.error('Delete error:', error);
      return null;
    }
  }
}

module.exports = Donation;
