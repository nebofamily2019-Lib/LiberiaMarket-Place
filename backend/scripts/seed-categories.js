const { Category, sequelize } = require('../src/models');

async function seedCategories() {
  let syncError = null;
  try {
    await sequelize.sync();
  } catch (err) {
    syncError = err;
    console.error('⚠️ DB sync/index error (ignored for POC):', err.message);
    // Continue to category seeding
  }

  console.log('🌱 Seeding categories...\n');
  const categories = [
    {
      name: 'Food & Provisions',
      description: 'Rice, Cassava, Palm Oil, Dry Meat, Pepper, Fufu',
      icon: '🍚',
      color: '#F59E0B',
      slug: 'food-provisions',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Transport (Okada/Kehkeh)',
      description: 'Okada, Keh-keh, Taxis, Spare parts',
      icon: '🛺',
      color: '#10B981',
      slug: 'transport',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'Fashion & Tailoring',
      description: 'Lappa, Country Cloth, Tailoring materials, Used clothes',
      icon: '🧵',
      color: '#EC4899',
      slug: 'fashion-tailoring',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Electronics & Solar',
      description: 'Phones, Solar panels, Radios, Power banks',
      icon: '📱',
      color: '#3B82F6',
      slug: 'electronics-solar',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'Housing & Land',
      description: 'Rentals, Land for sale, Zinc, Cement',
      icon: '🏠',
      color: '#6366F1',
      slug: 'housing-land',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'Agriculture',
      description: 'Palm nuts, Farming tools, Seeds, Charcoal',
      icon: '🌴',
      color: '#166534',
      slug: 'agriculture',
      isActive: true,
      sortOrder: 6
    },
    {
      name: 'Services',
      description: 'Carpentry, Masonry, Hair braiding, Generator repair',
      icon: '🛠️',
      color: '#6B7280',
      slug: 'services',
      isActive: true,
      sortOrder: 7
    }
  ];

  for (const categoryData of categories) {
    try {
      const [category, created] = await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });

      if (created) {
        console.log(`✅ Created: ${category.name}`);
      } else {
        // Update existing category with new icon and description
        await category.update({
          icon: categoryData.icon,
          description: categoryData.description,
          color: categoryData.color,
          slug: categoryData.slug,
          sortOrder: categoryData.sortOrder
        });
        console.log(`🔄 Updated: ${category.name}`);
      }
    } catch (err) {
      console.error(`❌ Error creating category ${categoryData.name}:`, err.message);
    }
  }

  console.log('\n🎉 Categories seeded successfully!');
  process.exit(syncError ? 1 : 0);
}

seedCategories();
