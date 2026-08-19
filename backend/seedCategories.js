// Seed default categories into the database
const { Category } = require('./src/models');

const defaultCategories = [
  { name: 'Market Grounds', slug: 'market-grounds', description: 'Rice, palm oil, dry goods, and daily market provisions', icon: '🍚', color: '#10B981', sortOrder: 1 },
  { name: 'Fashion & Tailoring', slug: 'fashion-tailoring', description: 'Lappa suits, country cloth, tailoring, and used clothes', icon: '🧵', color: '#EC4899', sortOrder: 2 },
  { name: 'Phones & Electronics', slug: 'phones-electronics', description: 'Smartphones, scratch cards, solar lights, and gadgets', icon: '📱', color: '#3B82F6', sortOrder: 3 },
  { name: 'Vehicles & Pehn-Pehn', slug: 'vehicles-transport', description: 'Cars, kekehs, motorbikes, and parts', icon: '🏍️', color: '#EF4444', sortOrder: 4 },
  { name: 'Building Materials', slug: 'building-materials', description: 'Cement, zinc, blocks, and construction tools', icon: '🧱', color: '#F59E0B', sortOrder: 5 },
  { name: 'Home & Solar Energy', slug: 'home-energy', description: 'Furniture, solar panels, batteries, and home goods', icon: '☀️', color: '#FBBF24', sortOrder: 6 },
  { name: 'Services & Labor', slug: 'services-labor', description: 'Plumbers, electricians, mechanics, and hair braiding', icon: '🛠️', color: '#06B6D4', sortOrder: 7 },
  { name: 'Education', slug: 'education', description: 'School books, uniforms, and learning materials', icon: '📚', color: '#8B5CF6', sortOrder: 8 }
];

async function seedCategories() {
  try {
    console.log('Starting category seeding...');

    // Iterate and upsert based on slug to handle existing/soft-deleted categories
    const categories = [];
    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ where: { slug: cat.slug }, paranoid: false });
      
      if (existing) {
        if (existing.deletedAt) {
          await existing.restore();
        }
        await existing.update(cat);
        categories.push(existing);
      } else {
        const newCat = await Category.create(cat);
        categories.push(newCat);
      }
    }

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
