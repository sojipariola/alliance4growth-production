const Donation = require('../models/Donation');

const createDonation = async (req, res) => {
  // Never mark a card donation completed from an unverified API request.
  if (process.env.PAYMENTS_ENABLED !== 'true') {
    return res.status(503).json({ error: 'Online card donations are not configured. Please use bank transfer.' });
  }
  return res.status(501).json({ error: 'Online card payments require a verified payment-provider integration.' });
};

const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll(req.query);
    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getUserDonations = async (req, res) => {
  try {
    const donations = await Donation.findByUser(req.user.id);
    res.json(donations);
  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getDonationStats = async (req, res) => {
  try {
    const stats = await Donation.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const db = await require('../config/database').getDb();
    await db.run('UPDATE donations SET status = ? WHERE id = ?', [status, id]);
    
    const donation = await Donation.findById(id);
    res.json(donation);
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteDonation = async (req, res) => {
  try {
    await Donation.delete(req.params.id);
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getUserDonations,
  getDonationStats,
  updateDonation,
  deleteDonation
};
