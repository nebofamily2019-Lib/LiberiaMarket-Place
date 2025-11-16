const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 LibMarket Backend - Environment Setup\n');

// Generate secure JWT_SECRET
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ Generated secure JWT_SECRET\n');

// Check if .env already exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   Backup your existing file before running this script.\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('Overwrite existing .env? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      createEnvFile(envExamplePath, envPath, jwtSecret);
    } else {
      console.log('\n❌ Setup cancelled. Your existing .env file is unchanged.');
      console.log('\n💡 To manually update JWT_SECRET, add this line to .env:');
      console.log(`   JWT_SECRET=${jwtSecret}\n`);
    }
    readline.close();
  });
} else {
  createEnvFile(envExamplePath, envPath, jwtSecret);
}

function createEnvFile(sourcePath, destPath, jwtSecret) {
  if (!fs.existsSync(sourcePath)) {
    console.log('❌ .env.example not found!');
    console.log('   Create it first, then run this script again.\n');
    return;
  }

  // Read .env.example
  let envContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Replace JWT_SECRET placeholder
  envContent = envContent.replace(
    /JWT_SECRET=.*/,
    `JWT_SECRET=${jwtSecret}`
  );
  
  // Write to .env
  fs.writeFileSync(destPath, envContent);
  
  console.log('✅ Created .env file with secure JWT_SECRET');
  console.log('✅ JWT_SECRET has been automatically configured\n');
  console.log('📋 Next steps:');
  console.log('   1. Review .env file and update any other settings');
  console.log('   2. NEVER commit .env to Git');
  console.log('   3. Run: npm run dev\n');
  console.log('🔒 Your JWT_SECRET (save this securely):');
  console.log(`   ${jwtSecret}\n`);
}
