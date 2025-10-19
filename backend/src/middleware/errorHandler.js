const util = require('util')

const errorHandler = (err, req, res, next) => {
  // Log minimal stack line for quick debugging
  console.error('Error:', err && err.stack ? err.stack.split('\n')[0] : err && err.message ? err.message : String(err))

  // Default error
  let error = { ...err }
  error.message = err.message

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found'
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = { message, statusCode: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = { message, statusCode: 401 }
  }

  // Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ')
    error = { message, statusCode: 400 }
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered'
    error = { message, statusCode: 400 }
  }

  if (err.name === 'SequelizeDatabaseError') {
    // Avoid serializing the entire error object (can be huge/circular).
    console.error('SequelizeDatabaseError message:', err.message)
    console.error('Sequelize error (inspected):', util.inspect(err, { depth: 2, maxArrayLength: 10 }))
    const message = process.env.NODE_ENV === 'development'
      ? `Database error: ${err.message}`
      : 'Database error occurred'
    error = { message, statusCode: 500 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack ? err.stack.split('\n')[0] : undefined })
  })
}

module.exports = errorHandler