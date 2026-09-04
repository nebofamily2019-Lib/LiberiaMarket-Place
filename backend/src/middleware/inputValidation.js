/**
 * Input Validation & Sanitization Middleware
 * Production-grade validation to prevent injection attacks and malformed data
 *
 * Security Standards:
 * - OWASP Input Validation Cheat Sheet
 * - NIST SP 800-53 SI-10 (Information Input Validation)
 * - CWE-20 (Improper Input Validation)
 */

const validator = require('validator');

/**
 * Sanitize string input - removes dangerous characters
 * @param {string} input - Input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // Trim whitespace by default
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes (can cause issues in databases)
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML by default (prevent XSS)
  if (options.allowHTML !== true) {
    sanitized = validator.escape(sanitized);
  }

  // Normalize unicode characters
  sanitized = sanitized.normalize('NFC');

  // Enforce maximum length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
};

/**
 * Validate and sanitize phone number
 * Accepts: 88xxxxxxx, 088xxxxxxx, +231 88xxxxxxx
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all spaces and dashes
  const cleaned = phone.replace(/[\s\-]/g, '');

  // Check format
  const phoneRegex = /^(\+231)?(0)?([7-9]\d{7})$/;
  const match = cleaned.match(phoneRegex);

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid phone number format. Use: 88xxxxxxx, 088xxxxxxx, or +231 88xxxxxxx'
    };
  }

  // Extract the core 8-digit number
  const normalized = match[3];

  return {
    isValid: true,
    normalized,
    original: phone
  };
};

/**
 * Validate email address
 */
const validateEmail = (email) => {
  if (!email) {
    return { isValid: true }; // Email is optional
  }

  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' };
  }

  // Sanitize
  const sanitized = email.trim().toLowerCase();

  // Validate format
  if (!validator.isEmail(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check length
  if (sanitized.length > 254) { // RFC 5321
    return { isValid: false, error: 'Email too long (max 254 characters)' };
  }

  return { isValid: true, sanitized };
};

/**
 * Validate price/amount (currency)
 */
const validatePrice = (price) => {
  const num = parseFloat(price);

  if (isNaN(num)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }

  if (num < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }

  if (num > 1000000000) { // Max 1 billion
    return { isValid: false, error: 'Price exceeds maximum allowed' };
  }

  // Round to 2 decimal places
  const rounded = Math.round(num * 100) / 100;

  return { isValid: true, value: rounded };
};

/**
 * Validate UUID
 */
const validateUUID = (id) => {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: 'ID is required' };
  }

  if (!validator.isUUID(id, 4)) {
    return { isValid: false, error: 'Invalid ID format' };
  }

  return { isValid: true, value: id };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Enforce limits
  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page must be >= 1'
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }

  // Attach sanitized values to request
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
};

/**
 * Sanitize request body recursively
 * Prevents NoSQL injection and removes dangerous characters
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj, depth = 0) => {
  // Prevent deep nesting attacks
  if (depth > 10) {
    return {};
  }

  if (Array.isArray(obj)) {
    return obj.map(item =>
      typeof item === 'object' ? sanitizeObject(item, depth + 1) : sanitizeString(item)
    );
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key names (prevent NoSQL injection)
      const safeKey = key.replace(/^\$/, '_').replace(/\./g, '_');

      if (typeof value === 'string') {
        sanitized[safeKey] = sanitizeString(value, { maxLength: 10000 });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[safeKey] = sanitizeObject(value, depth + 1);
      } else {
        sanitized[safeKey] = value;
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Validate product creation/update
 */
const validateProduct = (req, res, next) => {
  const { title, description, price, location, district, landmark, condition } = req.body;

  const errors = [];

  // Title validation
  if (!title || typeof title !== 'string') {
    errors.push('Title is required');
  } else if (title.length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (title.length > 200) {
    errors.push('Title too long (max 200 characters)');
  }

  // Description validation
  if (description && description.length > 5000) {
    errors.push('Description too long (max 5000 characters)');
  }

  // Price validation
  if (price !== undefined) {
    const priceValidation = validatePrice(price);
    if (!priceValidation.isValid) {
      errors.push(priceValidation.error);
    } else {
      req.body.price = priceValidation.value;
    }
  }

  // Location validation
  if (location && location.length > 200) {
    errors.push('Location too long (max 200 characters)');
  }
  if (district && district.length > 100) {
    errors.push('District too long (max 100 characters)');
  }
  if (landmark && landmark.length > 200) {
    errors.push('Landmark too long (max 200 characters)');
  }

  // Condition validation
  const validConditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  if (condition && !validConditions.includes(condition)) {
    errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors
    });
  }

  next();
};

/**
 * Validate offer creation
 */
const validateOffer = (req, res, next) => {
  const { product_id, offer_amount, message } = req.body;

  const errors = [];

  // Product ID validation
  const idValidation = validateUUID(product_id);
  if (!idValidation.isValid) {
    errors.push('Invalid product ID');
  }

  // Offer amount validation
  if (!offer_amount) {
    errors.push('Offer amount is required');
  } else {
    const priceValidation = validatePrice(offer_amount);
    if (!priceValidation.isValid) {
      errors.push(priceValidation.error);
    } else {
      req.body.offer_amount = priceValidation.value;
    }
  }

  // Message validation
  if (message && message.length > 1000) {
    errors.push('Message too long (max 1000 characters)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      errors
    });
  }

  next();
};

module.exports = {
  sanitizeString,
  validatePhone,
  validateEmail,
  validatePrice,
  validateUUID,
  validatePagination,
  sanitizeBody,
  sanitizeObject,
  validateProduct,
  validateOffer
};
