const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('offers');
    if (desc.expires_at) { console.log('ℹ️ expires_at already exists, skipping'); return; }
    await queryInterface.addColumn('offers', 'expires_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('offers', 'expires_at');
  }
};
