'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('products');
    
    if (!tableInfo.deleted_at && !tableInfo.deletedAt) {
      await queryInterface.addColumn('products', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      console.log('✅ Added deleted_at column to products');
    } else {
      console.log('ℹ️ deleted_at column already exists');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'deleted_at');
  }
};
