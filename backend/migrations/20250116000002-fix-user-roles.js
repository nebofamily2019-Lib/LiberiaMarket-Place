'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update any users with invalid 'both' role to 'seller'
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET role = 'seller' 
      WHERE role NOT IN ('buyer', 'seller', 'admin')
    `);

    console.log('✅ Fixed invalid user roles');
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed
  }
};
