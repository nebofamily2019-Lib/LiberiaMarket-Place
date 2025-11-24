const { User, Category, Product, sequelize } = require('../src/models');

async function seedSampleProducts() {
  try {
    console.log('🌱 Seeding sample products...\n');

    // Delete all test products first
    await Product.destroy({
      where: {
        title: { [require('sequelize').Op.like]: 'Test Product%' }
      }
    });
    console.log('✅ Cleared test products\n');

    // Find or create a seller
    let seller = await User.findOne({ where: { role: 'seller' } });
    
    if (!seller) {
      seller = await User.findOne({ where: { roles: { [require('sequelize').Op.like]: '%seller%' } } });
    }

    if (!seller) {
      console.log('❌ No seller found. Please create a seller account first.');
      process.exit(1);
    }

    console.log(`✅ Using seller: ${seller.name} (${seller.phone})\n`);

    // Find or create categories
    const electronicsCategory = await Category.findOrCreate({
      where: { name: 'Electronics' },
      defaults: {
        description: 'Electronic devices and gadgets',
        icon: '💻',
        color: '#3B82F6',
        slug: 'electronics'
      }
    }).then(([cat]) => cat);

    const fashionCategory = await Category.findOrCreate({
      where: { name: 'Fashion' },
      defaults: {
        description: 'Clothing and accessories',
        icon: '👔',
        color: '#EC4899',
        slug: 'fashion'
      }
    }).then(([cat]) => cat);

    const furnitureCategory = await Category.findOrCreate({
      where: { name: 'Furniture' },
      defaults: {
        description: 'Home and office furniture',
        icon: '🛋️',
        color: '#8B5CF6',
        slug: 'furniture'
      }
    }).then(([cat]) => cat);

    // Real sample products
    const sampleProducts = [
      {
        title: 'iPhone 13 Pro Max - 256GB',
        description: 'Like new iPhone 13 Pro Max, 256GB, Sierra Blue. Includes original box, charger, and case. No scratches, perfect condition. Battery health 98%.',
        price: 850,
        location: 'Monrovia, Sinkor',
        condition: 'excellent',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Samsung 55" 4K Smart TV',
        description: 'Brand new Samsung 55-inch 4K Smart TV. Crystal UHD display, built-in WiFi, Netflix, YouTube. Still in box with 2-year warranty.',
        price: 650,
        location: 'Paynesville',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Dell Laptop - Core i7, 16GB RAM',
        description: 'Dell Inspiron 15, Intel Core i7 11th Gen, 16GB RAM, 512GB SSD. Perfect for work, school, or gaming. Fast and reliable. Comes with charger and laptop bag.',
        price: 720,
        location: 'Congo Town',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Men\'s Genuine Leather Jacket',
        description: 'Genuine leather jacket, size L. Black color, barely worn. High quality Italian leather, stylish design. Perfect for cool evenings. Original price $200.',
        price: 120,
        location: 'Monrovia, Broad Street',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      },
      {
        title: 'Designer Handbag Collection (3 pcs)',
        description: 'Set of 3 designer-inspired handbags. Various colors (black, brown, beige) and styles. Great for any occasion. Durable synthetic leather, elegant design.',
        price: 75,
        location: 'Sinkor, Tubman Boulevard',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      },
      {
        title: 'Women\'s Summer Dresses Bundle',
        description: 'Bundle of 5 beautiful summer dresses, sizes S-M. Bright colors, light breathable fabric. Perfect for Liberian weather. Never worn, brand new with tags.',
        price: 90,
        location: 'Red Light Market',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      },
      {
        title: 'Modern Office Desk with Storage',
        description: 'Spacious office desk with 3 storage drawers. Dark wood finish, sturdy construction. Dimensions: 120cm x 60cm x 75cm. Perfect for home office or study room.',
        price: 180,
        location: 'Congo Town',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: furnitureCategory.id,
        status: 'active'
      },
      {
        title: '5-Seater Sofa Set with Cushions',
        description: '5-seater sofa set with matching cushions. Grey fabric, modern design. Very comfortable with foam padding. Dimensions: 3m x 1m x 0.8m. In excellent condition.',
        price: 450,
        location: 'Paynesville',
        condition: 'excellent',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: furnitureCategory.id,
        status: 'active'
      },
      {
        title: 'Dining Table Set (6 Chairs)',
        description: 'Beautiful wooden dining table with 6 matching chairs. Seats 6-8 people comfortably. Solid wood construction. Perfect for family dinners. Minor wear on edges.',
        price: 280,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: furnitureCategory.id,
        status: 'active'
      },
      {
        title: 'PlayStation 5 Console + 3 Games',
        description: 'PS5 disc version with 2 controllers, 3 games (FIFA 24, Call of Duty, Spider-Man). Barely used, like new condition. Includes all cables and original box.',
        price: 580,
        location: 'Sinkor',
        condition: 'excellent',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      }
    ];

    // Create products
    for (const productData of sampleProducts) {
      const product = await Product.create(productData);
      console.log(`✅ Created: ${product.title} - $${product.price}`);
    }

    console.log(`\n🎉 Successfully seeded ${sampleProducts.length} real products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedSampleProducts();
