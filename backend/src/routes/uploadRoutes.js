const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { auth, admin } = require('../middleware/auth');

router.post('/upload', auth, admin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    url: `/uploads/events/${req.file.filename}`,
    filename: req.file.filename,
    message: 'File uploaded successfully'
  });
});

router.post('/upload/gallery', auth, admin, upload.array('gallery', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  const urls = req.files.map(file => `/uploads/gallery/${file.filename}`);
  res.json({ urls, count: urls.length, message: `${urls.length} file(s) uploaded successfully` });
});

module.exports = router;
