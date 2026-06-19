const logger = require('./logger');

const PLACEHOLDER_JWT_SECRET = 'CHANGE_THIS_IMMEDIATELY_GENERATE_SECURE_64_CHAR_STRING';

function validateEnv() {
  const errors = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === PLACEHOLDER_JWT_SECRET) {
    errors.push('JWT_SECRET is missing or still set to the placeholder value');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGIN) {
      errors.push('CORS_ORIGIN must be set in production');
    }
    if (process.env.DB_DIALECT === 'sqlite' || !process.env.DB_DIALECT) {
      errors.push('DB_DIALECT must be set to a production database (e.g. postgres) in production');
    }
    if (process.env.DB_DIALECT === 'postgres' && (!process.env.DB_HOST || !process.env.DB_PASSWORD)) {
      errors.push('DB_HOST and DB_PASSWORD must be set when DB_DIALECT=postgres in production');
    }
  }

  if (errors.length > 0) {
    errors.forEach((message) => logger.error(`Environment validation failed: ${message}`));
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }
}

module.exports = validateEnv;
