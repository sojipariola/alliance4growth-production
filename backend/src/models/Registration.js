const { getDb } = require('../config/database');

class Registration {
  static async create(userId, eventId, registrationData = {}) {
    const db = await getDb();
    
    const {
      full_name,
      phone,
      address,
      emergency_contact,
      special_requirements
    } = registrationData;
    
    // Check if already registered
    const existing = await db.get(
      'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ? AND status = "registered"',
      [userId, eventId]
    );
    
    if (existing) {
      throw new Error('Already registered for this event');
    }
    
    // Check if event has capacity
    const event = await db.get(
      'SELECT max_attendees FROM events WHERE id = ? AND is_active = 1',
      [eventId]
    );
    
    if (event && event.max_attendees) {
      const count = await db.get(
        'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = "registered"',
        [eventId]
      );
      
      if (count.count >= event.max_attendees) {
        throw new Error('Event is full');
      }
    }
    
    const query = `
      INSERT INTO event_registrations (
        user_id, 
        event_id, 
        full_name, 
        phone, 
        address, 
        emergency_contact, 
        special_requirements
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await db.run(query, [
      userId, 
      eventId, 
      full_name || null,
      phone || null,
      address || null,
      emergency_contact || null,
      special_requirements || null
    ]);
    
    return await this.findById(result.lastID);
  }

  static async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT er.*, 
             u.first_name || ' ' || u.surname as user_name,
             u.email as user_email,
             e.title as event_title
      FROM event_registrations er
      LEFT JOIN users u ON er.user_id = u.id
      LEFT JOIN events e ON er.event_id = e.id
      WHERE er.id = ?
    `, [id]);
  }

  static async findByUserAndEvent(userId, eventId) {
    const db = await getDb();
    return await db.get(
      'SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ? AND status = "registered"',
      [userId, eventId]
    );
  }

  static async findByUser(userId) {
    const db = await getDb();
    return await db.all(`
      SELECT er.*, e.title, e.start_date, e.location, e.category
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ? AND er.status = "registered"
      ORDER BY e.start_date ASC
    `, [userId]);
  }

  static async findByEvent(eventId) {
    const db = await getDb();
    return await db.all(`
      SELECT er.*, 
             u.first_name || ' ' || u.surname as user_name, 
             u.email,
             u.phone as user_phone
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id
      WHERE er.event_id = ? AND er.status = "registered"
    `, [eventId]);
  }

  static async cancel(userId, eventId) {
    const db = await getDb();
    const result = await db.run(
      'UPDATE event_registrations SET status = "cancelled" WHERE user_id = ? AND event_id = ? AND status = "registered"',
      [userId, eventId]
    );
    return result.changes > 0;
  }

  static async getCount(eventId) {
    const db = await getDb();
    const result = await db.get(
      'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = "registered"',
      [eventId]
    );
    return result ? result.count : 0;
  }
}

module.exports = Registration;
