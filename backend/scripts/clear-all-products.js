const { sequelize } = require('../src/config/database');
const { Product, Offer, SavedItem, Review, Report, Notification, Conversation, Message } = require('../src/models');

async function clearAllProducts() {
  try {
    console.log('🧹 Starting cleanup of ALL products and related data...');

    // 0. Delete Messages and Conversations (related to products)
    try {
      const deletedMessages = await Message.destroy({ where: {}, force: true });
      console.log(`✅ Deleted ${deletedMessages} messages`);
      
      const deletedConversations = await Conversation.destroy({ where: {}, force: true });
      console.log(`✅ Deleted ${deletedConversations} conversations`);
    } catch (e) {
      console.log('⚠️ Could not delete conversations/messages:', e.message);
    }

    // 1. Delete Offers
    const deletedOffers = await Offer.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedOffers} offers`);

    // 2. Delete SavedItems
    try {
      const deletedSavedItems = await SavedItem.destroy({ where: {}, force: true });
      console.log(`✅ Deleted ${deletedSavedItems} saved items`);
    } catch (e) {
      console.log('⚠️ Could not delete saved items (table might not exist)');
    }

    // 3. Delete Reviews
    try {
      const deletedReviews = await Review.destroy({ where: {}, force: true });
      console.log(`✅ Deleted ${deletedReviews} reviews`);
    } catch (e) {
      console.log('⚠️ Could not delete reviews (table might not exist)');
    }

    // 4. Delete Reports (related to products)
    try {
      const deletedReports = await Report.destroy({ where: {}, force: true });
      console.log(`✅ Deleted ${deletedReports} reports`);
    } catch (e) {
      console.log('⚠️ Could not delete reports (table might not exist)');
    }

    // 5. Delete Products
    const deletedProducts = await Product.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedProducts} products`);

    console.log('\n✨ Cleanup complete! All products have been removed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
}

clearAllProducts();
