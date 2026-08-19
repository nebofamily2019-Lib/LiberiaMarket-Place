const app = require('./server');
const http = require('http');
const logger = require('./utils/logger');
const { setupStorageDirectories, validateStorageHealth } = require('./utils/setupStorage');
const { closeConnection } = require('./config/database');
const { initializeSocket } = require('./socket/socketManager');
const startOfferExpirationJob = require('./cron/offerExpirationJob');

const PORT = process.env.PORT || 5000;

let server;

// Initialize storage directories first, then start server
(async () => {
  try {
    await setupStorageDirectories();
    const health = await validateStorageHealth();
    if (!health.healthy) {
      logger.error('Storage health check failed on startup', { issues: health.issues });
    }
    logger.info('✅ Storage directories initialized');
  } catch (error) {
    logger.error('Failed to setup storage on startup', { error: error.message });
  }

  // Create HTTP server and initialize Socket.io
  server = http.createServer(app);
  initializeSocket(server);

  // Start Cron Jobs
  startOfferExpirationJob();

  server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    logger.info(`🔌 Socket.io enabled for real-time notifications`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use. Please stop other processes using this port.`);
      process.exit(1);
    }
  });
})();

// ===== Graceful Shutdown Handler =====
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, forcing exit...');
    process.exit(1);
  }

  isShuttingDown = true;
  logger.info(`${signal} received, starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed (no new connections accepted)');

    try {
      // Close database connections
      logger.info('Closing database connections...');
      await closeConnection();

      // Add any other cleanup here (Redis, message queues, etc.)

      logger.info('✅ Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('❌ Graceful shutdown timeout (30s), forcing exit');
    process.exit(1);
  }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kubernetes/Docker
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection', {
    reason: reason,
    promise: promise
  });
  gracefulShutdown('unhandledRejection');
});
