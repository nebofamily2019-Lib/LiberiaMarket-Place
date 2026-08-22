'use strict';

/**
 * The users table has duplicate camelCase + snake_case columns from a botched column-rename migration.
 * Sequelize writes snake_case columns (underscored: true) but the old camelCase columns still have
 * NOT NULL constraints, causing every INSERT to fail.
 *
 * Originally this dropped and recreated the whole table, which works on SQLite (no FK enforcement)
 * but fails on Postgres: conversations/messages/offers/payments/etc. all hold FK constraints against
 * users.id by this point. Recreating the table also silently lost last_login_at/failed_login_attempts/
 * locked_until (added by an earlier migration but missing from the recreate's column list) and
 * downgraded response_rate from DECIMAL(5,2) to INTEGER. Instead, drop only the redundant camelCase
 * columns in place and add the handful of columns (gender, county_id, avg_response_time) that no other
 * migration creates.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('users');
    if (!desc.createdAt) {
      console.log('ℹ️ users table already has clean schema, skipping');
      return;
    }

    console.log('🔧 Removing duplicate camelCase columns from users table...');

    const camelCaseColumns = [
      'isActive', 'isPhoneVerified', 'verificationToken', 'verificationTokenExpire',
      'lastLogin', 'resetPasswordToken', 'resetPasswordExpire', 'loginAttempts',
      'lockUntil', 'createdAt', 'updatedAt'
    ];

    for (const column of camelCaseColumns) {
      if (desc[column]) {
        await queryInterface.removeColumn('users', column);
      }
    }

    if (!desc.gender) {
      await queryInterface.addColumn('users', 'gender', { type: Sequelize.STRING(10), allowNull: true });
    }

    if (!desc.avg_response_time) {
      await queryInterface.addColumn('users', 'avg_response_time', { type: Sequelize.INTEGER, allowNull: true });
    }

    if (!desc.county_id) {
      await queryInterface.addColumn('users', 'county_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'counties', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      await queryInterface.addIndex('users', ['county_id']);
    }

    console.log('✅ Users table schema cleaned up');
  },

  async down(queryInterface) {
    console.log('⚠️ Cannot safely reverse users column cleanup');
  }
};
