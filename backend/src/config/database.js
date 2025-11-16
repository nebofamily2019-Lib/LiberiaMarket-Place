const { Sequelize } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    // Use PostgreSQL in Docker, SQLite locally
    dialect: process.env.DB_HOST ? 'postgres' : 'sqlite',
    host: process.env.DB_HOST || undefined,
    port: process.env.DB_PORT || undefined,
    database: process.env.DB_NAME || 'libmarket_dev',
    username: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    storage: process.env.DB_HOST ? undefined : path.join(__dirname, '..', '..', 'libmarket_dev.sqlite'),
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
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
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

const dbConfig = config[env];
const sequelize = new Sequelize(dbConfig);

module.exports = { sequelize };