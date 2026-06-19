const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const logger = require('./utils/logger');
const requestLogger = require('./middleware/logger');
const path = require('path');

dotenv.config()

if (process.env.NODE_ENV !== 'test') {
  require('./utils/validateEnv')();
}

const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Body parser with size limits
app.use(express.json({ 
  limit: '10kb', // Prevent large payload attacks
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb',
  parameterLimit: 100 // Limit number of parameters
}));

// CORS Configuration - MUST be before other middleware
// const cors = require('cors'); // Removed duplicate import
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['set-cookie']
}));

// Cookie parser (needed for CSRF)
app.use(cookieParser());

// Log all cookies in requests (for debugging in development)
app.use((req, res, next) => {
 if (req.cookies && Object.keys(req.cookies).length > 0) {
   logger.debug('Request cookies received', {
     cookieNames: Object.keys(req.cookies),
     path: req.path,
     cookies: req.cookies
   });
 }
 next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:5173"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from external sources
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  hidePoweredBy: true
}));

// RBAC middleware for admin-only endpoints
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Note: Advanced health check endpoint moved to after database initialization

// XSS Protection
app.use(xss())

// Rate limiting for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login/register attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by phone number if provided, otherwise by IP
    return req.body.phone || req.ip
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      path: req.path,
      ip: req.ip,
      phone: req.body.phone,
      limit: options.max
    });
    res.status(options.statusCode).json({
      success: false,
      error: options.message
    })
  }
})

// Rate limiting configuration - INCREASED for development
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 in dev, 100 in prod
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for local requests in development
    if (process.env.NODE_ENV === 'development') {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost');
    }
    return false;
  }
})

// Models import
const {
  User,
  Product,
  Category,
  Offer,
  Payment,
  Conversation,
  Message,
  sequelize,
  syncDatabase
} = require('./models');

// Test database connection
if (process.env.NODE_ENV !== 'test') {
  sequelize
    .authenticate()
    .then(() => {
      logger.info('Database connection established successfully');
      return syncDatabase();
    })
    .catch(err => {
      logger.error('Database connection failed', {
        error: err.message,
        stack: err.stack
      });
    });
}

// Import routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categories');
const offerRoutes = require('./routes/offers');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const messageRoutes = require('./routes/messageRoutes');
const { protect } = require('./middleware/auth');
const { getUnreadCount } = require('./controllers/messageController');

// CSRF Protection (after cookie-parser, before routes)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply CSRF to state-changing routes only (not GET)
app.use((req, res, next) => {
  // Skip CSRF protection entirely in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  // Skip CSRF for auth routes and CSRF token endpoint
  if (req.path.startsWith('/api/auth/') || req.path === '/api/csrf-token') {
    return next();
  }
  csrfProtection(req, res, next);
});

// Mount routes (health checks first - no rate limiting)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes); // Also available at /api/health for consistency

// Mount /api/auth/me first, without rate limiter
const authRoutesRaw = require('./routes/auth');
const authMeRouter = express.Router();
authMeRouter.get('/me', require('./middleware/auth').protect, require('./controllers/authController').getMe);
app.use('/api/auth/me', authMeRouter);
// Mount other /api/auth routes with rate limiter
app.use('/api/auth', process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next(), authRoutesRaw);
app.use('/api/products', process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next(), productRoutes);
app.use('/api/categories', process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next(), categoryRoutes);
app.use('/api/offers', process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next(), offerRoutes);
app.use('/api/payments', process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next(), paymentRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/messages', process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next(), messageRoutes);

// Add missing unread-count route for conversations
app.get('/api/conversations/unread-count', protect, getUnreadCount);

// Advanced health check (admin only) - now after database initialization
app.get('/api/health/details', requireRole('admin'), async (req, res) => {
  let dbStatus = 'unknown';
  try {
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error';
  }
  res.status(200).json({
    status: 'ok',
    db: dbStatus,
    cache: 'not implemented',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Liberia Marketplace API 🇱🇷 (Claude)',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      dashboard: '/api/dashboard',
      offers: '/api/offers',
      payments: '/api/payments',
      messages: '/api/messages',
      health: '/api/health'
    }
  });
});

// CSP Violation Report Endpoint
app.post('/api/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }), (req, res) => {
  logger.warn('CSP Violation detected', {
    violation: req.body['csp-report'] || req.body,
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });
  res.status(204).send();
});

// CSRF token endpoint - NO CSRF protection needed (bootstrap endpoint)
app.get('/api/csrf-token', (req, res, next) => {
  // Apply CSRF protection to generate token
  csrfProtection(req, res, (err) => {
    if (err) return next(err);
    // Send token in JSON and cookie
    res.cookie('csrfToken', req.csrfToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.status(200).json({ csrfToken: req.csrfToken() });
  });
});

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error occurred', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    sql: err.sql,
    original: err.original,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry for unique field'
    });
  }
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Database error: ' + err.message
    });
  }
  res.status(statusCode).json({
    success: false,
    error: message
  });
});

// 404 handler - MUST be last route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

// Setup storage directories on startup

// Only start server if this file is run directly
if (require.main === module) {
  const { setupStorageDirectories } = require('./utils/setupStorage');

  setupStorageDirectories()
    .then(() => {
      app.listen(PORT, () => {
        logger.info(`🚀 Server running on port ${PORT}`);
        logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
        logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
      });
    })
    .catch((error) => {
      logger.error('Failed to setup storage directories', { error: error.message });
      process.exit(1);
    });
}

module.exports = app;