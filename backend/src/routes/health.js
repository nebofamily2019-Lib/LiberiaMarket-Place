/**
 * Health Check Routes
 * Production-grade health monitoring for Kubernetes/Docker/Load Balancers
 *
 * Endpoints:
 * - GET /health          - Quick liveness probe (200 if server running)
 * - GET /health/ready    - Readiness probe (200 if app can handle traffic)
 * - GET /health/detailed - Full system diagnostics (admin only)
 */

const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { validateStorageHealth } = require('../utils/setupStorage');
const { getPoolStats } = require('../config/database');
const logger = require('../utils/logger');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

/**
 * Liveness Probe - Kubernetes Health Check
 * Returns 200 if server process is alive
 *
 * @route   GET /health
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

/**
 * Readiness Probe - Application Ready Check
 * Returns 200 only if app can handle traffic (DB connected, etc.)
 *
 * @route   GET /health/ready
 * @access  Public
 */
router.get('/ready', async (req, res) => {
  const checks = {
    server: 'ok',
    database: 'unknown',
    storage: 'unknown'
  };

  let isReady = true;

  try {
    // Check database connection
    await sequelize.authenticate();
    checks.database = 'ok';
  } catch (error) {
    checks.database = 'error';
    isReady = false;
    logger.error('Readiness check: Database connection failed', {
      error: error.message
    });
  }

  try {
    // Check storage health
    const storageHealth = await validateStorageHealth();
    checks.storage = storageHealth.healthy ? 'ok' : 'degraded';

    if (!storageHealth.healthy) {
      isReady = false;
    }
  } catch (error) {
    checks.storage = 'error';
    isReady = false;
    logger.error('Readiness check: Storage validation failed', {
      error: error.message
    });
  }

  const statusCode = isReady ? 200 : 503;

  res.status(statusCode).json({
    status: isReady ? 'ready' : 'not_ready',
    checks,
    timestamp: new Date().toISOString()
  });
});

/**
 * Detailed Health Check - Full System Diagnostics
 * Comprehensive health information for monitoring/debugging
 *
 * @route   GET /health/detailed
 * @access  Public (consider protecting in production)
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();

  const health = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {},
    metrics: {},
    system: {}
  };

  // ===== System Information =====
  try {
    health.system = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      uptime: process.uptime(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      memoryUsage: process.memoryUsage(),
      loadAverage: os.loadavg()
    };
  } catch (error) {
    health.system.error = error.message;
  }

  // ===== Database Check =====
  try {
    const dbStartTime = Date.now();
    await sequelize.authenticate();

    const poolStats = getPoolStats();

    health.checks.database = {
      status: 'ok',
      responseTime: Date.now() - dbStartTime,
      dialect: sequelize.options.dialect,
      pool: poolStats,
      connected: true
    };
  } catch (error) {
    health.checks.database = {
      status: 'error',
      error: error.message,
      connected: false
    };
    logger.error('Health check: Database error', { error: error.message });
  }

  // ===== Storage Check =====
  try {
    const storageStartTime = Date.now();
    const storageHealth = await validateStorageHealth();

    health.checks.storage = {
      status: storageHealth.healthy ? 'ok' : 'degraded',
      responseTime: Date.now() - storageStartTime,
      directories: storageHealth.directories,
      issues: storageHealth.issues
    };

    // Get disk space info
    try {
      const uploadPath = path.join(__dirname, '../../uploads');
      const stats = await fs.stat(uploadPath);
      health.checks.storage.uploadPath = uploadPath;
      health.checks.storage.accessible = true;
    } catch (error) {
      health.checks.storage.accessible = false;
      health.checks.storage.error = error.message;
    }
  } catch (error) {
    health.checks.storage = {
      status: 'error',
      error: error.message
    };
    logger.error('Health check: Storage error', { error: error.message });
  }

  // ===== Environment Variables Check =====
  health.checks.environment = {
    status: 'ok',
    variables: {
      NODE_ENV: !!process.env.NODE_ENV,
      PORT: !!process.env.PORT,
      JWT_SECRET: !!process.env.JWT_SECRET,
      DB_DIALECT: !!process.env.DB_DIALECT,
      CORS_ORIGIN: !!process.env.CORS_ORIGIN
    }
  };

  // Check for missing critical env vars
  const missingVars = [];
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
  if (!process.env.DB_DIALECT) missingVars.push('DB_DIALECT');

  if (missingVars.length > 0) {
    health.checks.environment.status = 'warning';
    health.checks.environment.missing = missingVars;
  }

  // ===== Metrics =====
  health.metrics = {
    requestCount: global.requestCount || 0,
    errorCount: global.errorCount || 0,
    averageResponseTime: global.avgResponseTime || 0,
    uptime: {
      seconds: Math.floor(process.uptime()),
      formatted: formatUptime(process.uptime())
    },
    memory: {
      heapUsed: formatBytes(process.memoryUsage().heapUsed),
      heapTotal: formatBytes(process.memoryUsage().heapTotal),
      rss: formatBytes(process.memoryUsage().rss),
      external: formatBytes(process.memoryUsage().external)
    }
  };

  // ===== Overall Status =====
  const allChecks = Object.values(health.checks);
  const hasError = allChecks.some(check => check.status === 'error');
  const hasWarning = allChecks.some(check => check.status === 'warning' || check.status === 'degraded');

  if (hasError) {
    health.status = 'unhealthy';
  } else if (hasWarning) {
    health.status = 'degraded';
  } else {
    health.status = 'healthy';
  }

  health.responseTime = Date.now() - startTime;

  const statusCode = health.status === 'healthy' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

/**
 * Ping - Minimal Health Check
 * Ultra-lightweight check for monitoring
 *
 * @route   GET /health/ping
 * @access  Public
 */
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// ===== Helper Functions =====

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format uptime to human-readable string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

module.exports = router;
