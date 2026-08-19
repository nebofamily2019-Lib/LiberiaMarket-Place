'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if 'image' column exists (old single image field)
    const tableDescription = await queryInterface.describeTable('products');

    if (tableDescription.image) {
      // Remove old 'image' column if it exists
      await queryInterface.removeColumn('products', 'image');
    }

    // Add new 'images' column as JSON array
    if (!tableDescription.images) {
      await queryInterface.addColumn('products', 'images', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: remove images column and restore single image column
    await queryInterface.removeColumn('products', 'images');
    await queryInterface.addColumn('products', 'image', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
