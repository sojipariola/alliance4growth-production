const { getDb } = require('../config/database');

class HeroImage {
  static async create(imageData) {
    const db = await getDb();
    
    const {
      url,
      title,
      subtitle,
      order = 0,
      is_active = 0
    } = imageData;

    const query = `
      INSERT INTO hero_images (
        url, title, subtitle, order_index, is_active
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      url, title, subtitle, order, is_active
    ]);

    if (result.lastID) {
      return await this.findById(result.lastID);
    }
    return null;
  }

  static async findById(id) {
    const db = await getDb();
    return await db.get('SELECT * FROM hero_images WHERE id = ?', [id]);
  }

  static async findAll() {
    const db = await getDb();
    return await db.all('SELECT * FROM hero_images ORDER BY order_index ASC, id ASC');
  }

  static async getActive() {
    const db = await getDb();
    return await db.all('SELECT * FROM hero_images WHERE is_active = 1 ORDER BY order_index ASC');
  }

  static async update(id, updates) {
    const db = await getDb();
    const allowedFields = ['title', 'subtitle', 'order_index', 'is_active'];
    
    const fields = allowedFields.filter(field => updates[field] !== undefined);
    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updates[field]);
    values.push(id);

    await db.run(`
      UPDATE hero_images 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    
    return await this.findById(id);
  }

  static async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM hero_images WHERE id = ?', [id]);
    return { id };
  }

  static async setActive(id) {
    const db = await getDb();
    // This method is no longer used - we use update() instead
    return await this.findById(id);
  }
}

module.exports = HeroImage;
