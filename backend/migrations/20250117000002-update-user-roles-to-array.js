'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Migrate existing single role to roles field
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET roles = role 
      WHERE roles IS NULL
    `);

    console.log('✅ Migrated single role to roles field');
  },

  async down(queryInterface, Sequelize) {
    // Only remove the column if it exists
    try {
      await queryInterface.removeColumn('users', 'roles');
    } catch (err) {
      // Ignore error if column does not exist
    }
  }
};
