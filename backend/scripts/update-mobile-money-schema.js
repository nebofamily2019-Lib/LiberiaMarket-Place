const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database configuration
// Force absolute path to ensure we hit the right DB
const dbPath = path.join(__dirname, '../database/libmarket.sqlite');

console.log(`Using database: ${dbPath}`);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log
});

async function updateMobileMoneySchema() {
  try {
    console.log('🔄 Checking mobile_money_accounts table schema...');
    
    const queryInterface = sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable('mobile_money_accounts');
    
    // Check for last_used_at column
    if (!tableInfo.last_used_at) {
      console.log('⚠️ last_used_at column missing. Adding it now...');
      await queryInterface.addColumn('mobile_money_accounts', 'last_used_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added last_used_at column');
    } else {
      console.log('✅ last_used_at column already exists');
    }

    // Check for metadata column (just in case)
    if (!tableInfo.metadata) {
      console.log('⚠️ metadata column missing. Adding it now...');
      await queryInterface.addColumn('mobile_money_accounts', 'metadata', {
        type: Sequelize.JSON,
        allowNull: true
      });
      console.log('✅ Added metadata column');
    } else {
      console.log('✅ metadata column already exists');
    }

    console.log('✨ Mobile Money Account schema update complete');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

updateMobileMoneySchema();
