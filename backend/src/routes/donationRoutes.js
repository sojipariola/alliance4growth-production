const express = require('express');
const router = express.Router();
const {
  createDonation,
  getAllDonations,
  getUserDonations,
  getDonationStats,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');
const { auth, admin } = require('../middleware/auth');

// Public route - anyone can donate
router.post('/', createDonation);

// Authenticated routes
router.get('/my', auth, getUserDonations);

// Admin routes
router.get('/', auth, admin, getAllDonations);
router.get('/stats', auth, admin, getDonationStats);
router.put('/:id', auth, admin, updateDonation);
router.delete('/:id', auth, admin, deleteDonation);

module.exports = router;
