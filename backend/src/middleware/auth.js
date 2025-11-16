const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  // 1. Check cookies first (primary method for web apps)
  if (req.cookies?.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization header (for API clients)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
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