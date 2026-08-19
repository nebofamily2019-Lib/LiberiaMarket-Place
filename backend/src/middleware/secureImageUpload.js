/**
 * Secure Image Upload Middleware
 * Production-grade image security with magic byte validation
 *
 * Security Standards:
 * - OWASP File Upload Cheat Sheet
 * - CWE-434 (Unrestricted Upload of File with Dangerous Type)
 * - CWE-400 (Uncontrolled Resource Consumption)
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Magic bytes (file signatures) for image validation
// This prevents attackers from renaming malicious files with image extensions
const IMAGE_SIGNATURES = {
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG (JFIF)
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG (EXIF)
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG
    [0xFF, 0xD8, 0xFF, 0xE3], // JPEG
    [0xFF, 0xD8, 0xFF, 0xDB], // JPEG
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] // PNG
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46] // RIFF (WebP starts with RIFF)
  ],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ]
};

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max files per upload
const MAX_FILES = 5;

/**
 * Validate file against magic bytes
 * This is critical - MIME types can be spoofed, magic bytes cannot
 */
const validateMagicBytes = (buffer, mimeType) => {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  const signatures = IMAGE_SIGNATURES[mimeType];
  if (!signatures) {
    return false;
  }

  // Check if buffer starts with any valid signature for this type
  return signatures.some(signature => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  });
};

/**
 * Validate WebP specifically (requires RIFF + WEBP marker)
 */
const validateWebP = (buffer) => {
  if (buffer.length < 12) return false;

  // Check RIFF header
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 &&
                 buffer[2] === 0x46 && buffer[3] === 0x46;

  // Check WEBP marker at offset 8
  const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45 &&
                 buffer[10] === 0x42 && buffer[11] === 0x50;

  return isRiff && isWebP;
};

/**
 * Enhanced file validation
 */
const validateImageFile = (file) => {
  // 1. Check MIME type (first line of defense)
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`);
  }

  // 2. Check file extension (second line of defense)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Invalid file extension: ${ext}. Only .jpg, .jpeg, .png, .webp are allowed.`);
  }

  // 3. Check magic bytes (critical - prevents spoofed files)
  const buffer = file.buffer;
  let isValid = false;

  if (file.mimetype === 'image/webp') {
    isValid = validateWebP(buffer);
  } else {
    isValid = validateMagicBytes(buffer, file.mimetype);
  }

  if (!isValid) {
    logger.warn('Magic byte validation failed', {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      firstBytes: buffer.slice(0, 12).toString('hex')
    });
    throw new Error('File content does not match declared type. Possible file manipulation detected.');
  }

  // 4. Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }

  // 5. Check minimum size (prevent 0-byte or tiny malicious files)
  if (file.size < 100) {
    throw new Error('File too small. Minimum size is 100 bytes.');
  }

  // 6. Check for null bytes in filename (path traversal attempt)
  if (file.originalname.includes('\0')) {
    logger.error('Null byte detected in filename', { filename: file.originalname });
    throw new Error('Invalid filename detected.');
  }

  // 7. Sanitize filename
  const sanitizedName = file.originalname
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Remove multiple dots (path traversal)
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Limit length

  file.sanitizedName = sanitizedName;

  logger.info('Image validation passed', {
    originalName: file.originalname,
    sanitizedName: sanitizedName,
    mimetype: file.mimetype,
    size: file.size
  });

  return true;
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    // Initial MIME type check (multer requires synchronous validation)
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WebP are allowed.`), false);
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
    fieldSize: 1024 * 1024, // 1MB max field size
    fields: 20, // Max 20 non-file fields
    parts: 25 // Max total parts (files + fields)
  }
});

/**
 * Middleware to validate uploaded files after multer processing
 * This performs deep validation including magic bytes
 */
const validateUploadedFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    // Validate each uploaded file
    for (const file of req.files) {
      validateImageFile(file);
    }

    logger.info('All uploaded files validated successfully', {
      count: req.files.length,
      totalSize: req.files.reduce((sum, f) => sum + f.size, 0)
    });

    next();
  } catch (error) {
    logger.error('File validation failed', {
      error: error.message,
      files: req.files?.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype }))
    });

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Error handling middleware for multer
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.warn('Multer error', { code: err.code, field: err.field });

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: `Too many files. Maximum is ${MAX_FILES} images per upload.`
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field in upload.'
      });
    }
    if (err.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({
        success: false,
        error: 'Field name too long.'
      });
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        success: false,
        error: 'Field value too long.'
      });
    }
  }

  if (err) {
    logger.error('Upload error', { error: err.message });
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload failed.'
    });
  }

  next();
};

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalFilename) => {
  const ext = path.extname(originalFilename).toLowerCase();
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
};

module.exports = {
  upload,
  validateUploadedFiles,
  handleMulterError,
  validateImageFile,
  validateMagicBytes,
  generateSecureFilename,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES
};
