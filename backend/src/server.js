const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const ratingRoutes = require('./routes/ratings')

// Import middleware
const errorHandler = require('./middleware/errorHandler')
const notFound = require('./middleware/notFound')

const app = express()
const PORT = process.env.PORT || 5000

// Database setup
const { testConnection, syncDatabase } = require('./config/database')

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// --- Replace previous single-origin CORS with allowlist support ---
// Read comma-separated origins from env, fallback to FRONTEND_URL or localhost dev
const rawAllowList = process.env.FRONTEND_ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173'
const allowedOrigins = rawAllowList.split(',').map(s => s.trim()).filter(Boolean)
console.log('[CORS] Allowed origins:', allowedOrigins)

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser requests (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true)

    // permit all if wildcard specified
    if (allowedOrigins.includes('*')) return callback(null, true)

    // exact match allowlist
    if (allowedOrigins.includes(origin)) return callback(null, true)

    // not allowed
    return callback(new Error(`CORS policy: Origin ${origin} not allowed`), false)
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS']
}

app.use(cors(corsOptions))
// ensure OPTIONS preflight handled
app.options('*', cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression middleware
app.use(compression())

// Logging middleware
app.use(morgan('combined'))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'LibMarket API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/ratings', ratingRoutes)

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'))

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LibMarket API',
    version: '1.0.0',
    documentation: '/api/docs',
    status: 'active'
  })
})

// Error handling middleware (must be last)
app.use(notFound)
app.use(errorHandler)

// Start server with database initialization
const startServer = async () => {
  try {
    // Test database connection
    await testConnection()

    // Sync database models
    await syncDatabase()

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 LibMarket API Server running on port ${PORT}`)
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer()
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...')
  process.exit(0)
})

module.exports = app