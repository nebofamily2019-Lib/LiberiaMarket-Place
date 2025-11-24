const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

/**
 * Image Upload Middleware
 * - Validates file types
 * - Validates file sizes
 * - Stores files temporarily in memory
 */

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Configure multer for memory storage (we'll process before saving)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF are allowed.`), false);
  }
  
  // File type is valid
  cb(null, true);
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Max 5 images per upload
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 5 images per upload.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field in upload.'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  handleMulterError,
  ALLOWED_TYPES,
  MAX_FILE_SIZE
};
