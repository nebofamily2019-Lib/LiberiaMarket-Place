const { Sequelize } = require('sequelize')
const path = require('path')
require('dotenv').config()

// SQLite configuration for development
const sequelize = new Sequelize({
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

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ SQLite Database connection established successfully.')
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    process.exit(1)
  }
}

// Sync database models
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development, sync with alter: true to update existing tables
      await sequelize.sync({ alter: true })
      console.log('🔄 SQLite Database synced successfully (development mode)')
    } else {
      // In production, only sync without altering existing structure
      await sequelize.sync()
      console.log('✅ SQLite Database synced successfully')
    }
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
