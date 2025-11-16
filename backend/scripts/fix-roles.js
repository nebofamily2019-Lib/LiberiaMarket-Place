const { User, sequelize } = require('../src/models');

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing user roles...\n');

    // Find users with invalid roles
    const users = await User.findAll({
      where: {
        role: {
          [require('sequelize').Op.notIn]: ['buyer', 'seller', 'admin']
        }
      }
    });

    console.log(`Found ${users.length} users with invalid roles\n`);

    for (const user of users) {
      console.log(`User: ${user.name} (${user.phone})`);
      console.log(`  Current role: "${user.role}"`);
      
      // Update to seller
      await user.update({ role: 'seller' });
      
      console.log(`  ✅ Updated to: seller\n`);
    }

    // Also fix using raw query for any edge cases
    const [results] = await sequelize.query(`
      UPDATE users 
      SET role = 'seller' 
      WHERE role NOT IN ('buyer', 'seller', 'admin')
    `);

    console.log(`✅ Fixed ${results.affectedRows || results} invalid roles`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing roles:', error);
    process.exit(1);
  }
}

fixUserRoles();
