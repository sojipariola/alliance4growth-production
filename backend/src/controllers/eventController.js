const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');

const createEvent = async (req, res) => {
  try {
    console.log('📝 Creating event...');
    console.log('👤 User ID:', req.user.id);
    
    const eventData = { 
      ...req.body, 
      created_by: req.user.id 
    };
    
    // Handle uploaded files
    if (req.files) {
      console.log('📎 Files received:', Object.keys(req.files));
      
      if (req.files.image) {
        const imageFile = req.files.image[0];
        // Store with correct path: /uploads/events/filename
        eventData.image_url = `/uploads/events/${imageFile.filename}`;
        console.log('🖼️ Main image saved:', eventData.image_url);
      }
      
      if (req.files.gallery) {
        const galleryUrls = req.files.gallery.map(file => 
          `/uploads/gallery/${file.filename}`
        );
        eventData.gallery_images = galleryUrls;
        console.log('🖼️ Gallery images saved:', galleryUrls);
      }
    }
    
    // Validate required fields
    if (!eventData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!eventData.start_date && !eventData.event_date) {
      return res.status(400).json({ error: 'Start date or event date is required' });
    }
    if (!eventData.category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    // If no start_date but event_date is provided (for past events)
    if (!eventData.start_date && eventData.event_date) {
      eventData.start_date = `${eventData.event_date}T00:00:00`;
    }
    
    console.log('📦 Final event data:', JSON.stringify(eventData, null, 2));
    
    const event = await Event.create(eventData);
    
    if (!event) {
      console.error('❌ Event creation returned null');
      return res.status(500).json({ error: 'Failed to create event - database returned null' });
    }
    
    console.log('✅ Event created successfully:', event.id);
    console.log('✅ Image URL:', event.image_url);
    res.status(201).json(event);
  } catch (error) {
    console.error('❌ Create event error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to create event',
      details: error.stack 
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const filters = req.query;
    const events = await Event.findAll(filters);
    res.json(events || []);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventData = { ...req.body };
    
    if (req.files) {
      if (req.files.image) {
        const imageFile = req.files.image[0];
        eventData.image_url = `/uploads/events/${imageFile.filename}`;
        console.log('🖼️ Main image updated:', eventData.image_url);
      }
      if (req.files.gallery) {
        const galleryUrls = req.files.gallery.map(file => 
          `/uploads/gallery/${file.filename}`
        );
        eventData.gallery_images = galleryUrls;
        console.log('🖼️ Gallery images updated:', galleryUrls);
      }
    }
    
    const event = await Event.update(req.params.id, eventData);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      if (event.image_url) {
        const filePath = path.join(path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')), event.image_url.replace(/^\/uploads\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      }
      if (event.gallery_images && event.gallery_images.length > 0) {
        event.gallery_images.forEach(img => {
          const filePath = path.join(path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')), img.replace(/^\/uploads\//, ''));
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted: ${filePath}`);
          }
        });
      }
    }
    
    await Event.delete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createEvent, getEvents, getEvent, updateEvent, deleteEvent };
