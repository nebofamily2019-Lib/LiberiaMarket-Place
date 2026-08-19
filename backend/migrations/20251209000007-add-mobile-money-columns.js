'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('mobile_money_accounts', 'verification_code', {
        type: Sequelize.STRING(10),
        allowNull: true
      });
    } catch (e) {
      console.log('Column verification_code already exists, skipping');
    }
    
    try {
      await queryInterface.addColumn('mobile_money_accounts', 'verification_expires_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (e) {
      console.log('Column verification_expires_at already exists, skipping');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mobile_money_accounts', 'verification_code');
    await queryInterface.removeColumn('mobile_money_accounts', 'verification_expires_at');
  }
};
