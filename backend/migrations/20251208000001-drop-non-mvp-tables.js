'use strict';

/**
 * Migration: Drop Non-MVP Tables
 * Removes tables not needed for Facebook Marketplace MVP:
 * - reviews (ratings system)
 * - followers (social following)
 * - favorites (wishlist)
 * - sales (financial tracking)
 * - payments (payment tracking)
 * - product_views (analytics)
 * - notifications (advanced notifications)
 * - reports (keep table but will simplify later)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const dropIfExists = async (table) => {
      try {
        await queryInterface.dropTable(table);
        console.log(`  ✓ Dropped ${table} table`);
      } catch (err) {
        console.log(`  ⚠ Table ${table} not found (already dropped or never existed)`);
      }
    };

    console.log('🗑️  Dropping non-MVP tables...');
    await dropIfExists('reviews');
    await dropIfExists('followers');
    await dropIfExists('favorites');
    await dropIfExists('sales');
    await dropIfExists('payments');
    await dropIfExists('product_views');
    await dropIfExists('notifications');
    console.log('✅ Non-MVP tables dropped successfully');
  },

  async down(queryInterface, Sequelize) {
    // Reverting this migration would require recreating all tables
    // This is not recommended - restore from backup instead
    console.log('⚠️  To revert this migration, restore from database backup');
    throw new Error('Cannot automatically revert table drops - restore from backup');
  }
};
