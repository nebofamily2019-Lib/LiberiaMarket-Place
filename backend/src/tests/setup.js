// Test setup file
const { sequelize } = require('../config/database')

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-key'

  try {
    // Sync database (will create tables if they don't exist)
    await sequelize.sync({ force: true })
  } catch (error) {
    console.error('Database setup failed:', error)
  }
})

// Cleanup after all tests
afterAll(async () => {
  try {
    await sequelize.close()
  } catch (error) {
    console.error('Database cleanup failed:', error)
  }
})

// Clean up after each test
afterEach(async () => {
  // Clear all tables
  const models = Object.values(sequelize.models)
  for (const model of models) {
    await model.destroy({ where: {}, force: true })
  }
})
