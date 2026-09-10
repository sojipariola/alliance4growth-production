const HeroImage = require('../models/HeroImage');
const fs = require('fs');
const path = require('path');

const getHeroImages = async (req, res) => {
  try {
    const images = await HeroImage.findAll();
    res.json(images || []);
  } catch (error) {
    console.error('Get hero images error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getActiveHeroImages = async (req, res) => {
  try {
    const images = await HeroImage.getActive();
    res.json(images || []);
  } catch (error) {
    console.error('Get active hero images error:', error);
    res.status(500).json({ error: error.message });
  }
};

const createHeroImage = async (req, res) => {
  try {
    const { title, subtitle, order } = req.body;
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/hero/${req.file.filename}`;
    }

    const imageData = {
      url: imageUrl,
      title: title || 'Hero Image',
      subtitle: subtitle || '',
      order: order || 0,
      is_active: 0
    };

    const image = await HeroImage.create(imageData);
    res.status(201).json(image);
  } catch (error) {
    console.error('Create hero image error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const image = await HeroImage.update(id, updates);
    if (!image) {
      return res.status(404).json({ error: 'Hero image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Update hero image error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get image to delete file
    const image = await HeroImage.findById(id);
    if (image && image.url && image.url.startsWith('/uploads/')) {
      const filePath = path.join(path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')), image.url.replace(/^\/uploads\//, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted hero image: ${filePath}`);
      }
    }
    
    await HeroImage.delete(id);
    res.json({ message: 'Hero image deleted' });
  } catch (error) {
    console.error('Delete hero image error:', error);
    res.status(500).json({ error: error.message });
  }
};

const setActiveHeroImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    // Update just this image's active status
    const image = await HeroImage.update(id, { is_active: active ? 1 : 0 });
    if (!image) {
      return res.status(404).json({ error: 'Hero image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Set active hero image error:', error);
    res.status(500).json({ error: error.message });
  }
};

const uploadHeroImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const imageData = {
        url: `/uploads/hero/${file.filename}`,
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        subtitle: '',
        order: 0,
        is_active: 0
      };
      
      const image = await HeroImage.create(imageData);
      uploadedImages.push(image);
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
      count: uploadedImages.length
    });
  } catch (error) {
    console.error('Upload hero images error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHeroImages,
  getActiveHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
  setActiveHeroImage,
  uploadHeroImages
};
