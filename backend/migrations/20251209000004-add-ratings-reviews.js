'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('reviews')) {
      await queryInterface.createTable('reviews', {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        reviewer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        reviewee_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
        product_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'products', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        offer_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'offers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
        rating: { type: Sequelize.INTEGER, allowNull: false },
        comment: { type: Sequelize.TEXT, allowNull: true },
        review_type: { type: Sequelize.ENUM('seller', 'buyer', 'product'), allowNull: false, defaultValue: 'seller' },
        is_verified_purchase: { type: Sequelize.BOOLEAN, defaultValue: false },
        helpful_count: { type: Sequelize.INTEGER, defaultValue: 0 },
        response: { type: Sequelize.TEXT, allowNull: true },
        responded_at: { type: Sequelize.DATE, allowNull: true },
        is_visible: { type: Sequelize.BOOLEAN, defaultValue: true },
        moderation_status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'approved' },
        moderation_notes: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
      });

      await queryInterface.addIndex('reviews', ['reviewer_id']);
      await queryInterface.addIndex('reviews', ['reviewee_id']);
      await queryInterface.addIndex('reviews', ['product_id']);
      await queryInterface.addIndex('reviews', ['offer_id']);
      await queryInterface.addIndex('reviews', ['rating']);
      await queryInterface.addIndex('reviews', ['review_type']);
      await queryInterface.addIndex('reviews', ['is_visible']);
      await queryInterface.addIndex('reviews', ['created_at']);

      try {
        await queryInterface.addConstraint('reviews', {
          fields: ['reviewer_id', 'reviewee_id', 'offer_id'],
          type: 'unique',
          name: 'unique_review_per_transaction'
        });
      } catch (err) {
        console.log('  ⚠ Unique constraint already exists or could not be added');
      }
    } else {
      console.log('ℹ️ Reviews table already exists, skipping creation');
    }

    // Add user stat columns idempotently
    const usersDesc = await queryInterface.describeTable('users');
    const addUserCol = async (col, def) => {
      if (!usersDesc[col]) {
        try { await queryInterface.addColumn('users', col, def); } catch (e) {}
      }
    };
    await addUserCol('avg_rating', { type: Sequelize.DECIMAL(3, 2), allowNull: true, defaultValue: null });
    await addUserCol('total_reviews', { type: Sequelize.INTEGER, defaultValue: 0 });
    await addUserCol('total_sales', { type: Sequelize.INTEGER, defaultValue: 0 });
    await addUserCol('response_rate', { type: Sequelize.INTEGER, defaultValue: null });
    await addUserCol('avg_response_time', { type: Sequelize.INTEGER, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'avg_response_time');
    await queryInterface.removeColumn('users', 'response_rate');
    await queryInterface.removeColumn('users', 'total_sales');
    await queryInterface.removeColumn('users', 'total_reviews');
    await queryInterface.removeColumn('users', 'avg_rating');
    await queryInterface.dropTable('reviews');
  }
};
