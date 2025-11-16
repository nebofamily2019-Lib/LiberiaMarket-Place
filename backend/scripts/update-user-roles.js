const { User } = require('../src/models');

async function updateUserRoles() {
  try {
    const user = await User.findOne({ where: { phone: '885696333' } });
    
    if (user) {
      user.roles = ['buyer', 'seller'];
      await user.save();
      console.log(`✅ Updated ${user.name} to have roles: ${user.roles.join(', ')}`);
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserRoles();
