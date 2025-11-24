const { Sequelize } = require('sequelize');
const path = require('path');

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../libmarket_dev.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false
  }
});

// Import model classes
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Conversation = require('./Conversation');
const Message = require('./Message');

console.log('🔧 Initializing models...');

// Initialize models
User.init(sequelize);
Product.init(sequelize);
Category.init(sequelize);
Conversation.init(sequelize);
Message.init(sequelize);

console.log('✅ Models initialized');

// Setup associations - without Offer
const models = { User, Product, Category };

if (User.associate) {
  User.associate(models);
}
if (Product.associate) {
  Product.associate(models);
}
if (Category.associate) {
  Category.associate(models);
}

// Conversation associations
Conversation.belongsTo(User, { as: 'buyer', foreignKey: 'buyer_id' });
Conversation.belongsTo(User, { as: 'seller', foreignKey: 'seller_id' });
Conversation.belongsTo(Product, { as: 'listing', foreignKey: 'listing_id' });
Conversation.hasMany(Message, { foreignKey: 'conversation_id', as: 'messages' });

// Message associations
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });

// User associations for conversations
User.hasMany(Conversation, { as: 'buyerConversations', foreignKey: 'buyer_id' });
User.hasMany(Conversation, { as: 'sellerConversations', foreignKey: 'seller_id' });
User.hasMany(Message, { as: 'sentMessages', foreignKey: 'sender_id' });

console.log('✅ Associations set up');

// Sync database
const syncDatabase = async () => {
  try {
    console.log('🔄 Syncing database...');
    
    // Use alter: true to update existing tables without dropping data
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
  }
};

// Auto-sync in development
if (process.env.NODE_ENV === 'development') {
  syncDatabase();
}

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Conversation,
  Message,
  syncDatabase
};