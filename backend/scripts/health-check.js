const { sequelize, User, Category, Product } = require('../src/models');

async function runHealthCheck() {
  console.log('🏥 Starting System Health Check...\n');

  try {
    // 1. Database Connection
    await sequelize.authenticate();
    console.log('✅ Database Connection: OK');

    // 2. Check Categories (Liberian Context)
    const categories = await Category.findAll();
    const requiredCategories = ['Market Grounds', 'Fashion & Tailoring', 'Phones & Electronics'];
    const hasRequired = requiredCategories.every(req => 
      categories.some(c => c.name === req)
    );
    
    if (hasRequired) {
      console.log(`✅ Categories: OK (${categories.length} found, including local categories)`);
    } else {
      console.warn('⚠️ Categories: WARNING (Local categories missing)');
    }

    // 3. Check Users
    const userCount = await User.count();
    console.log(`✅ Users: OK (${userCount} users in database)`);

    // 4. Check Products
    const productCount = await Product.count();
    console.log(`✅ Products: OK (${productCount} active listings)`);

    console.log('\n🎉 SYSTEM READY FOR DEMO');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Health Check FAILED:', error.message);
    process.exit(1);
  }
}

runHealthCheck();