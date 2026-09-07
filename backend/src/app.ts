import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { initDatabase } from './config/database.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Global Rate Limiter (Protects against DDoS / mass scraping)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// 3. Strict Rate Limiting for Auth & Uploads
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/admin/auth', authLimiter);
app.use('/api/teams/auth', authLimiter);
app.use('/api/jury/auth', authLimiter);

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload rate limit exceeded.' },
});
app.use('/api/upload', uploadLimiter);

// 4. Body parsers with safe payload limits
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// 5. Secure CORS Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  let isAllowed = false;

  if (!origin) {
    isAllowed = true;
  } else {
    const originLower = origin.toLowerCase();
    const isLocalhost =
      originLower.startsWith('http://localhost:') ||
      originLower.startsWith('http://127.0.0.1:') ||
      originLower.includes('.vercel.app');

    if (isLocalhost || allowedOrigins.includes(originLower) || allowedOrigins.length === 0) {
      isAllowed = true;
    }
  }

  if (origin && isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, x-admin-secret, x-access-code, x-admin-email, x-jury-email'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Request logging (skip noisy health probes)
app.use((req, res, next) => {
  if (req.url === '/health' || req.url === '/api/health' || req.url === '/' || req.url.startsWith('/api/live-status')) {
    return next();
  }
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Initialize database tables BEFORE any route is hit
initDatabase().catch((err) => {
  logger.error({ err }, 'Failed to initialize database');
});

// Health check & base status
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Origin Hackathon Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
