const { sequelize } = require('../src/config/database');
const { QueryInterface } = require('sequelize');

async function up() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('⏳ Adding expiresAt column to products table...');
    
    // Add expiresAt column
    await queryInterface.addColumn('products', 'expiresAt', {
      type: 'DATETIME', // SQLite uses DATETIME or TEXT
      allowNull: true,
    });

    console.log('✅ Added expiresAt column');
    
    // Set default expiration for existing active products (30 days from now)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const dateString = thirtyDaysFromNow.toISOString();

    await sequelize.query(
      `UPDATE products SET expiresAt = '${dateString}' WHERE status = 'active'`
    );
    
    console.log('✅ Updated existing active products with expiration date');
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Column already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', error);
    }
  } finally {
    await sequelize.close();
  }
}

up();
