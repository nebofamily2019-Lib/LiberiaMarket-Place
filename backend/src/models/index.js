// Import optimized database configuration

const { sequelize, testConnection } = require('../config/database');
const { applyIndexes } = require('../config/indexes');
// Only require logger if not in test environment
const isTestEnv = process.env.NODE_ENV === 'test';

// Import model classes (MVP + new features)
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Offer = require('./Offer');
const Conversation = require('./Conversation');
const Message = require('./Message');
const County = require('./County');
const MobileMoneyAccount = require('./MobileMoneyAccount');
const Payment = require('./Payment');
const SmsLog = require('./SmsLog');
const Review = require('./Review');
const SavedItem = require('./SavedItem');
const Notification = require('./Notification');
const Report = require('./Report');
const UserActivity = require('./UserActivity');


// Always initialize models and associations, regardless of environment
let logger;
try {
  logger = require('../utils/logger');
} catch (e) {
  logger = console;
}
logger.info('🔧 Initializing models...');

User.init(sequelize);
Product.init(sequelize);
Category.init(sequelize);
Offer.init(sequelize);
Conversation.init(sequelize);
Message.init(sequelize);
County(sequelize);
MobileMoneyAccount(sequelize);
Payment(sequelize);
SmsLog(sequelize);
Review(sequelize);
SavedItem.init(sequelize);
Notification(sequelize);
Report(sequelize);
UserActivity.init(sequelize);

logger.info('✅ Models initialized');

const models = {
  User,
  Product,
  Category,
  Offer,
  Conversation,
  Message,
  County: sequelize.models.County,
  MobileMoneyAccount: sequelize.models.MobileMoneyAccount,
  Payment: sequelize.models.Payment,
  SmsLog: sequelize.models.SmsLog,
  Review: sequelize.models.Review,
  SavedItem,
  Notification: sequelize.models.Notification,
  Report: sequelize.models.Report,
  UserActivity
};

if (User.associate) {
  User.associate(models);
}
if (Product.associate) {
  Product.associate(models);
}
if (Category.associate) {
  Category.associate(models);
}
if (Offer.associate) {
  Offer.associate(models);
}
if (models.County.associate) {
  models.County.associate(models);
}
if (models.MobileMoneyAccount.associate) {
  models.MobileMoneyAccount.associate(models);
}
if (models.Payment.associate) {
  models.Payment.associate(models);
}
if (models.SmsLog.associate) {
  models.SmsLog.associate(models);
}
if (models.Review.associate) {
  models.Review.associate(models);
}
if (SavedItem.associate) {
  SavedItem.associate(models);
}
if (models.Notification.associate) {
  models.Notification.associate(models);
}
if (models.Report.associate) {
  models.Report.associate(models);
}
if (UserActivity.associate) {
  UserActivity.associate(models);
}

Conversation.belongsTo(User, { as: 'buyer', foreignKey: 'buyer_id' });
Conversation.belongsTo(User, { as: 'seller', foreignKey: 'seller_id' });
Conversation.belongsTo(Product, { as: 'listing', foreignKey: 'listing_id' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });

Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });

User.hasMany(Conversation, { as: 'buyerConversations', foreignKey: 'buyer_id' });
User.hasMany(Conversation, { as: 'sellerConversations', foreignKey: 'seller_id' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'sender_id' });

logger.info('✅ Associations set up');

const syncDatabase = async () => {
  try {
    logger.info('🔄 Connecting to database...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }
    // Skip sync - using migrations instead
    // await sequelize.sync({ alter: false });
    logger.info('✅ Database connection verified');
    // Skip applyIndexes - indexes already exist from migrations
    // logger.info('🔧 Applying database indexes...');
    // const indexResults = await applyIndexes(sequelize);
    // if (indexResults.created.length > 0) {
    //   logger.info(`✅ Created ${indexResults.created.length} new indexes`);
    // }
    // if (indexResults.errors.length > 0) {
    //   logger.warn(`⚠️ ${indexResults.errors.length} indexes failed to create`);
    // }
    logger.info('✅ Database optimization complete');
  } catch (error) {
    logger.error('❌ Error syncing database:', error);
    throw error;
  }
};

// Note: syncDatabase() should be called explicitly in server.js or start.js
// NOT automatically at module load time, as it can cause startup issues

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Offer,
  Conversation,
  Message,
  County: models.County,
  MobileMoneyAccount: models.MobileMoneyAccount,
  Payment: models.Payment,
  SmsLog: models.SmsLog,
  Review: models.Review,
  SavedItem: models.SavedItem,
  Notification: models.Notification,
  Report: models.Report,
  UserActivity,
  syncDatabase
};