const { User } = require('../src/models');

async function resetPasswords() {
  try {
    const users = await User.findAll();
    console.log(`Found ${users.length} users. Resetting passwords...`);

    for (const user of users) {
      user.password = 'password123';
      await user.save(); // This triggers the beforeUpdate hook which hashes the password
      console.log(`Password reset for user: ${user.name} (${user.email || 'No Email'})`);
    }

    console.log('All passwords have been reset to "password123".');
  } catch (error) {
    console.error('Error resetting passwords:', error);
  }
}

resetPasswords();
