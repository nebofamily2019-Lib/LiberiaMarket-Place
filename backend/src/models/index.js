const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import model classes
const UserModel = require('./User');
const CategoryModel = require('./Category');
const ProductModel = require('./Product');
const JobModel = require('./Job');
const NotificationModel = require('./Notification');
const MessageModel = require('./Message');

// Initialize models with sequelize instance
const User = UserModel.init(sequelize);
const Category = CategoryModel.init(sequelize);
const Product = ProductModel.init(sequelize);
const Job = JobModel.init(sequelize);
const Notification = NotificationModel.init(sequelize);
const Message = MessageModel.init(sequelize);

// Create models object
const models = {
  User,
  Category,
  Product,
  Job,
  Notification,
  Message
};

// Set up associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database
const syncDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synced');
    }
  } catch (error) {
    console.error('❌ Database sync error:', error);
  }
};

// Export everything
module.exports = {
  sequelize,
  Sequelize,
  User,
  Category,
  Product,
  Job,
  Notification,
  Message,
  syncDatabase
};