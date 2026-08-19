const { sequelize, User } = require('./src/models');

const users = [
  {
    name: 'Test Buyer',
    phone: '880000001',
    password: 'Password123!',
    role: 'buyer',
    roles: ['buyer'],
    email: 'buyer@example.com'
  },
  {
    name: 'Test Seller',
    phone: '880000002',
    password: 'Password123!',
    role: 'seller',
    roles: ['seller'],
    email: 'seller@example.com'
  },
  {
    name: 'Test Admin',
    phone: '880000003',
    password: 'Password123!',
    role: 'admin',
    roles: ['admin'],
    email: 'admin@example.com'
  }
];

async function seedUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    for (const u of users) {
      const existing = await User.findOne({ where: { phone: u.phone } });
      if (existing) {
        console.log(`User ${u.name} (${u.phone}) already exists. Updating...`);
        await existing.update(u);
      } else {
        console.log(`Creating user ${u.name} (${u.phone})...`);
        await User.create(u);
      }
    }

    console.log('✅ Users seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
