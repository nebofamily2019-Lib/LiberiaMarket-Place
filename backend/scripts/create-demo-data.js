const { sequelize, User, Product, Category, Offer } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createDemoData() {
  console.log('🚀 Creating Demo Data for Presentation...\n');

  try {
    // 1. Create Seller (Ma Juah)
    const sellerPassword = await bcrypt.hash('password123', 10);
    const [seller, createdSeller] = await User.findOrCreate({
      where: { phone: '088612345' }, // Valid Liberian number
      defaults: {
        name: 'Ma Juah',
        email: 'majuah@market.lib',
        password: sellerPassword,
        role: 'seller',
        isActive: true
        // Removed isVerified as it might not be in the model definition or handled differently
      }
    });
    console.log(createdSeller ? '✅ Created Seller: Ma Juah (088612345)' : 'ℹ️ Seller Ma Juah already exists');

    // 2. Create Buyer (Kofi)
    const buyerPassword = await bcrypt.hash('password123', 10);
    const [buyer, createdBuyer] = await User.findOrCreate({
      where: { phone: '077712345' }, // Valid Liberian number
      defaults: {
        name: 'Kofi',
        email: 'kofi@buyer.lib',
        password: buyerPassword,
        role: 'buyer',
        isActive: true
        // Removed isVerified
      }
    });
    console.log(createdBuyer ? '✅ Created Buyer: Kofi (077712345)' : 'ℹ️ Buyer Kofi already exists');

    // 3. Create Product for Ma Juah
    // Find category first
    const riceCategory = await Category.findOne({ where: { slug: 'market-grounds' } });
    
    if (riceCategory) {
      const [product, createdProduct] = await Product.findOrCreate({
        where: { title: 'Parboiled Rice (25kg)' },
        defaults: {
          description: 'Fresh stock, clean rice. Good for family. Price is negotiable.',
          price: 45.00,
          currency: 'USD',
          location: 'Red Light Market',
          condition: 'new',
          status: 'active',
          seller_id: seller.id,
          category_id: riceCategory.id,
          images: [] // Add placeholder image URL if available
        }
      });
      console.log(createdProduct ? '✅ Created Product: Parboiled Rice' : 'ℹ️ Product already exists');
    } else {
      console.warn('⚠️ Could not find "Market Grounds" category. Skipping product creation.');
    }

    console.log('\n✨ Demo Data Setup Complete!');
    console.log('----------------------------------------');
    console.log('👤 Seller Login: 088612345 / password123');
    console.log('👤 Buyer Login:  077712345 / password123');
    console.log('----------------------------------------');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  }
}

createDemoData();