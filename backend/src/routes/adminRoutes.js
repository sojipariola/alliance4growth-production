const express = require('express');
const router = express.Router();
const { getPendingUsers, approveUser, rejectUser, getAllUsers, getStats } = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');

router.use(auth, admin);
router.get('/users/pending', getPendingUsers);
router.get('/users/all', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.delete('/users/:id/reject', rejectUser);
router.get('/stats', getStats);

module.exports = router;
