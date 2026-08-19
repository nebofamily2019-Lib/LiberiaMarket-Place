'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('users');
    if (desc.token_version) { console.log('ℹ️ token_version already exists, skipping'); return; }
    await queryInterface.addColumn('users', 'token_version', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'token_version');
  }
};
