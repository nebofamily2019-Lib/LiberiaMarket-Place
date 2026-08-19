'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('products');

    // Add tags column if it doesn't exist
    if (!tableDescription.tags) {
      await queryInterface.addColumn('products', 'tags', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      });
    }

    // Add is_negotiable column if it doesn't exist
    if (!tableDescription.is_negotiable) {
      await queryInterface.addColumn('products', 'is_negotiable', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      });
    }

    // Add contact_phone column if contactPhone doesn't exist and contact_phone doesn't exist
    if (!tableDescription.contact_phone && tableDescription.contactPhone) {
      // Column exists as contactPhone, no action needed
      console.log('contactPhone column already exists');
    } else if (!tableDescription.contact_phone) {
      await queryInterface.addColumn('products', 'contact_phone', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'tags');
    await queryInterface.removeColumn('products', 'is_negotiable');
  }
};
