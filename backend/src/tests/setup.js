// Test setup file

const { sequelize } = require('../config/database');

// Mock sharp module to avoid native module issues in tests
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-data')),
    toFile: jest.fn().mockResolvedValue({ size: 1000, width: 800, height: 600 }),
    metadata: jest.fn().mockResolvedValue({ width: 1200, height: 900, format: 'jpeg' })
  }));
});


beforeAll(async () => {
  // Safety Check: Prevent wiping development database
  // If NODE_ENV wasn't set correctly at startup, sequelize might have connected to the dev DB.
  // We must abort immediately if we are not using the in-memory test database.
  if (sequelize.options.storage !== ':memory:') {
    const msg = `
    🛑 CRITICAL SAFETY ERROR: 
    Tests are attempting to run against a persistent database!
    Storage: ${sequelize.options.storage}
    
    This would wipe your development data.
    Tests must run with NODE_ENV=test to use the in-memory database.
    `;
    console.error(msg);
    throw new Error(msg);
  }

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  try {
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('Database setup failed:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error('Database cleanup failed:', error);
  }
});

afterEach(async () => {
  // Disable foreign keys to allow clearing tables in any order
  if (sequelize.getDialect() === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  }

  const models = Object.values(sequelize.models);
  for (const model of models) {
    try {
      await model.destroy({ where: {}, force: true });
    } catch (error) {
      console.warn(`Failed to clear model ${model.name}:`, error.message);
    }
  }

  if (sequelize.getDialect() === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
});
