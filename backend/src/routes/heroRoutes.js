const express = require('express');
const router = express.Router();
const {
  getHeroImages,
  getActiveHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
  setActiveHeroImage,
  uploadHeroImages
} = require('../controllers/heroController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../config/multer');

// Public routes (no auth needed)
router.get('/hero/active', getActiveHeroImages);

// Admin routes
router.get('/hero', auth, admin, getHeroImages);
router.post('/hero', auth, admin, upload.single('hero'), createHeroImage);
router.post('/hero/upload', auth, admin, upload.array('hero', 10), uploadHeroImages);
router.put('/hero/:id', auth, admin, updateHeroImage);
router.put('/hero/:id/active', auth, admin, setActiveHeroImage);
router.delete('/hero/:id', auth, admin, deleteHeroImage);

module.exports = router;
