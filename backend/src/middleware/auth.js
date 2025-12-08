const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    logger.debug('Auth middleware invoked', {
      hasCookie: !!req.cookies?.token,
      hasAuthHeader: !!req.headers.authorization,
      path: req.path
    });

    // Check for token in cookies (primary method)
    if (req.cookies.token) {
      token = req.cookies.token;
      logger.debug('Token found in cookie');
    }
    // Fallback: Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      logger.debug('Token found in Authorization header');
    }

    // Make sure token exists
    if (!token) {
      logger.warn('Authentication failed: No token provided', {
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route - No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.debug('Token verified', { userId: decoded.id });

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        logger.warn('Authentication failed: User not found', {
          userId: decoded.id,
          ip: req.ip
        });
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info('User authenticated successfully', {
        userId: req.user.id,
        username: req.user.name,
        path: req.path
      });
      next();
    } catch (err) {
      logger.warn('Token verification failed', {
        error: err.message,
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({
        success: false,
        error: 'Not authorized - Invalid token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', {
      error: error.message,
      stack: error.stack
    });
    next(error);
  }
};

// Optional authentication - sets req.user if token present, but doesn't require it
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies (primary method)
    if (req.cookies?.token) {
      token = req.cookies.token;
    }
    // Fallback: Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, just continue without setting req.user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next();
    } catch (err) {
      // If token is invalid, just continue without req.user
      next();
    }
  } catch (error) {
    // On any error, just continue without req.user
    next();
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    // Check if user has any of the required roles
    const userRoles = req.user.roles || [req.user.role];
    const hasRequiredRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        error: `User roles [${userRoles.join(', ')}] not authorized. Required: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check resource ownership
const checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findByPk(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      if (resource.seller_id !== req.user.id && resource.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, optionalAuth, authorize, checkOwnership };