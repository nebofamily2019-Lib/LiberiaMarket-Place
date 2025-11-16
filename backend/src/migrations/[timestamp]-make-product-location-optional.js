'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    
    await queryInterface.changeColumn('products', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('products', 'location', {
      type: Sequelize.STRING,
      allowNull: false
    });
    
    await queryInterface.changeColumn('products', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
