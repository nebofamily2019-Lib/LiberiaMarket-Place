const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Normalize phone number to 8-9 digit format
const normalizePhone = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove country code (231) if present
  if (cleaned.startsWith('231')) {
    cleaned = cleaned.substring(3);
  }

  // Remove leading 0 if present (convert 10-digit local format to 8-9 digit)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
};

// Helper to send token response with httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken ? user.getSignedJwtToken() : generateToken(user.id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true, // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // CSRF protection - lax in dev for cross-origin requests
    path: '/'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || null,
        role: user.role,
        roles: user.roles, // Send multiple roles
        isActive: user.isActive,
        isPhoneVerified: user.isPhoneVerified || false
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, roles } = req.body;

    // Validate email format (if provided)
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Sanitize name input
    const sanitizedName = validator.escape(name.trim());

    // Validate required fields
    if (!sanitizedName || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, phone number, and password'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Normalize phone number to 8-9 digit format
    const normalizedPhone = normalizePhone(phone);
    console.log('📱 Registration - Original:', phone, '→ Normalized:', normalizedPhone, 'Length:', normalizedPhone.length);

    // Validate phone number format (8 or 9 digits with valid Liberian prefix)
    // Allow 7, 8, or 9 digits for flexibility with different carrier formats
    if (!normalizedPhone || normalizedPhone.length < 7 || normalizedPhone.length > 9) {
      return res.status(400).json({
        success: false,
        error: `Invalid phone number length. Received ${normalizedPhone.length} digits after normalization. Expected 7-9 digits.`
      });
    }

    // Validate Liberian prefix (more flexible)
    const validPrefixes = ['77', '76', '88', '86', '87', '55', '54', '44', '33', '22', '20'];
    const prefix = normalizedPhone.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
      return res.status(400).json({
        success: false,
        error: `Invalid Liberian phone number prefix: ${prefix}. Must start with: ${validPrefixes.join(', ')}`
      });
    }

    // Check if user exists with this phone number (using normalized format)
    const userExists = await User.findOne({ where: { phone: normalizedPhone } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already registered. Please login or use a different number.'
      });
    }

    console.log('✅ Creating user with data:', { 
      name: sanitizedName, 
      email: email || null, 
      phone: normalizedPhone, 
      role: role || 'buyer',
      roles: roles || ['buyer']
    });
    
    const user = await User.create({
      name: sanitizedName,
      email: email || null,
      password: password,
      phone: normalizedPhone,
      role: role || 'buyer',
      roles: roles || ['buyer']
    });

    console.log('🎉 User created successfully:', user.id, user.name, user.phone);

    // Send token in httpOnly cookie
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('❌ Registration error:', error.message)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Phone number already exists'
      });
    }
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Validate phone & password
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your phone number and password'
      });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);
    console.log('📱 Login - Original:', phone, '→ Normalized:', normalizedPhone);

    // Validate phone number format
    if (!normalizedPhone || normalizedPhone.length < 7 || normalizedPhone.length > 9) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Check for user by phone (using normalized format)
    const user = await User.findOne({ where: { phone: normalizedPhone } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone number or password'
      });
    }

    // Log admin access attempts
    if (user.role === 'admin') {
      console.log(`🔐 Admin login: ${user.name} (${user.phone}) from IP: ${req.ip}`);
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Send token in httpOnly cookie
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    // Clear the cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // CSRF protection - lax in dev for cross-origin requests
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    // Check current password
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password (hashing handled by beforeUpdate hook)
    await user.update({ password: newPassword });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.update({
      resetPasswordToken,
      resetPasswordExpire
    });

    // In production, send email with reset token
    // For now, just return the token (REMOVE IN PRODUCTION)
    res.status(200).json({
      success: true,
      message: 'Reset token sent',
      resetToken: resetToken // REMOVE IN PRODUCTION
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [require('sequelize').Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password (hashing handled by beforeUpdate hook)
    await user.update({
      password: password,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send phone verification code
// @route   POST /api/auth/send-verification
// @access  Private
const sendVerificationCode = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is already verified'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationToken = crypto.createHash('sha256').update(verificationCode).digest('hex');
    const verificationTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.update({
      verificationToken,
      verificationTokenExpire
    });

    // TODO: Send SMS with verification code using Africa's Talking API
    // For now, return code in response (REMOVE IN PRODUCTION)
    console.log(`📱 Verification code for ${user.phone}: ${verificationCode}`);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your phone',
      // REMOVE IN PRODUCTION:
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify phone number with code
// @route   POST /api/auth/verify-phone
// @access  Private
const verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Please provide verification code'
      });
    }

    // Hash the provided code
    const verificationToken = crypto.createHash('sha256').update(code).digest('hex');

    // Find user with matching token and non-expired timestamp
    const user = await User.findOne({
      where: {
        id: req.user.id,
        verificationToken,
        verificationTokenExpire: { [require('sequelize').Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // Mark phone as verified
    await user.update({
      isPhoneVerified: true,
      verificationToken: null,
      verificationTokenExpire: null
    });

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        isPhoneVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  verifyPhone
};
// Changes applied: normalizePhone helper, stricter phone validation, normalized phone storage, token generation fallback, improved error messages, httpOnly cookie implementation for tokens, input validation and sanitization.