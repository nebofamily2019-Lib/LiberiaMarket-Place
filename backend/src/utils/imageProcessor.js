const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const logger = require('./logger');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');
const stream = require('stream');

// Initialize Cloudinary
const isCloudinaryConfigured = configureCloudinary();

// Image size configurations
const IMAGE_SIZES = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 800, height: 800 },
  original: null // Keep original size
};

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generate a unique filename
 */
const generateFilename = (originalName, size = 'original') => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(6).toString('hex');
  const ext = path.extname(originalName) || '.jpg';
  return `${size}-${timestamp}-${randomString}${ext}`;
};

/**
 * Validate image file
 */
const validateImage = async (buffer, mimetype) => {
  // Check file size
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`Image size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
    throw new Error(`Invalid image type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  return { valid: true };
};

/**
 * Process image to specified size
 */
const processImage = async (buffer, size = 'original') => {
  const config = IMAGE_SIZES[size];

  if (!config) {
    // Return original if size not configured
    return buffer;
  }

  try {
    return await sharp(buffer)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    logger.error('Error processing image', { error: error.message, size });
    throw error;
  }
};

/**
 * Save image buffer to Cloudinary
 */
const saveImageToCloud = async (buffer, filename, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `libmarket/${folder}`,
        public_id: path.parse(filename).name,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error', { error });
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Save image buffer to disk
 */
const saveImageToDisk = async (buffer, filename, folder = 'products') => {
  const uploadDir = path.join(__dirname, '../../uploads', folder);

  // Ensure directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  // Return URL path (not filesystem path)
  return `/uploads/${folder}/${filename}`;
};

/**
 * Process and save image in multiple sizes
 */
const processAndSaveImage = async (buffer, originalName, folder = 'products') => {
  try {
    const sizes = ['thumbnail', 'medium', 'original'];
    const results = {};
    const useCloud = process.env.USE_CLOUD_STORAGE === 'true' && isCloudinaryConfigured;

    for (const size of sizes) {
      const filename = generateFilename(originalName, size);
      const processedBuffer = await processImage(buffer, size);
      
      let url;
      if (useCloud) {
        url = await saveImageToCloud(processedBuffer, filename, folder);
      } else {
        url = await saveImageToDisk(processedBuffer, filename, folder);
      }
      
      results[size] = url;
    }

    logger.info('Image processed and saved', {
      original: originalName,
      sizes: Object.keys(results),
      storage: useCloud ? 'cloud' : 'disk'
    });

    return results;
  } catch (error) {
    logger.error('Error in processAndSaveImage', {
      error: error.message,
      originalName
    });
    throw error;
  }
};

/**
 * Delete image file from disk or cloud
 */
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      if (isCloudinaryConfigured) {
        // Extract public_id from URL
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/libmarket/products/thumbnail-123.jpg
        const parts = imageUrl.split('/');
        const filename = parts.pop();
        const folder = parts.pop(); // 'products'
        const rootFolder = parts.pop(); // 'libmarket'
        const publicId = `${rootFolder}/${folder}/${path.parse(filename).name}`;
        
        await cloudinary.uploader.destroy(publicId);
        logger.info('Image deleted from cloud', { publicId });
      }
      return;
    }

    const filename = path.basename(imageUrl);
    const folder = path.dirname(imageUrl).split('/').pop();
    const filepath = path.join(__dirname, '../../uploads', folder, filename);

    await fs.unlink(filepath);
    logger.info('Image deleted', { filepath });
  } catch (error) {
    logger.error('Error deleting image', {
      error: error.message,
      imageUrl
    });
  }
};

/**
 * Delete all sizes of an image (thumbnail, medium, original)
 */
const deleteAllImageSizes = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Handle Cloudinary deletion
    if (imageUrl.includes('cloudinary.com')) {
      if (isCloudinaryConfigured) {
        const parts = imageUrl.split('/');
        const filename = parts.pop();
        const folder = parts.pop();
        const rootFolder = parts.pop();
        
        // Extract base filename parts to reconstruct other sizes
        const nameParts = filename.split('-');
        if (nameParts.length >= 3) {
          const timestamp = nameParts[1];
          const randomPart = nameParts.slice(2).join('-');
          const ext = path.extname(filename);
          const baseName = path.basename(randomPart, ext); // remove extension for public_id

          for (const size of ['thumbnail', 'medium', 'original']) {
            // Reconstruct filename: size-timestamp-random
            // Note: Cloudinary public_id doesn't include extension usually, but depends on upload
            // Our upload uses filename as public_id (without extension? no, path.parse(filename).name)
            
            const sizedFilename = `${size}-${timestamp}-${baseName}`; 
            const publicId = `${rootFolder}/${folder}/${sizedFilename}`;
            
            await cloudinary.uploader.destroy(publicId);
            logger.info('Image size deleted from cloud', { publicId });
          }
        }
      }
      return;
    }

    const filename = path.basename(imageUrl);
    const folder = path.dirname(imageUrl).split('/').pop();

    // Extract base filename (remove size prefix)
    const parts = filename.split('-');
    if (parts.length >= 3) {
      // filename format: size-timestamp-random.ext
      const timestamp = parts[1];
      const randomPart = parts.slice(2).join('-');

      for (const size of ['thumbnail', 'medium', 'original']) {
        const sizedFilename = `${size}-${timestamp}-${randomPart}`;
        const filepath = path.join(__dirname, '../../uploads', folder, sizedFilename);

        try {
          await fs.unlink(filepath);
          logger.info('Image size deleted', { filepath });
        } catch (err) {
          // File might not exist, that's okay
          if (err.code !== 'ENOENT') {
            logger.warn('Could not delete image size', { filepath, error: err.message });
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error deleting all image sizes', {
      error: error.message,
      imageUrl
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
