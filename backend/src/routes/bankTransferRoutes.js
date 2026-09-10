const express = require('express');
const router = express.Router();
const {
  getBankDetails,
  recordBankTransfer,
  confirmBankTransfer,
  rejectBankTransfer
} = require('../controllers/bankTransferController');
const { auth, admin } = require('../middleware/auth');

// Public route - get bank details
router.get('/details', getBankDetails);

// Record a bank transfer (authenticated or guest)
router.post('/record', recordBankTransfer);

// Admin routes - confirm/reject bank transfers
router.put('/confirm/:id', auth, admin, confirmBankTransfer);
router.put('/reject/:id', auth, admin, rejectBankTransfer);

module.exports = router;
