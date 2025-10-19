const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Normalize phone number to 9-digit format
const normalizePhone = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Remove country code (231) if present
  if (cleaned.startsWith('231')) {
    cleaned = cleaned.substring(3);
  }

  // Remove leading 0 if present (convert 10-digit local format to 9-digit)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  return cleaned;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !phone || !password) {
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

    // Normalize phone number to 9-digit format
    const normalizedPhone = normalizePhone(phone);
    console.log('Registration attempt - Original phone:', phone, 'Normalized:', normalizedPhone);

    // Validate phone number format (must be exactly 9 digits after normalization, valid Liberian prefix)
    if (!normalizedPhone || normalizedPhone.length !== 9 || !/^(77|76|88|86|87|55|44|33|22)\d{7}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid Liberian phone number (9-10 digits, e.g., 88xxxxxxx or 088xxxxxxx)'
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

    // Create user - email is optional, store normalized phone
    // Note: Password hashing is handled by the User model's beforeCreate hook
    console.log('Creating user with data:', { name, email: email || null, phone: normalizedPhone, role: role || 'user' });
    const user = await User.create({
      name,
      email: email || null,
      password: password, // Will be hashed by beforeCreate hook
      phone: normalizedPhone,
      role: role || 'user'
    });

    // Generate token
    const token = user.getSignedJwtToken ? user.getSignedJwtToken() : generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || null,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
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

    // Normalize phone number to 9-digit format
    const normalizedPhone = normalizePhone(phone);

    // Validate phone number format (must be exactly 9 digits after normalization, valid Liberian prefix)
    if (!normalizedPhone || normalizedPhone.length !== 9 || !/^(77|76|88|86|87|55|44|33|22)\d{7}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid Liberian phone number (9-10 digits)'
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

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = user.getSignedJwtToken ? user.getSignedJwtToken() : generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || null,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
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

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
};
// Changes applied: normalizePhone helper, stricter phone validation, normalized phone storage, token generation fallback, improved error messages.