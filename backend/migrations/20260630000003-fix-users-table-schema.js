'use strict';

/**
 * The users table has duplicate camelCase + snake_case columns from a botched column-rename migration.
 * Sequelize writes snake_case columns (underscored: true) but the old camelCase columns still have
 * NOT NULL constraints, causing every INSERT to fail.
 * Since the table is empty in dev/test, we drop it and recreate it cleanly.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the problem columns exist
    const desc = await queryInterface.describeTable('users');
    if (!desc.createdAt) {
      console.log('ℹ️ users table already has clean schema, skipping');
      return;
    }

    console.log('🔧 Recreating users table to remove duplicate camelCase columns...');

    // Preserve any existing rows (should be 0 in a fresh dev DB)
    const [existing] = await queryInterface.sequelize.query('SELECT * FROM users');

    await queryInterface.dropTable('users');

    await queryInterface.createTable('users', {
      id:                       { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name:                     { type: Sequelize.STRING(100), allowNull: false },
      phone:                    { type: Sequelize.STRING(20), allowNull: false, unique: true },
      email:                    { type: Sequelize.STRING(255), allowNull: true, unique: true },
      password:                 { type: Sequelize.STRING(255), allowNull: false },
      gender:                   { type: Sequelize.STRING(10), allowNull: true },
      role:                     { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'buyer' },
      roles:                    { type: Sequelize.STRING, allowNull: true, defaultValue: 'buyer' },
      is_active:                { type: Sequelize.BOOLEAN, defaultValue: true },
      is_verified:              { type: Sequelize.BOOLEAN, defaultValue: false },
      reset_password_token:     { type: Sequelize.STRING(255), allowNull: true },
      reset_password_expire:    { type: Sequelize.DATE, allowNull: true },
      token_version:            { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      county_id:                { type: Sequelize.UUID, allowNull: true, references: { model: 'counties', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      sms_notifications_enabled:{ type: Sequelize.BOOLEAN, defaultValue: true },
      sms_preferences:          { type: Sequelize.JSON, allowNull: true },
      avg_rating:               { type: Sequelize.DECIMAL(3, 2), allowNull: true },
      total_reviews:            { type: Sequelize.INTEGER, defaultValue: 0 },
      total_sales:              { type: Sequelize.INTEGER, defaultValue: 0 },
      response_rate:            { type: Sequelize.INTEGER, allowNull: true },
      avg_response_time:        { type: Sequelize.INTEGER, allowNull: true },
      deleted_at:               { type: Sequelize.DATE, allowNull: true },
      created_at:               { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at:               { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // Re-insert any preserved rows (none expected in dev)
    for (const row of existing) {
      try {
        await queryInterface.sequelize.query(
          `INSERT INTO users (id, name, phone, email, password, role, roles, is_active, token_version, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          { replacements: [row.id, row.name, row.phone, row.email || null, row.password, row.role || 'buyer', row.roles || 'buyer', row.is_active ?? 1, row.token_version || 0] }
        );
      } catch (e) {
        console.warn(`⚠️ Could not restore row ${row.id}: ${e.message}`);
      }
    }

    await queryInterface.addIndex('users', ['county_id']);
    console.log('✅ Users table recreated with clean schema');
  },

  async down(queryInterface) {
    console.log('⚠️ Cannot safely reverse users table recreation');
  }
};
