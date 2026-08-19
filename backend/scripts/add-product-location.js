const { sequelize } = require('../src/models');

const addLocationColumns = async () => {
  try {
    console.log('🔄 Adding location columns to products table...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    try {
      await queryInterface.addColumn('products', 'latitude', {
        type: 'DECIMAL(10, 8)',
        allowNull: true
      });
      console.log('✅ Added latitude column');
    } catch (error) {
      console.log('⚠️ Latitude column might already exist:', error.message);
    }

    try {
      await queryInterface.addColumn('products', 'longitude', {
        type: 'DECIMAL(11, 8)',
        allowNull: true
      });
      console.log('✅ Added longitude column');
    } catch (error) {
      console.log('⚠️ Longitude column might already exist:', error.message);
    }

    console.log('✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addLocationColumns();
