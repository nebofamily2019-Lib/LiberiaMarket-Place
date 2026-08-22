const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('conversations');
    if (desc.last_message_at) {
      console.log('ℹ️ last_message_at already exists, skipping');
      return;
    }
    await queryInterface.addColumn('conversations', 'last_message_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('conversations', 'last_message_at');
  }
};
