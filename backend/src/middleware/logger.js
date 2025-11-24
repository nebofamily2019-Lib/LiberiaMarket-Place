const logger = require('../utils/logger');

/**
 * HTTP Request Logger Middleware
 * Logs all incoming requests with timing information
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.http(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'http';
    
    logger[logLevel](`${req.method} ${req.url} ${res.statusCode}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id
    });
  });

  next();
};

module.exports = requestLogger;
