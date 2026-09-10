const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { auth, admin } = require('../middleware/auth');
const upload = require('../config/multer');

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post('/', auth, admin, uploadFields, createEvent);
router.put('/:id', auth, admin, uploadFields, updateEvent);
router.delete('/:id', auth, admin, deleteEvent);

module.exports = router;
