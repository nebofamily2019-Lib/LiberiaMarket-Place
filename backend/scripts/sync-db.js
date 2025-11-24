const { sequelize } = require('../src/models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Starting database sync...\n');

    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Sync all models (alter: true updates without dropping data)
    await sequelize.sync({ alter: true });

    console.log('\n✅ Database synced successfully!');
    console.log('\nTables created/updated:');
    console.log('  - users (with loginAttempts, lockUntil)');
    console.log('  - products');
    console.log('  - categories');
    console.log('  - conversations');
    console.log('  - messages');
    console.log('  - offers');
    console.log('  - payments\n');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

syncDatabase();
