const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()

// Trust proxy
app.set('trust proxy', 1)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parser
app.use(cookieParser())

// CORS
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}))

// Handle preflight requests
app.options('*', cors())

// Security Headers - Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        process.env.NODE_ENV === 'development' ? "'unsafe-inline'" : null,
        process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : null,
      ].filter(Boolean),
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: [
        "'self'",
        'http://localhost:5173',
        'http://localhost:5000',
        'ws://localhost:5173',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
    reportOnly: process.env.NODE_ENV === 'development',
  },
}))

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
    console.warn(`⚠️ Rate limit exceeded for ${req.path} - IP: ${req.ip}, Phone: ${req.body.phone}`)
    res.status(options.statusCode).json({
      success: false,
      error: options.message
    })
  }
})

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour per IP
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

// Import models
const { sequelize, syncDatabase } = require('./models')

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected')
    return syncDatabase()
  })
  .catch(err => console.error('❌ Database connection error:', err))

// Import routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const dashboardRoutes = require('./routes/dashboard')
const jobRoutes = require('./routes/jobs')
const notificationRoutes = require('./routes/notifications')
const messageRoutes = require('./routes/messages')
const testRoutes = require('./routes/test')

// Mount routes WITHOUT rate limiters first (they're applied in the routes themselves)
app.use('/api/test', testRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', apiLimiter, dashboardRoutes)
app.use('/api/products', apiLimiter, productRoutes)
app.use('/api/categories', apiLimiter, categoryRoutes)
app.use('/api/jobs', apiLimiter, jobRoutes)
app.use('/api/notifications', apiLimiter, notificationRoutes)
app.use('/api/messages', apiLimiter, messageRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' })
})

// Root
app.get('/', (req, res) => {
  res.redirect('/api/test')
})

// CSP Violation Report Endpoint
app.post('/api/csp-report', express.json({ type: ['application/json', 'application/csp-report'] }), (req, res) => {
  console.warn('🚨 CSP Violation:', req.body['csp-report'] || req.body)
  res.status(204).send()
})

// Error handler
app.use((err, req, res, next) => {
  // Log full error details
  console.error('❌ Server Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    sql: err.sql,
    original: err.original
  });

  const statusCode = err.statusCode || 500
  const message = err.message || 'Server Error'

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message)
    return res.status(400).json({
      success: false,
      error: messages.join(', ')
    })
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry for unique field'
    })
  }

  // Handle Sequelize database errors
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      error: 'Database error: ' + err.message
    })
  }

  res.status(statusCode).json({
    success: false,
    error: message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  })
})

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

module.exports = app