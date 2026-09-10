const errorHandler = (err, req, res, next) => {
  console.error('Request error:', err.message);
  if (err.message === 'Origin not allowed by CORS') return res.status(403).json({ error: 'Origin not allowed' });
  if (err.name === 'ValidationError' || err.name === 'MulterError') return res.status(400).json({ error: err.message });
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Invalid or expired token' });
  if (String(err.message).includes('SQLITE_CONSTRAINT_UNIQUE')) return res.status(409).json({ error: 'Duplicate entry' });
  res.status(500).json({ error: 'Internal server error' });
};
module.exports = { errorHandler };
