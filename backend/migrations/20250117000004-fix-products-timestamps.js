'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('products');
    
    // Add created_at if missing
    if (!tableInfo.created_at && !tableInfo.createdAt) {
      await queryInterface.addColumn('products', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      console.log('✅ Added created_at column');
    }

    // Add updated_at if missing
    if (!tableInfo.updated_at && !tableInfo.updatedAt) {
      await queryInterface.addColumn('products', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      console.log('✅ Added updated_at column');
    }

    // Add deleted_at if missing
    if (!tableInfo.deleted_at && !tableInfo.deletedAt) {
      await queryInterface.addColumn('products', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added deleted_at column');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'created_at');
    await queryInterface.removeColumn('products', 'updated_at');
    await queryInterface.removeColumn('products', 'deleted_at');
  }
};
