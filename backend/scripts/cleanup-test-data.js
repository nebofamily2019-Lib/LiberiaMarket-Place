const { Product, User } = require('../src/models');

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test/fake product data...\n');

    // Delete all products with "Test Product" in the title
    const testProducts = await Product.destroy({
      where: {
        title: { [require('sequelize').Op.like]: '%Test Product%' }
      },
      force: true // Permanently delete (skip soft delete)
    });

    console.log(`✅ Deleted ${testProducts} test products with "Test Product" in title`);

    // Delete products created by test users
    const testUserProducts = await Product.destroy({
      where: {
        seller_id: {
          [require('sequelize').Op.in]: [
            await User.findAll({
              where: {
                name: { [require('sequelize').Op.like]: '%Test%' }
              },
              attributes: ['id']
            }).then(users => users.map(u => u.id))
          ]
        }
      },
      force: true
    });

    console.log(`✅ Deleted ${testUserProducts} products from test users`);

    // Get remaining products count
    const remainingProducts = await Product.count();
    console.log(`\n📦 Remaining products: ${remainingProducts}`);

    // Show remaining products
    if (remainingProducts > 0) {
      const products = await Product.findAll({
        include: [
          {
            model: User,
            as: 'seller',
            attributes: ['name', 'phone']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      console.log('\n📋 Recent products:');
      products.forEach(p => {
        console.log(`  - ${p.title} by ${p.seller?.name} ($${p.price})`);
      });
    }

    console.log('\n✨ Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up:', error);
    process.exit(1);
  }
}

cleanupTestData();
