'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add roles column to users_test table
    // await queryInterface.addColumn('users', 'roles', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    //   defaultValue: null,
    //   comment: 'Comma-separated roles: buyer,seller,admin'
    // });

    // Migrate existing single role to roles field
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET roles = role 
      WHERE roles IS NULL
    `);

    console.log('✅ Added roles column and migrated existing data');
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('users', 'roles');
  }
};
