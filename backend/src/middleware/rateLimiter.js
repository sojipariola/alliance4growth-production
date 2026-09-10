const rateLimit = require('express-rate-limit');

// General API rate limiter - 200 requests per minute
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Authentication rate limiter - 20 attempts per hour
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 20, // 20 attempts per hour
  message: { error: 'Too many authentication attempts, please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin API rate limiter - 300 requests per minute
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 300, // 300 requests per minute for admin
  message: { error: 'Too many admin requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Upload rate limiter - 50 uploads per minute
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 50, // 50 uploads per minute
  message: { error: 'Too many upload requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const donationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Too many donation requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});


module.exports = { limiter, authLimiter, adminLimiter, uploadLimiter, donationLimiter };


