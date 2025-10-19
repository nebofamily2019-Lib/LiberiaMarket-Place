// Seed default categories into the database
const { Category } = require('./src/models');

const defaultCategories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets', icon: '📱', color: '#3B82F6', sortOrder: 1 },
  { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, and accessories', icon: '👗', color: '#EC4899', sortOrder: 2 },
  { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, appliances, and home decor', icon: '🏡', color: '#10B981', sortOrder: 3 },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories', icon: '⚽', color: '#F59E0B', sortOrder: 4 },
  { name: 'Books', slug: 'books', description: 'Books, magazines, and educational materials', icon: '📚', color: '#8B5CF6', sortOrder: 5 },
  { name: 'Vehicles', slug: 'vehicles', description: 'Cars, motorcycles, and vehicle parts', icon: '🚗', color: '#EF4444', sortOrder: 6 },
  { name: 'Services', slug: 'services', description: 'Professional and personal services', icon: '🔧', color: '#06B6D4', sortOrder: 7 },
  { name: 'Other', slug: 'other', description: 'Miscellaneous items', icon: '📦', color: '#6B7280', sortOrder: 8 }
];

async function seedCategories() {
  try {
    console.log('Starting category seeding...');

    // Check if categories already exist
    const existingCount = await Category.count();

    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} categories. Skipping seed.`);
      process.exit(0);
    }

    // Insert categories
    const categories = await Category.bulkCreate(defaultCategories);

    console.log(`Successfully seeded ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.icon} ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
