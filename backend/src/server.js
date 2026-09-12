const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const heroRoutes = require('./routes/heroRoutes');
const donationRoutes = require('./routes/donationRoutes');
const bankTransferRoutes = require('./routes/bankTransferRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { limiter, authLimiter, adminLimiter, uploadLimiter, donationLimiter } = require('./middleware/rateLimiter');
const { initializeDatabase } = require('./config/database');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (isProduction) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters in production.');
  }
  console.warn('⚠️ JWT_SECRET is not configured with a strong value; configure it before production.');
}

// ---------------------------------------------------------------------------
// CORS configuration
// Accepts a comma-separated list in FRONTEND_URL.
// Also automatically allows same-origin requests (no Origin header), and, in
// production, the canonical apex + www domains even if not explicitly listed.
// ---------------------------------------------------------------------------
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
if (isProduction && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set in production.');
}

const allowedOrigins = frontendUrl
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

const productionHostPattern = /^https?:\/\/(www\.)?alliance4growth\.org(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (!origin) return true; // same-origin / non-browser clients
  if (allowedOrigins.includes(origin)) return true;
  if (isProduction && productionHostPattern.test(origin)) return true;
  // Always allow localhost/127.0.0.1 for local dev convenience.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
}

if (process.env.TRUST_PROXY) {
  app.set(
    'trust proxy',
    Number.isNaN(Number(process.env.TRUST_PROXY))
      ? process.env.TRUST_PROXY
      : Number(process.env.TRUST_PROXY)
  );
}

app.disable('x-powered-by');

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  contentSecurityPolicy: isProduction ? {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "object-src": ["'none'"],
      "base-uri": ["'self'"],
      "frame-ancestors": ["'none'"]
    }
  } : false
}));

app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '1mb' }));

app.use('/api', limiter);
app.use('/api/auth', authLimiter);
app.use('/api/admin', adminLimiter);
app.use('/api/events', adminLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/registrations', adminLimiter);
app.use('/api/donations', donationLimiter);
app.use('/api/bank-transfer', donationLimiter);

// ---------------------------------------------------------------------------
// Uploaded files
// ---------------------------------------------------------------------------
const uploadDirectory = path.resolve(
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
);

app.use('/uploads', (req, res, next) => {
  // Reflect the request origin if allowed, otherwise fall back to the first
  // configured frontend URL. Reflects correctly for same-origin requests too.
  const requestOrigin = req.headers.origin;
  const allowOrigin = requestOrigin && isAllowedOrigin(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0] || '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static(uploadDirectory, { dotfiles: 'deny', fallthrough: false }));

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/content', heroRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/bank-transfer', bankTransferRoutes);

app.get('/health', async (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Frontend static serving
// The Vite build output is copied into backend/public/ at deploy time.
// If that directory is missing, the API-only root response is preserved.
// ---------------------------------------------------------------------------
const publicDir = path.resolve(__dirname, '..', 'public');
const publicIndex = path.join(publicDir, 'index.html');
const hasFrontend = fs.existsSync(publicIndex);

if (hasFrontend) {
  // Serve static assets (CSS, JS, images, favicon, etc.)
  app.use(express.static(publicDir, { dotfiles: 'deny', index: false }));

  // SPA fallback — any non-API, non-uploads, non-health GET returns index.html
  // so client-side routing works on hard refresh / deep links.
  app.get(/^\/(?!api\/|uploads\/|health$).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    res.sendFile(publicIndex, err => {
      if (err) next(err);
    });
  });

  console.log('✅ Frontend detected at', publicDir);
} else {
  // No frontend build present — keep the API-only root response.
  app.get('/', (req, res) => {
    res.json({ name: 'A4G Forth Valley API', status: 'online' });
  });
  console.log('ℹ️  No frontend build found at', publicDir, '— serving API only');
}

app.use(errorHandler);

async function start() {
  await initializeDatabase();

  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Alliance4Growth API listening on 127.0.0.1:${PORT} (${NODE_ENV})`);
    console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ') || '(none — same-origin only)'}`);
    if (isProduction) {
      console.log(`🌐 CORS also allowing: https://alliance4growth.org, https://www.alliance4growth.org`);
    }
  });

  const shutdown = signal => {
    console.log(`🛑 ${signal} received; shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

if (require.main === module) {
  start().catch(error => {
    console.error('❌ Startup failed:', error.message);
    process.exit(1);
  });
}

module.exports = app;