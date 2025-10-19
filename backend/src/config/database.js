const { Sequelize } = require('sequelize')
const path = require('path')
require('dotenv').config()

// Database configuration - supports both PostgreSQL and SQLite
const DB_DIALECT = process.env.DB_DIALECT || 'sqlite'

let sequelize

if (DB_DIALECT === 'postgres') {
  // PostgreSQL configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'libmarket_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
  )
} else {
  // SQLite configuration (default for development)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database/libmarket.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  })
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log(`✅ ${DB_DIALECT.toUpperCase()} Database connection established successfully.`)
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

// Sync database models
const syncDatabase = async () => {
  try {
    // Use force:false to avoid dropping tables, and alter:false to avoid sync issues with SQLite
    await sequelize.sync({ force: false })
    console.log(`✅ ${DB_DIALECT.toUpperCase()} Database synced successfully`)
  } catch (error) {
    console.error('❌ Error syncing database:', error)
    throw error
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
}