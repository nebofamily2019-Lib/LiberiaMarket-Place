const { Category } = require('../src/models');

async function addFoodCategory() {
  try {
    console.log('🍔 Adding Food category...\n');

    const [category, created] = await Category.findOrCreate({
      where: { name: 'Food & Drinks' },
      defaults: {
        description: 'Food, beverages, and groceries',
        icon: '🍔',
        color: '#F59E0B',
        slug: 'food-drinks',
        isActive: true,
        sortOrder: 5
      }
    });

    if (created) {
      console.log('✅ Food & Drinks category created:', category.name);
    } else {
      console.log('ℹ️ Food & Drinks category already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding category:', error);
    process.exit(1);
  }
}

addFoodCategory();
