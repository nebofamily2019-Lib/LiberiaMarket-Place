const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('./logger');

/**
 * Image Processing Utilities
 * - Validates actual image content
 * - Optimizes images (resize, compress)
 * - Generates thumbnails
 * - Saves to local storage
 */

// Image dimensions
const SIZES = {
  original: { width: 1200, height: 1200, quality: 90 },
  medium: { width: 800, height: 800, quality: 85 },
  thumbnail: { width: 300, height: 300, quality: 80 }
};

/**
 * Validate that buffer is actually an image
 */
const validateImage = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.format) {
      throw new Error('Invalid image file - no format detected');
    }
    
    // Check format is allowed
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    if (!allowedFormats.includes(metadata.format)) {
      throw new Error(`Invalid image format: ${metadata.format}`);
    }
    
    logger.info('Image validated', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length
    });
    
    return true;
  } catch (error) {
    logger.error('Image validation failed', { error: error.message });
    throw new Error(`Image validation failed: ${error.message}`);
  }
};

/**
 * Process and optimize image
 */
const processImage = async (buffer, size = 'original') => {
  try {
    const { width, height, quality } = SIZES[size];
    
    const processed = await sharp(buffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true // Better compression
      })
      .toBuffer();
    
    logger.info('Image processed', {
      size,
      originalSize: buffer.length,
      processedSize: processed.length,
      compression: `${((1 - processed.length / buffer.length) * 100).toFixed(1)}%`
    });
    
    return processed;
  } catch (error) {
    logger.error('Image processing failed', { error: error.message, size });
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (originalName, size = 'original') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = size === 'original' ? path.extname(originalName) : '.jpg';
  const safeName = path.basename(originalName, path.extname(originalName))
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 20);
  
  return `${safeName}-${timestamp}-${randomString}-${size}${ext}`;
};

/**
 * Save image to disk
 */
const saveImage = async (buffer, filename, folder = 'products') => {
  try {
    // Create uploads directory structure
    const uploadDir = path.join(__dirname, '../../uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Save file
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    
    // Return relative URL
    const url = `/uploads/${folder}/${filename}`;
    
    logger.info('Image saved', { filename, folder, size: buffer.length, url });
    
    return url;
  } catch (error) {
    logger.error('Failed to save image', { error: error.message, filename });
    throw new Error(`Failed to save image: ${error.message}`);
  }
};

/**
 * Process and save all image sizes
 */
const processAndSaveImage = async (buffer, originalName, folder = 'products') => {
  try {
    // Validate image first
    await validateImage(buffer);
    
    const results = {};
    
    // Process each size
    for (const [sizeName, _] of Object.entries(SIZES)) {
      const processed = await processImage(buffer, sizeName);
      const filename = generateFilename(originalName, sizeName);
      const url = await saveImage(processed, filename, folder);
      
      results[sizeName] = url;
    }
    
    logger.info('All image sizes processed', {
      originalName,
      sizes: Object.keys(results)
    });
    
    return results;
  } catch (error) {
    logger.error('Failed to process and save image', {
      error: error.message,
      originalName
    });
    throw error;
  }
};

/**
 * Delete image files
 */
const deleteImage = async (imageUrl) => {
  try {
    // Extract filename from URL
    const urlPath = imageUrl.replace('/uploads/', '');
    const filePath = path.join(__dirname, '../../uploads', urlPath);
    
    // Delete file if exists
    try {
      await fs.unlink(filePath);
      logger.info('Image deleted', { url: imageUrl });
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // File doesn't exist, that's okay
    }
  } catch (error) {
    logger.error('Failed to delete image', {
      error: error.message,
      url: imageUrl
    });
    // Don't throw - deletion failures shouldn't break the app
  }
};

/**
 * Delete all sizes of an image
 */
const deleteAllImageSizes = async (originalUrl) => {
  try {
    // Extract base info
    const urlParts = originalUrl.split('-');
    const folder = originalUrl.split('/')[2]; // /uploads/products/...
    
    // Delete all sizes
    for (const sizeName of Object.keys(SIZES)) {
      const sizedUrl = originalUrl.replace('-original', `-${sizeName}`);
      await deleteImage(sizedUrl);
    }
    
    logger.info('All image sizes deleted', { originalUrl });
  } catch (error) {
    logger.error('Failed to delete all image sizes', {
      error: error.message,
      originalUrl
    });
  }
};

module.exports = {
  validateImage,
  processImage,
  processAndSaveImage,
  deleteImage,
  deleteAllImageSizes,
  generateFilename
};
