const { Category, sequelize } = require('../src/models');

async function seedCategories() {
  try {
    await sequelize.sync();
    console.log('🌱 Seeding categories...\n');

    const categories = [
      {
        name: 'Electronics',
        description: 'Phones, laptops, TVs, and gadgets',
        icon: '💻',
        color: '#3B82F6',
        slug: 'electronics',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories',
        icon: '👔',
        color: '#EC4899',
        slug: 'fashion',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Furniture',
        description: 'Home and office furniture',
        icon: '🛋️',
        color: '#8B5CF6',
        slug: 'furniture',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Food & Drinks',
        description: 'Food, beverages, and groceries',
        icon: '🍔',
        color: '#F59E0B',
        slug: 'food-drinks',
        isActive: true,
        sortOrder: 4
      },
      {
        name: 'Vehicles',
        description: 'Cars, motorcycles, and parts',
        icon: '🚗',
        color: '#10B981',
        slug: 'vehicles',
        isActive: true,
        sortOrder: 5
      },
      {
        name: 'Real Estate',
        description: 'Houses, land, and rentals',
        icon: '🏠',
        color: '#6366F1',
        slug: 'real-estate',
        isActive: true,
        sortOrder: 6
      }
    ];

    for (const categoryData of categories) {
      const [category, created] = await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });

      if (created) {
        console.log(`✅ Created: ${category.name}`);
      } else {
        console.log(`ℹ️ Already exists: ${category.name}`);
      }
    }

    console.log('\n🎉 Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
