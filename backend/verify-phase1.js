const { sequelize, User, Product, SavedItem, Notification, Report } = require('./src/models');

async function testModels() {
  try {
    console.log('Testing model loading...');
    
    if (!SavedItem) throw new Error('SavedItem model not loaded');
    if (!Notification) throw new Error('Notification model not loaded');
    if (!Report) throw new Error('Report model not loaded');

    console.log('✅ All new models loaded successfully');

    console.log('Checking associations...');
    
    // Check SavedItem associations
    if (!SavedItem.associations.user) throw new Error('SavedItem -> User association missing');
    if (!SavedItem.associations.product) throw new Error('SavedItem -> Product association missing');
    console.log('✅ SavedItem associations verified');

    // Check Notification associations
    if (!Notification.associations.user) throw new Error('Notification -> User association missing');
    console.log('✅ Notification associations verified');

    // Check Report associations
    if (!Report.associations.reporter) throw new Error('Report -> Reporter association missing');
    if (!Report.associations.reportedUser) throw new Error('Report -> ReportedUser association missing');
    if (!Report.associations.product) throw new Error('Report -> Product association missing');
    console.log('✅ Report associations verified');

    console.log('🎉 Phase 1 verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

testModels();
