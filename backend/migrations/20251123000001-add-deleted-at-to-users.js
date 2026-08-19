'use strict';

/**
 * Add deleted_at column for soft deletes (paranoid mode)
 * The User model has paranoid: true, which requires this column
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.deleted_at) {
      console.log('ℹ️ deleted_at column already exists on users table, skipping');
      return;
    }
    await queryInterface.addColumn('users', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when user was soft deleted (paranoid mode)'
    });
    console.log('✅ Added deleted_at column to users table');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'deleted_at');
    console.log('✅ Removed deleted_at column from users table');
  }
};
