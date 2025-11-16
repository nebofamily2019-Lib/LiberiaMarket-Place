const { User, Category, Product, sequelize } = require('../src/models');

async function seedSampleProducts() {
  try {
    console.log('🌱 Seeding sample products...\n');

    // Find or create a seller
    let seller = await User.findOne({ where: { role: 'seller' } });
    
    if (!seller) {
      seller = await User.create({
        name: 'Sample Seller',
        phone: '88123456',
        password: 'password123',
        role: 'seller',
        roles: 'seller'
      });
      console.log('✅ Created sample seller');
    }

    // Find or create categories
    const electronicsCategory = await Category.findOne({ where: { name: 'Electronics' } }) || 
      await Category.create({
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        icon: '💻',
        color: '#3B82F6',
        slug: 'electronics'
      });

    const fashionCategory = await Category.findOne({ where: { name: 'Fashion' } }) ||
      await Category.create({
        name: 'Fashion',
        description: 'Clothing and accessories',
        icon: '👔',
        color: '#EC4899',
        slug: 'fashion'
      });

    const furnitureCategory = await Category.findOne({ where: { name: 'Furniture' } }) ||
      await Category.create({
        name: 'Furniture',
        description: 'Home and office furniture',
        icon: '🛋️',
        color: '#8B5CF6',
        slug: 'furniture'
      });

    // Sample products
    const sampleProducts = [
      {
        title: 'iPhone 13 Pro Max',
        description: 'Like new iPhone 13 Pro Max, 256GB, Sierra Blue. Includes original box, charger, and case. No scratches, perfect condition.',
        price: 850,
        location: 'Monrovia',
        condition: 'excellent',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Samsung 55" Smart TV',
        description: 'Brand new Samsung 55-inch 4K Smart TV. Crystal clear display, built-in WiFi, Netflix, YouTube. Still in box with warranty.',
        price: 650,
        location: 'Paynesville',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Men\'s Leather Jacket',
        description: 'Genuine leather jacket, size L. Black color, barely worn. High quality, stylish design. Perfect for cool evenings.',
        price: 120,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      },
      {
        title: 'Designer Handbag Collection',
        description: 'Set of 3 designer-inspired handbags. Various colors and styles. Great for any occasion. Durable and fashionable.',
        price: 75,
        location: 'Sinkor',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      },
      {
        title: 'Modern Office Desk',
        description: 'Spacious office desk with storage drawers. Dark wood finish, sturdy construction. Perfect for home office or study.',
        price: 180,
        location: 'Congo Town',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: furnitureCategory.id,
        status: 'active'
      },
      {
        title: 'Comfortable Sofa Set',
        description: '5-seater sofa set with cushions. Grey fabric, modern design. Very comfortable and in excellent condition.',
        price: 450,
        location: 'Monrovia',
        condition: 'excellent',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: furnitureCategory.id,
        status: 'active'
      },
      {
        title: 'Dell Laptop i7 16GB RAM',
        description: 'Dell Inspiron 15, Intel Core i7, 16GB RAM, 512GB SSD. Perfect for work or gaming. Fast and reliable.',
        price: 720,
        location: 'Paynesville',
        condition: 'good',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: electronicsCategory.id,
        status: 'active'
      },
      {
        title: 'Women\'s Summer Dresses',
        description: 'Bundle of 5 beautiful summer dresses, sizes S-M. Bright colors, light fabric. Perfect for Liberian weather.',
        price: 90,
        location: 'Sinkor',
        condition: 'new',
        contactPhone: seller.phone,
        seller_id: seller.id,
        category_id: fashionCategory.id,
        status: 'active'
      }
    ];

    // Create products
    for (const productData of sampleProducts) {
      await Product.create(productData);
      console.log(`✅ Created: ${productData.title}`);
    }

    console.log('\n🎉 Sample products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedSampleProducts();
