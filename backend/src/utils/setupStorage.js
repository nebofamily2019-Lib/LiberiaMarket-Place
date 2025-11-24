/**
 * Storage Setup Utility
 * Creates upload directories with proper permissions
 *
 * Security Considerations:
 * - Directories should have restrictive permissions (755)
 * - Files should be served through Express (not direct file system access)
 * - Never execute uploaded files
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

// Upload directory structure
const UPLOAD_DIRS = [
  'uploads/products',
  'uploads/avatars',
  'uploads/temp',
  'logs'
];

/**
 * Create upload directories if they don't exist
 */
const setupStorageDirectories = async () => {
  try {
    const baseDir = path.join(__dirname, '../..');

    for (const dir of UPLOAD_DIRS) {
      const fullPath = path.join(baseDir, dir);

      try {
        await fs.mkdir(fullPath, { recursive: true, mode: 0o755 });
        logger.info(`Storage directory ready: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        logger.debug(`Storage directory exists: ${dir}`);
      }
    }

    // Create .gitkeep files to preserve directory structure in Git
    for (const dir of UPLOAD_DIRS) {
      const gitkeepPath = path.join(baseDir, dir, '.gitkeep');
      try {
        await fs.writeFile(gitkeepPath, '');
      } catch (error) {
        // Ignore if already exists
      }
    }

    logger.info('Storage directories setup complete');
    return true;
  } catch (error) {
    logger.error('Failed to setup storage directories', { error: error.message });
    throw error;
  }
};

/**
 * Clean up temp directory (call periodically or on startup)
 */
const cleanTempDirectory = async () => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    const files = await fs.readdir(tempDir);

    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    let deletedCount = 0;

    for (const file of files) {
      if (file === '.gitkeep') continue;

      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      // Delete files older than 24 hours
      if (now - stats.mtimeMs > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info(`Cleaned ${deletedCount} temp files`);
    }

    return deletedCount;
  } catch (error) {
    logger.error('Failed to clean temp directory', { error: error.message });
    // Don't throw - cleanup failures shouldn't break the app
    return 0;
  }
};

/**
 * Get storage statistics
 */
const getStorageStats = async () => {
  try {
    const baseDir = path.join(__dirname, '../..');
    const stats = {};

    for (const dir of UPLOAD_DIRS) {
      const fullPath = path.join(baseDir, dir);

      try {
        const files = await fs.readdir(fullPath);
        let totalSize = 0;
        let fileCount = 0;

        for (const file of files) {
          if (file === '.gitkeep') continue;
          const filePath = path.join(fullPath, file);
          const stat = await fs.stat(filePath);
          if (stat.isFile()) {
            totalSize += stat.size;
            fileCount++;
          }
        }

        stats[dir] = {
          fileCount,
          totalSize,
          totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
        };
      } catch (error) {
        stats[dir] = { error: error.message };
      }
    }

    return stats;
  } catch (error) {
    logger.error('Failed to get storage stats', { error: error.message });
    return {};
  }
};

/**
 * Validate storage health
 * Check for disk space, permissions, etc.
 */
const validateStorageHealth = async () => {
  const issues = [];

  try {
    const baseDir = path.join(__dirname, '../..');

    for (const dir of UPLOAD_DIRS) {
      const fullPath = path.join(baseDir, dir);

      // Check if directory exists
      try {
        await fs.access(fullPath, fs.constants.W_OK | fs.constants.R_OK);
      } catch (error) {
        issues.push({
          directory: dir,
          issue: 'Not writable or readable',
          severity: 'high'
        });
      }
    }

    if (issues.length > 0) {
      logger.warn('Storage health check found issues', { issues });
    } else {
      logger.info('Storage health check passed');
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  } catch (error) {
    logger.error('Storage health check failed', { error: error.message });
    return {
      healthy: false,
      issues: [{ issue: error.message, severity: 'critical' }]
    };
  }
};

module.exports = {
  setupStorageDirectories,
  cleanTempDirectory,
  getStorageStats,
  validateStorageHealth,
  UPLOAD_DIRS
};
