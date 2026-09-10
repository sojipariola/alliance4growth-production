const User = require('../models/User');
const Event = require('../models/Event');
const { getDb } = require('../config/database');

const getPendingUsers = async (req, res) => {
  try {
    const users = await User.getAllPending();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.updateApproval(req.params.id, true);
    res.json({ message: 'User approved', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User rejected and removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllApproved();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const db = await getDb();
    
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const pendingUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE is_approved = 0 AND is_active = 1');
    const totalEvents = await db.get('SELECT COUNT(*) as count FROM events WHERE is_active = 1');
    const totalRegistrations = await db.get('SELECT COUNT(*) as count FROM event_registrations WHERE status = "registered"');
    
    res.json({
      totalUsers: totalUsers.count,
      pendingUsers: pendingUsers.count,
      totalEvents: totalEvents.count,
      totalRegistrations: totalRegistrations.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPendingUsers, approveUser, rejectUser, getAllUsers, getStats };
