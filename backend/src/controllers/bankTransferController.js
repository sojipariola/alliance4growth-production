const Donation = require('../models/Donation');

// Bank details are supplied through protected server environment variables.
const getBankDetailsFromEnv = () => {
  const required = ['BANK_NAME', 'BANK_ACCOUNT_NAME', 'BANK_ACCOUNT_NUMBER', 'BANK_SORT_CODE'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) return null;
  return {
    bankName: process.env.BANK_NAME,
    accountName: process.env.BANK_ACCOUNT_NAME,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER,
    sortCode: process.env.BANK_SORT_CODE,
    swiftCode: process.env.BANK_SWIFT_CODE || undefined,
    iban: process.env.BANK_IBAN || undefined,
    instructions: process.env.BANK_INSTRUCTIONS || 'Please use the supplied reference when making your donation.'
  };
};

// Get bank transfer details (public)
const getBankDetails = async (req, res) => {
  try {
    const bankDetails = getBankDetailsFromEnv();
    if (!bankDetails) return res.status(503).json({ error: 'Bank transfer donations are not configured yet.' });

    // Generate a unique reference for the user
    const ref = 'A4G-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    res.json({
      ...bankDetails,
      reference: ref
    });
  } catch (error) {
    console.error('Get bank details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Record a bank transfer donation (user initiates)
const recordBankTransfer = async (req, res) => {
  try {
    console.log('📝 Recording bank transfer...');
    // Do not log donor PII or donation details.
    
    const {
      amount,
      donor_name,
      donor_email,
      donor_phone,
      message,
      reference
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }
    if (!donor_name || donor_name.trim().length < 2) {
      return res.status(400).json({ error: 'Donor name is required' });
    }
    if (!donor_email || !donor_email.includes('@')) {
      return res.status(400).json({ error: 'Valid donor email is required' });
    }

    const bankDetails = getBankDetailsFromEnv();
    if (!bankDetails) return res.status(503).json({ error: 'Bank transfer donations are not configured yet.' });

    // Generate a transaction ID
    const transactionId = 'BANK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const donationData = {
      user_id: req.user?.id || null,
      amount: parseFloat(amount),
      currency: 'GBP',
      donor_name: donor_name.trim(),
      donor_email: donor_email.trim(),
      donor_phone: donor_phone || null,
      message: message || null,
      status: 'pending', // Admin will confirm manually
      payment_method: 'bank_transfer',
      transaction_id: reference || transactionId
    };


    const donation = await Donation.create(donationData);

    if (!donation) {
      return res.status(500).json({ error: 'Failed to record donation' });
    }

    res.status(201).json({
      message: 'Bank transfer recorded. Please send the payment to the bank details provided. We will confirm your donation once we receive it.',
      donation: {
        id: donation.id,
        amount: donation.amount,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        status: donation.status,
        reference: donation.transaction_id,
        created_at: donation.created_at
      },
      bankDetails: { ...bankDetails, reference: donation.transaction_id }
    });
  } catch (error) {
    console.error('❌ Record bank transfer error:', error);
    res.status(500).json({ error: 'Failed to record donation' });
  }
};

// Confirm bank transfer (admin only)
const confirmBankTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await require('../config/database').getDb();
    
    const result = await db.run(
      'UPDATE donations SET status = "completed", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Donation not found or already confirmed' });
    }

    const donation = await Donation.findById(id);
    res.json({ 
      message: 'Bank transfer confirmed successfully',
      donation 
    });
  } catch (error) {
    console.error('Confirm bank transfer error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Reject bank transfer (admin only)
const rejectBankTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await require('../config/database').getDb();
    
    const result = await db.run(
      'UPDATE donations SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"',
      [id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Donation not found or already processed' });
    }

    res.json({ message: 'Bank transfer rejected' });
  } catch (error) {
    console.error('Reject bank transfer error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBankDetails,
  recordBankTransfer,
  confirmBankTransfer,
  rejectBankTransfer
};
