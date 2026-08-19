/**
 * Database Indexes Configuration
 * Optimizes query performance by adding strategic indexes
 *
 * WHY INDEXES MATTER:
 * - Without indexes: Database scans ENTIRE table (slow for large datasets)
 * - With indexes: Database jumps directly to relevant rows (fast)
 *
 * Security Engineer's Note:
 * - Indexes on foreign keys prevent slow JOIN queries
 * - Indexes on frequently-searched fields (status, seller_id, etc.)
 * - Composite indexes for common query patterns
 * - Be careful: Too many indexes slow down INSERT/UPDATE
 */

const logger = require('../utils/logger');

/**
 * Apply Strategic Indexes to Database
 *
 * @param {Sequelize} sequelize - Sequelize instance
 * @returns {Promise<Object>} - Result of index creation
 */
const applyIndexes = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();
  const dialect = sequelize.options.dialect;

  const results = {
    created: [],
    skipped: [],
    errors: []
  };

  logger.info('🔧 Applying database indexes for query optimization...');

  /**
   * Helper: Create index with error handling
   */
  const createIndex = async (tableName, columns, options = {}) => {
    const indexName = options.name || `idx_${tableName}_${columns.join('_')}`;

    try {
      // Check if index already exists
      const indexes = await queryInterface.showIndex(tableName);
      const exists = indexes.some(idx => idx.name === indexName);

      if (exists) {
        logger.debug(`Index already exists: ${indexName}`);
        results.skipped.push(indexName);
        return;
      }

      // Create index
      await queryInterface.addIndex(tableName, columns, {
        name: indexName,
        ...options
      });

      logger.info(`✅ Created index: ${indexName} on ${tableName}(${columns.join(', ')})`);
      results.created.push(indexName);
    } catch (error) {
      logger.error(`❌ Failed to create index ${indexName}:`, {
        error: error.message,
        table: tableName,
        columns
      });
      results.errors.push({ index: indexName, error: error.message });
    }
  };

  try {
    // ============================================================
    // INDEX CREATION LOGIC
    // ============================================================

    if (dialect === 'sqlite') {
        // Defensive: Remove all possible lingering indexes on users and categories
        const userIndexes = [
          'idx_users_email',
          'idx_users_phone',
          'idx_users_role',
          'idx_users_is_active',
          'idx_users_role_active'
        ];
        for (const idx of userIndexes) {
          await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${idx};`);
        }
        const categoryIndexes = [
          'idx_categories_sort_order',
          'idx_categories_is_active'
        ];
        for (const idx of categoryIndexes) {
          await queryInterface.sequelize.query(`DROP INDEX IF EXISTS ${idx};`);
        }
      // USERS
      await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);');
      await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(isActive);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, isActive);');

      // PRODUCTS
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(createdAt);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_category_status_deleted ON products(category_id, status, deleted_at);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_seller_status ON products(seller_id, status);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);');

      // CATEGORIES
      await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);');
      // NOTE: idx_categories_is_active does not exist in schema/migrations, skip for SQLite

      // OFFERS
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_product_status ON offers(product_id, status);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_offers_seller_status_created ON offers(seller_id, status, createdAt);');

      // CONVERSATIONS
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_conversations_listing_id ON conversations(listing_id);');

      // MESSAGES
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(createdAt);');
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, createdAt);');

      // Postgres full-text search index (unchanged)
    } else {
      // Fallback for other dialects
      await createIndex('users', ['phone'], { name: 'idx_users_phone', unique: true });
      await createIndex('users', ['email'], { name: 'idx_users_email', unique: true });
      await createIndex('users', ['role'], { name: 'idx_users_role' });
      await createIndex('users', ['isActive'], { name: 'idx_users_is_active' });
      await createIndex('users', ['role', 'isActive'], { name: 'idx_users_role_active' });

      await createIndex('products', ['seller_id'], { name: 'idx_products_seller_id' });
      await createIndex('products', ['category_id'], { name: 'idx_products_category_id' });
      await createIndex('products', ['status'], { name: 'idx_products_status' });
      await createIndex('products', ['location'], { name: 'idx_products_location', where: { location: { $ne: null } } });
      await createIndex('products', ['price'], { name: 'idx_products_price' });
      await createIndex('products', ['deleted_at'], { name: 'idx_products_deleted_at' });
      await createIndex('products', ['createdAt'], { name: 'idx_products_created_at' });
      await createIndex('products', ['category_id', 'status', 'deleted_at'], { name: 'idx_products_category_status_deleted' });
      await createIndex('products', ['seller_id', 'status'], { name: 'idx_products_seller_status' });

      if (dialect === 'postgres') {
        await queryInterface.sequelize.query(`
          CREATE INDEX IF NOT EXISTS idx_products_title_search
          ON products USING gin(to_tsvector('english', title))
        `);
        results.created.push('idx_products_title_search (GIN)');
      } else {
        await createIndex('products', ['title'], { name: 'idx_products_title' });
      }

      await createIndex('categories', ['slug'], { name: 'idx_categories_slug', unique: true });
      await createIndex('categories', ['name'], { name: 'idx_categories_name' });

      await createIndex('offers', ['product_id'], { name: 'idx_offers_product_id' });
      await createIndex('offers', ['buyer_id'], { name: 'idx_offers_buyer_id' });
      await createIndex('offers', ['seller_id'], { name: 'idx_offers_seller_id' });
      await createIndex('offers', ['status'], { name: 'idx_offers_status' });
      await createIndex('offers', ['product_id', 'status'], { name: 'idx_offers_product_status' });
      await createIndex('offers', ['seller_id', 'status', 'createdAt'], { name: 'idx_offers_seller_status_created' });

      await createIndex('conversations', ['buyer_id'], { name: 'idx_conversations_buyer_id' });
      await createIndex('conversations', ['seller_id'], { name: 'idx_conversations_seller_id' });
      await createIndex('conversations', ['listing_id'], { name: 'idx_conversations_listing_id' });

      await createIndex('messages', ['conversation_id'], { name: 'idx_messages_conversation_id' });
      await createIndex('messages', ['sender_id'], { name: 'idx_messages_sender_id' });
      await createIndex('messages', ['createdAt'], { name: 'idx_messages_created_at' });
      await createIndex('messages', ['conversation_id', 'createdAt'], { name: 'idx_messages_conversation_created' });
    }

    // ============================================================
    // SUMMARY
    // ============================================================

    logger.info('\n📊 Index Creation Summary:', {
      created: results.created.length,
      skipped: results.skipped.length,
      errors: results.errors.length
    });

    if (results.created.length > 0) {
      logger.info('✅ Created indexes:', results.created);
    }

    if (results.errors.length > 0) {
      logger.warn('⚠️ Failed to create some indexes:', results.errors);
    }

    return results;
  } catch (error) {
    logger.error('❌ Fatal error applying indexes:', {
      error: error.message
    });
    throw error;
  }
};

/**
 * Remove all custom indexes (for migration rollback)
 */
const removeIndexes = async (sequelize) => {
  const queryInterface = sequelize.getQueryInterface();

  logger.info('🗑️ Removing custom indexes...');

  // List of all custom index names
  const indexNames = [
    // Users
    'idx_users_phone',
    'idx_users_email',
    'idx_users_role',
    'idx_users_is_active',
    'idx_users_role_active',
    // Products
    'idx_products_seller_id',
    'idx_products_category_id',
    'idx_products_status',
    'idx_products_location',
    'idx_products_price',
    'idx_products_deleted_at',
    'idx_products_created_at',
    'idx_products_category_status_deleted',
    'idx_products_seller_status',
    'idx_products_title',
    'idx_products_title_search',
    // Categories
    'idx_categories_slug',
    'idx_categories_name',
    // Offers
    'idx_offers_product_id',
    'idx_offers_buyer_id',
    'idx_offers_seller_id',
    'idx_offers_status',
    'idx_offers_product_status',
    'idx_offers_seller_status_created',
    // Conversations
    'idx_conversations_buyer_id',
    'idx_conversations_seller_id',
    'idx_conversations_listing_id',
    // Messages
    'idx_messages_conversation_id',
    'idx_messages_sender_id',
    'idx_messages_created_at',
    'idx_messages_conversation_created'
  ];

  const results = { removed: [], errors: [] };

  for (const indexName of indexNames) {
    try {
      // Extract table name from index name
      const tableName = indexName.split('_')[1] + 's';  // idx_users_phone -> users

      await queryInterface.removeIndex(tableName, indexName);
      logger.info(`✅ Removed index: ${indexName}`);
      results.removed.push(indexName);
    } catch (error) {
      // Index might not exist, that's okay
      logger.debug(`Skipped ${indexName}: ${error.message}`);
    }
  }

  logger.info(`✅ Removed ${results.removed.length} indexes`);
  return results;
};

module.exports = {
  applyIndexes,
  removeIndexes
};
