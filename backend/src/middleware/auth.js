const jwt = require('jsonwebtoken')
const { User } = require('../models')

// Protect routes - require valid JWT token
const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from database
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        })
      }

      // Add user to request
      req.user = user
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error in authentication'
    })
  }
}

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate first.'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      })
    }

    next()
  }
}

// Optional authentication - sets req.user if token is valid, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        })

        if (user) {
          req.user = user
        }
      } catch (error) {
        // Invalid token, but continue without user
        console.log('Invalid token in optional auth:', error.message)
      }
    }

    next()
  } catch (error) {
    next()
  }
}

module.exports = {
  protect,
  authorize,
  optionalAuth
}