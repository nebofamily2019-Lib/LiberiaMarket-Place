const { User, sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

async function createAdmin() {
  try {
    console.log('\n🔐 LibMarket Admin Account Creation\n');

    const name = await prompt('Admin Name: ');
    const phone = await prompt('Admin Phone (e.g., 77712345): ');
    const password = await prompt('Admin Password (min 6 chars): ');
    const email = await prompt('Admin Email (optional, press Enter to skip): ');

    // Validate inputs
    if (!name || !phone || !password) {
      console.error('❌ Name, phone, and password are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { phone } });
    if (existingAdmin) {
      console.log('\n⚠️  User with this phone already exists!');
      const update = await prompt('Update to admin role? (yes/no): ');
      
      if (update.toLowerCase() === 'yes') {
        await existingAdmin.update({ role: 'admin', roles: ['admin'] });
        console.log('✅ User updated to admin role!');
      }
      
      rl.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name,
      phone,
      email: email || null,
      password, // Will be hashed by beforeCreate hook
      role: 'admin',
      isActive: true
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('📋 Admin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Phone: ${admin.phone}`);
    console.log(`   Email: ${admin.email || 'Not provided'}`);
    console.log(`   Role: ${admin.role}`);
    console.log('\n🔗 Login at: http://localhost:5173/admin/login\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    rl.close();
    process.exit(1);
  }
}

createAdmin();
