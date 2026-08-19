const { sequelize } = require('../src/models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Starting database sync...\n');

    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Disable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = OFF;');

    // Sync all models (force: true drops tables and recreates them)
    await sequelize.sync({ force: true });

    // Enable foreign key checks
    await sequelize.query('PRAGMA foreign_keys = ON;');

    console.log('\n✅ Database synced successfully!');
    console.log('\nTables created/updated:');
    console.log('  - users (with loginAttempts, lockUntil)');
    console.log('  - products');
    console.log('  - categories');
    console.log('  - conversations');
    console.log('  - messages');
    console.log('  - mobile_money_accounts');
    console.log('  - payments');
    console.log('  - reviews');
    console.log('  - saved_items');
    console.log('  - notifications');
    console.log('  - reports');
    console.log('  - user_activities');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
  } finally {
    await sequelize.close();
  }
};

syncDatabase();
