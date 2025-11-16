const { Category } = require('../models')

const seedCategories = async () => {
  try {
    const categories = [
      {
        name: 'Electronics',
        description: 'Phones, laptops, and electronic devices',
        icon: 'laptop',
        color: '#3B82F6',
        sortOrder: 1,
        isActive: true
      },
      {
        name: 'Fashion',
        description: 'Clothing, shoes, and accessories',
        icon: 'shirt',
        color: '#EC4899',
        sortOrder: 2,
        isActive: true
      },
      {
        name: 'Home & Garden',
        description: 'Furniture, appliances, and home items',
        icon: 'home',
        color: '#10B981',
        sortOrder: 3,
        isActive: true
      },
      {
        name: 'Vehicles',
        description: 'Cars, motorcycles, and auto parts',
        icon: 'car',
        color: '#F59E0B',
        sortOrder: 4,
        isActive: true
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear',
        icon: 'football',
        color: '#8B5CF6',
        sortOrder: 5,
        isActive: true
      },
      {
        name: 'Food & Beverages',
        description: 'Fresh food, groceries, snacks, and drinks',
        icon: '🍔',
        color: '#EF4444',
        sortOrder: 6,
        isActive: true
      }
    ]

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      })
    }

    console.log('✅ Categories seeded successfully')
    console.log('📦 Total categories:', categories.length)
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  }
}

module.exports = seedCategories

// Run this file directly: node backend/src/seeders/categories.js
if (require.main === module) {
  seedCategories().then(() => process.exit(0))
}
