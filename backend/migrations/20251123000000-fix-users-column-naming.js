'use strict';

/**
 * Fix column naming to match Sequelize underscored convention
 * Model has underscored: true, so camelCase fields become snake_case in DB
 * Idempotent: checks existing columns before adding/removing.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');
    const existing = new Set(Object.keys(tableDesc));

    const addIfMissing = async (col, def) => {
      if (!existing.has(col)) {
        await queryInterface.addColumn('users', col, def);
        existing.add(col);
      }
    };

    const removeIfPresent = async (col) => {
      if (existing.has(col)) {
        await queryInterface.removeColumn('users', col);
        existing.delete(col);
      }
    };

    // 1. Add snake_case columns if missing
    await addIfMissing('is_active', { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: true });
    await addIfMissing('is_phone_verified', { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: true });
    await addIfMissing('verification_token', { type: Sequelize.STRING, allowNull: true });
    await addIfMissing('verification_token_expire', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('last_login', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('reset_password_token', { type: Sequelize.STRING, allowNull: true });
    await addIfMissing('reset_password_expire', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('login_attempts', { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false });
    await addIfMissing('lock_until', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('created_at', { type: Sequelize.DATE, allowNull: true });
    await addIfMissing('updated_at', { type: Sequelize.DATE, allowNull: true });

    // 2. Copy data only when source camelCase columns still exist
    const hasCamel = existing.has('isActive');
    if (hasCamel) {
      await queryInterface.sequelize.query(
        `UPDATE users SET
          is_active = isActive,
          is_phone_verified = isPhoneVerified,
          verification_token = verificationToken,
          verification_token_expire = verificationTokenExpire,
          last_login = lastLogin,
          reset_password_token = resetPasswordToken,
          reset_password_expire = resetPasswordExpire,
          login_attempts = loginAttempts,
          lock_until = lockUntil,
          created_at = createdAt,
          updated_at = updatedAt`
      );
    }

    // Skipping DROP of old camelCase columns — SQLite FK constraints prevent
    // DROP TABLE on `users` while products/conversations reference it.
    // The camelCase columns are harmless extra columns; Sequelize ignores them.

    console.log('✅ Successfully converted user columns to snake_case');
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Reverse: Create camelCase columns
      await queryInterface.addColumn('users', 'isActive', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }, { transaction });

      await queryInterface.addColumn('users', 'isPhoneVerified', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, { transaction });

      await queryInterface.addColumn('users', 'verificationToken', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'verificationTokenExpire', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'lastLogin', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'resetPasswordToken', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'resetPasswordExpire', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'loginAttempts', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('users', 'lockUntil', {
        type: Sequelize.DATE,
        allowNull: true
      }, { transaction });

      await queryInterface.addColumn('users', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false
      }, { transaction });

      await queryInterface.addColumn('users', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false
      }, { transaction });

      // Copy data back
      await queryInterface.sequelize.query(
        `UPDATE users SET
          isActive = is_active,
          isPhoneVerified = is_phone_verified,
          verificationToken = verification_token,
          verificationTokenExpire = verification_token_expire,
          lastLogin = last_login,
          resetPasswordToken = reset_password_token,
          resetPasswordExpire = reset_password_expire,
          loginAttempts = login_attempts,
          lockUntil = lock_until,
          createdAt = created_at,
          updatedAt = updated_at`,
        { transaction }
      );

      // Drop snake_case columns
      await queryInterface.removeColumn('users', 'is_active', { transaction });
      await queryInterface.removeColumn('users', 'is_phone_verified', { transaction });
      await queryInterface.removeColumn('users', 'verification_token', { transaction });
      await queryInterface.removeColumn('users', 'verification_token_expire', { transaction });
      await queryInterface.removeColumn('users', 'last_login', { transaction });
      await queryInterface.removeColumn('users', 'reset_password_token', { transaction });
      await queryInterface.removeColumn('users', 'reset_password_expire', { transaction });
      await queryInterface.removeColumn('users', 'login_attempts', { transaction });
      await queryInterface.removeColumn('users', 'lock_until', { transaction });
      await queryInterface.removeColumn('users', 'created_at', { transaction });
      await queryInterface.removeColumn('users', 'updated_at', { transaction });

      await transaction.commit();
      console.log('✅ Successfully reverted to camelCase columns');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error reverting columns:', error);
      throw error;
    }
  }
};
