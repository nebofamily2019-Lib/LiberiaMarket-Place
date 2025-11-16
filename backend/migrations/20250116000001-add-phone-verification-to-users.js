'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'isPhoneVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'SMS verification status'
    });

    await queryInterface.addColumn('users', 'verificationToken', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Token for phone/email verification'
    });

    await queryInterface.addColumn('users', 'verificationTokenExpire', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiration time for verification token'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'isPhoneVerified');
    await queryInterface.removeColumn('users', 'verificationToken');
    await queryInterface.removeColumn('users', 'verificationTokenExpire');
  }
};
