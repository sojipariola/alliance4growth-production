const { getDb } = require('../config/database');

class Event {
  static async create(eventData) {
    const db = await getDb();
    
    const {
      title,
      description,
      category,
      event_type,
      start_date,
      end_date,
      location,
      max_attendees,
      image_url,
      gallery_images,
      is_past = 0,
      event_date,
      created_by
    } = eventData;

    console.log('📝 Creating event in database with:', {
      title,
      description: description ? description.substring(0, 50) + '...' : null,
      category,
      event_type,
      start_date,
      location,
      max_attendees,
      image_url,
      gallery_images: gallery_images ? gallery_images.length : 0,
      created_by
    });

    // Convert gallery_images array to JSON string
    let galleryJson = null;
    if (gallery_images && Array.isArray(gallery_images) && gallery_images.length > 0) {
      galleryJson = JSON.stringify(gallery_images);
    }

    const query = `
      INSERT INTO events (
        title, description, category, event_type,
        start_date, end_date, location, max_attendees,
        image_url, gallery_images, is_past, event_date, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title || 'Untitled Event',
      description || null,
      category || 'General',
      event_type || 'one-off',
      start_date || new Date().toISOString(),
      end_date || null,
      location || null,
      max_attendees ? parseInt(max_attendees) : null,
      image_url || null,
      galleryJson,
      is_past ? 1 : 0,
      event_date || null,
      created_by || null
    ];

    try {
      const result = await db.run(query, values);
      
      if (result.lastID) {
        const event = await this.findById(result.lastID);
        return event;
      }
      return null;
    } catch (error) {
      console.error('❌ Database insert error:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  static async findById(id) {
    const db = await getDb();
    try {
      const result = await db.get(`
        SELECT e.*, 
               u.first_name || ' ' || u.surname as created_by_name,
               (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registered_count
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        WHERE e.id = ? AND e.is_active = 1
      `, [id]);
      
      if (result && result.gallery_images) {
        try {
          result.gallery_images = JSON.parse(result.gallery_images);
        } catch {
          result.gallery_images = result.gallery_images.split(',').filter(url => url.trim());
        }
      }
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
        SELECT e.*,
               (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id AND status = 'registered') as registered_count
        FROM events e
        WHERE e.is_active = 1
      `;
      
      const conditions = [];
      const values = [];

      if (filters.category) {
        conditions.push(`e.category = ?`);
        values.push(filters.category);
      }

      if (filters.event_type) {
        conditions.push(`e.event_type = ?`);
        values.push(filters.event_type);
      }

      if (filters.is_past !== undefined) {
        conditions.push(`e.is_past = ?`);
        values.push(parseInt(filters.is_past));
      }

      if (filters.upcoming) {
        conditions.push(`datetime(e.start_date) >= datetime('now') AND e.is_past = 0`);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }
      
      const order = filters.is_past ? 'DESC' : 'ASC';
      query += ` ORDER BY datetime(e.start_date) ${order}`;

      if (filters.limit) {
        query += ` LIMIT ?`;
        values.push(parseInt(filters.limit));
      }

      const results = await db.all(query, values);
      
      return results.map(event => {
        let galleryImages = [];
        if (event.gallery_images) {
          try {
            galleryImages = JSON.parse(event.gallery_images);
          } catch {
            galleryImages = event.gallery_images.split(',').filter(url => url.trim());
          }
        }
        return {
          ...event,
          gallery_images: galleryImages,
          registered_count: event.registered_count || 0
        };
      });
    } catch (error) {
      console.error('Find all error:', error);
      throw error;
    }
  }

  static async update(id, updates) {
    const db = await getDb();
    try {
      const allowedFields = [
        'title', 'description', 'category', 'event_type',
        'start_date', 'end_date', 'location', 'max_attendees',
        'image_url', 'is_past', 'event_date'
      ];
      
      let galleryJson = null;
      if (updates.gallery_images !== undefined) {
        const images = Array.isArray(updates.gallery_images) 
          ? updates.gallery_images 
          : (updates.gallery_images ? updates.gallery_images.split(',') : []);
        galleryJson = JSON.stringify(images.filter(url => url && url.trim()));
      }
      
      const fields = allowedFields.filter(field => updates[field] !== undefined);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      
      if (galleryJson !== null) {
        const galleryClause = fields.length > 0 ? ', gallery_images = ?' : 'gallery_images = ?';
        const finalSetClause = fields.length > 0 ? setClause + galleryClause : galleryClause;
        values.push(galleryJson);
        values.push(id);
        
        await db.run(`
          UPDATE events 
          SET ${finalSetClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND is_active = 1
        `, values);
      } else if (fields.length > 0) {
        values.push(id);
        await db.run(`
          UPDATE events 
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND is_active = 1
        `, values);
      } else {
        return null;
      }
      
      return await this.findById(id);
    } catch (error) {
      console.error('Update error:', error);
      return null;
    }
  }

  static async delete(id) {
    const db = await getDb();
    try {
      await db.run('UPDATE events SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
      return { id };
    } catch (error) {
      console.error('Delete error:', error);
      return null;
    }
  }

  static async getRegistrationCount(eventId) {
    const db = await getDb();
    try {
      const result = await db.get(
        'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND status = "registered"',
        [eventId]
      );
      return result ? result.count : 0;
    } catch (error) {
      console.error('Get registration count error:', error);
      return 0;
    }
  }
}

module.exports = Event;
