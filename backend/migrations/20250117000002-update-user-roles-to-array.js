'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // For SQLite, we'll use a comma-separated string to store multiple roles
    // Add a new column for multiple roles
    await queryInterface.addColumn('users', 'roles', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Comma-separated roles: buyer,seller,admin'
    });

    // Migrate existing single role to roles field
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET roles = role 
      WHERE roles IS NULL
    `);

    console.log('✅ Migrated single role to roles field');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'roles');
  }
};
