const { sequelize } = require('../src/models');
const logger = require('../src/utils/logger');

async function updateUserSchema() {
  try {
    logger.info('🔄 Updating User schema...');
    await sequelize.sync({ alter: true });
    logger.info('✅ User schema updated successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to update User schema', { error: error.message });
    process.exit(1);
  }
}

updateUserSchema();
