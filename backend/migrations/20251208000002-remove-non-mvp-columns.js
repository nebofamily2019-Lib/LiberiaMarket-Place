'use strict';

/**
 * Migration: Remove Non-MVP Columns
 * Removes columns not needed for Facebook Marketplace MVP from core tables
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🗑️  Removing non-MVP columns...');

      // Users table - remove stats and verification fields
      const usersColumns = ['avg_rating', 'total_reviews', 'total_sales', 'response_rate', 'is_verified', 'last_login_at', 'failed_login_attempts', 'locked_until'];
      for (const column of usersColumns) {
        try {
          await queryInterface.removeColumn('users', column, { transaction });
          console.log(`  ✓ Removed users.${column}`);
        } catch (err) {
          console.log(`  ⚠ Column users.${column} not found (already removed or never existed)`);
        }
      }

      // Products table - remove stats fields
      const productsColumns = ['view_count', 'favorite_count', 'is_negotiable', 'tags'];
      for (const column of productsColumns) {
        try {
          await queryInterface.removeColumn('products', column, { transaction });
          console.log(`  ✓ Removed products.${column}`);
        } catch (err) {
          console.log(`  ⚠ Column products.${column} not found (already removed or never existed)`);
        }
      }

      // Conversations table - remove mute/archive features
      const conversationsColumns = ['is_muted', 'is_archived', 'last_message_at', 'last_message_preview', 'buyer_unread_count', 'seller_unread_count'];
      for (const column of conversationsColumns) {
        try {
          await queryInterface.removeColumn('conversations', column, { transaction });
          console.log(`  ✓ Removed conversations.${column}`);
        } catch (err) {
          console.log(`  ⚠ Column conversations.${column} not found (already removed or never existed)`);
        }
      }

      // Messages table - remove read status
      const messagesColumns = ['is_read', 'read_at'];
      for (const column of messagesColumns) {
        try {
          await queryInterface.removeColumn('messages', column, { transaction });
          console.log(`  ✓ Removed messages.${column}`);
        } catch (err) {
          console.log(`  ⚠ Column messages.${column} not found (already removed or never existed)`);
        }
      }

      // Offers table - remove counter-offer fields
      const offersColumns = ['counter_amount', 'counter_message', 'responded_by', 'expires_at', 'original_price'];
      for (const column of offersColumns) {
        try {
          await queryInterface.removeColumn('offers', column, { transaction });
          console.log(`  ✓ Removed offers.${column}`);
        } catch (err) {
          console.log(`  ⚠ Column offers.${column} not found (already removed or never existed)`);
        }
      }

      await transaction.commit();
      console.log('✅ Non-MVP columns removed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing columns:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      console.log('🔄 Restoring non-MVP columns...');

      // Users table
      await queryInterface.addColumn('users', 'avg_rating', { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('users', 'total_reviews', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('users', 'total_sales', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('users', 'response_rate', { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('users', 'is_verified', { type: Sequelize.BOOLEAN, defaultValue: false }, { transaction });
      await queryInterface.addColumn('users', 'last_login_at', { type: Sequelize.DATE }, { transaction });
      await queryInterface.addColumn('users', 'failed_login_attempts', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('users', 'locked_until', { type: Sequelize.DATE }, { transaction });

      // Products table
      await queryInterface.addColumn('products', 'view_count', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('products', 'favorite_count', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('products', 'is_negotiable', { type: Sequelize.BOOLEAN, defaultValue: true }, { transaction });
      await queryInterface.addColumn('products', 'tags', { type: Sequelize.TEXT }, { transaction });

      // Conversations table
      await queryInterface.addColumn('conversations', 'is_muted', { type: Sequelize.BOOLEAN, defaultValue: false }, { transaction });
      await queryInterface.addColumn('conversations', 'is_archived', { type: Sequelize.BOOLEAN, defaultValue: false }, { transaction });
      await queryInterface.addColumn('conversations', 'last_message_at', { type: Sequelize.DATE }, { transaction });
      await queryInterface.addColumn('conversations', 'last_message_preview', { type: Sequelize.STRING(255) }, { transaction });
      await queryInterface.addColumn('conversations', 'buyer_unread_count', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });
      await queryInterface.addColumn('conversations', 'seller_unread_count', { type: Sequelize.INTEGER, defaultValue: 0 }, { transaction });

      // Messages table
      await queryInterface.addColumn('messages', 'is_read', { type: Sequelize.BOOLEAN, defaultValue: false }, { transaction });
      await queryInterface.addColumn('messages', 'read_at', { type: Sequelize.DATE }, { transaction });

      // Offers table
      await queryInterface.addColumn('offers', 'counter_amount', { type: Sequelize.DECIMAL(10, 2) }, { transaction });
      await queryInterface.addColumn('offers', 'counter_message', { type: Sequelize.TEXT }, { transaction });
      await queryInterface.addColumn('offers', 'responded_by', { type: Sequelize.INTEGER }, { transaction });
      await queryInterface.addColumn('offers', 'expires_at', { type: Sequelize.DATE }, { transaction });
      await queryInterface.addColumn('offers', 'original_price', { type: Sequelize.DECIMAL(10, 2) }, { transaction });

      await transaction.commit();
      console.log('✅ Columns restored successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error restoring columns:', error);
      throw error;
    }
  }
};
