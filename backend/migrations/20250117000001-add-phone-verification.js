'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.isPhoneVerified) {
      await queryInterface.addColumn('users', 'isPhoneVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }

    if (!tableInfo.verificationToken) {
      await queryInterface.addColumn('users', 'verificationToken', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    if (!tableInfo.verificationTokenExpire) {
      await queryInterface.addColumn('users', 'verificationTokenExpire', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'isPhoneVerified');
    await queryInterface.removeColumn('users', 'verificationToken');
    await queryInterface.removeColumn('users', 'verificationTokenExpire');
  }
};
