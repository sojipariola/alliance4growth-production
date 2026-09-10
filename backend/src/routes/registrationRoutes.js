const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  checkRegistration,
  getUserRegistrations,
  getEventRegistrations
} = require('../controllers/registrationController');
const { auth, admin, approved } = require('../middleware/auth');

// All registration routes require authentication
router.use(auth, approved);

// Check registration status
router.get('/check', checkRegistration);

// Get user's registrations
router.get('/my', getUserRegistrations);

// Register for an event
router.post('/', registerForEvent);

// Cancel registration
router.delete('/:eventId', cancelRegistration);

// Get all registrations for an event (admin only)
router.get('/event/:eventId', admin, getEventRegistrations);

module.exports = router;
