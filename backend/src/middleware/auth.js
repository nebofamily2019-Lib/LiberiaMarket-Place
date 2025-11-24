const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔍 Auth middleware - Cookies:', req.cookies);
    console.log('🔍 Auth middleware - Headers:', req.headers.authorization);

    // Check for token in cookies (primary method)
    if (req.cookies.token) {
      token = req.cookies.token;
      console.log('🔐 Token found in cookie');
    }
    // Fallback: Check Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔐 Token found in Authorization header');
    }

    // Make sure token exists
    if (!token) {
      console.log('❌ No token found in cookies or headers');
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route - No token provided'
      });
    }

    console.log('🔍 Verifying token...');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token verified for user:', decoded.id);

      // Get user from token
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        console.log('❌ User not found for token:', decoded.id);
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      console.log('✅ User authenticated:', req.user.name);
      next();
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized - Invalid token'
      });
    }
  } catch (error) {
    console.log('❌ Auth middleware error:', error);
    next(error);
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

module.exports = { protect, authorize, checkOwnership };