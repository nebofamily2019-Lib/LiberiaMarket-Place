const { sequelize } = require('../src/config/database');
const { 
  User, 
  Product, 
  Offer, 
  Conversation, 
  Message, 
  MobileMoneyAccount, 
  Payment, 
  Review, 
  SavedItem, 
  Notification, 
  Report, 
  UserActivity 
} = require('../src/models');

async function resetUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('🗑️  Starting cleanup of user data...');

    // Delete in order of dependency to avoid foreign key constraints
    
    console.log('...Deleting Messages');
    await Message.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Conversations');
    await Conversation.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Payments');
    await sequelize.models.Payment.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Offers');
    await Offer.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Mobile Money Accounts');
    await sequelize.models.MobileMoneyAccount.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Reviews');
    await sequelize.models.Review.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Saved Items');
    await SavedItem.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Notifications');
    await sequelize.models.Notification.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting Reports');
    await sequelize.models.Report.destroy({ where: {}, truncate: false });
    
    console.log('...Deleting User Activity');
    await UserActivity.destroy({ where: {}, truncate: false });

    console.log('...Deleting Products');
    await Product.destroy({ where: {}, truncate: false });

    console.log('...Deleting Users');
    await User.destroy({ where: {}, truncate: false });

    console.log('✨ All users and related data have been successfully deleted.');
    
  } catch (error) {
    console.error('❌ Error resetting users:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

resetUsers();
