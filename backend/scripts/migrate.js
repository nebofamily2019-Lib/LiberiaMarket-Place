const { sequelize } = require('../src/models');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  try {
    console.log('🗄️ Starting database migrations...\n');

    // Import migrations
    const migrationsPath = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:\n`);

    for (const file of migrationFiles) {
      console.log(`\n📝 Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));
      
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`✅ Completed: ${file}`);
    }

    console.log('\n\n🎉 All migrations completed successfully!\n');
    
    // Close connection
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
};

runMigrations();
