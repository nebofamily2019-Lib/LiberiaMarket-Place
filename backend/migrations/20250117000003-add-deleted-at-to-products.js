'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('products');
    
    // Add deleted_at column if it doesn't exist
    if (!tableInfo.deleted_at && !tableInfo.deletedAt) {
      await queryInterface.addColumn('products', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added deleted_at column to products table');
    }

    // Ensure created_at exists (for the earlier error)
    if (!tableInfo.created_at && !tableInfo.createdAt) {
      await queryInterface.addColumn('products', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      console.log('✅ Added created_at column to products table');
    }

    // Ensure updated_at exists
    if (!tableInfo.updated_at && !tableInfo.updatedAt) {
      await queryInterface.addColumn('products', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      console.log('✅ Added updated_at column to products table');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'deleted_at');
    await queryInterface.removeColumn('products', 'created_at');
    await queryInterface.removeColumn('products', 'updated_at');
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('products');
    
    // Add deleted_at column if it doesn't exist
    if (!tableInfo.deleted_at && !tableInfo.deletedAt) {
      await queryInterface.addColumn('products', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added deleted_at column to products table');
    } else {
      console.log('ℹ️ deleted_at column already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'deleted_at');
  }
};
