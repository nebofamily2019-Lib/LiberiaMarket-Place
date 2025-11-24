'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if columns already exist before adding
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.loginAttempts) {
      await queryInterface.addColumn('users', 'loginAttempts', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }

    if (!tableDescription.lockUntil) {
      await queryInterface.addColumn('users', 'lockUntil', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    console.log('✅ Security fields added to users table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'loginAttempts');
    await queryInterface.removeColumn('users', 'lockUntil');
    console.log('✅ Security fields removed from users table');
  }
};
