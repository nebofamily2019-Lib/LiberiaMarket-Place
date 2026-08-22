/**
 * Database Configuration
 * Production-grade database setup with connection pooling and optimization
 *
 * Features:
 * - Environment-specific configurations
 * - Connection pooling for performance
 * - Query logging in development
 * - SSL support for production PostgreSQL
 * - Automatic retry logic
 * - Connection health monitoring
 */


const Sequelize = require('sequelize');
const path = require('path');
// Use Node's built-in __dirname for CommonJS compatibility
const logger = require('../utils/logger');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

/**
 * Database Configuration per Environment
 */
const config = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    host: process.env.DB_HOST || undefined,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME || 'libmarket_dev',
    username: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    storage: process.env.DB_DIALECT === 'sqlite'
      ? (process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'database.sqlite'))
      : undefined,

    // Logging: Log queries in development for debugging
    logging: (msg) => logger.debug(msg),

    // Connection Pool Settings (Development)
    pool: {
      max: 5,              // Maximum connections in pool
      min: 0,              // Minimum connections in pool
      acquire: 30000,      // Maximum time (ms) to get connection before error
      idle: 10000,         // Maximum time (ms) connection can be idle before release
      evict: 1000          // Run eviction every 1 second
    },

    // Query optimization
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },

    // Retry configuration
    retry: {
      max: 3,
      timeout: 5000
    }
  },

  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  },

  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    // Logging: Only log errors in production
    logging: (msg) => logger.error(msg),

    // Connection Pool Settings (Production - higher concurrency)
    pool: {
      max: 20,             // Higher max for production traffic
      min: 5,              // Keep minimum connections warm
      acquire: 30000,
      idle: 10000,
      evict: 1000
    },

    // SSL for production PostgreSQL (disable via DB_SSL=false for self-hosted Postgres without TLS, e.g. docker-compose)
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false  // For self-signed certs (adjust per hosting provider)
      },
      // Statement timeout (30 seconds)
      statement_timeout: 30000,
      // Idle session timeout (10 minutes)
      idle_in_transaction_session_timeout: 600000
    },

    // Query optimization
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },

    // Retry configuration
    retry: {
      max: 5,
      timeout: 10000
    },

    // Benchmark queries (log slow queries)
    benchmark: true,
    logQueryParameters: false  // Don't log params in production (security)
  }
};

// Get configuration for current environment
const dbConfig = config[env];

// Initialize Sequelize instance
const sequelize = new Sequelize(dbConfig);

/**
 * Connection Health Check
 * Validates database connection and logs details
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully', {
      dialect: dbConfig.dialect,
      database: dbConfig.database || dbConfig.storage,
      environment: env
    });
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to database:', {
      error: error.message,
      dialect: dbConfig.dialect,
      environment: env
    });
    return false;
  }
};

/**
 * Get Connection Pool Statistics
 * Useful for monitoring and debugging
 */
const getPoolStats = () => {
  if (!sequelize.connectionManager || !sequelize.connectionManager.pool) {
    return null;
  }

  const pool = sequelize.connectionManager.pool;

  return {
    size: pool.size,              // Total connections
    available: pool.available,     // Available connections
    using: pool.using,            // In-use connections
    waiting: pool.waiting         // Waiting requests
  };
};

/**
 * Close all database connections gracefully
 * Used during application shutdown
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('✅ Database connections closed successfully');
    return true;
  } catch (error) {
    logger.error('❌ Error closing database connections:', {
      error: error.message
    });
    return false;
  }
};

/**
 * Database Optimization Utilities
 */
const optimizationUtils = {
  /**
   * Execute raw SQL with proper error handling
   */
  executeRaw: async (sql, options = {}) => {
    try {
      const result = await sequelize.query(sql, {
        type: sequelize.QueryTypes.RAW,
        ...options
      });
      return { success: true, data: result };
    } catch (error) {
      logger.error('Raw query failed:', { sql, error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Vacuum SQLite database (optimization for SQLite)
   */
  vacuumDatabase: async () => {
    if (dbConfig.dialect !== 'sqlite') {
      return { success: false, error: 'VACUUM only supported for SQLite' };
    }

    try {
      await sequelize.query('VACUUM');
      logger.info('✅ Database VACUUM completed');
      return { success: true };
    } catch (error) {
      logger.error('VACUUM failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Analyze tables (optimize query planner)
   */
  analyzeTables: async () => {
    try {
      if (dbConfig.dialect === 'sqlite') {
        await sequelize.query('ANALYZE');
      } else if (dbConfig.dialect === 'postgres') {
        await sequelize.query('ANALYZE');
      }
      logger.info('✅ Database ANALYZE completed');
      return { success: true };
    } catch (error) {
      logger.error('ANALYZE failed:', { error: error.message });
      return { success: false, error: error.message };
    }
  }
};

module.exports = {
  sequelize,
  testConnection,
  getPoolStats,
  closeConnection,
  optimizationUtils,
  config: dbConfig
};
