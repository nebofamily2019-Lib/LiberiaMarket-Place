const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Database Backup Script
 * Creates a backup of the database before MVP cleanup
 */

const config = require('../src/config/database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const backupDir = path.join(__dirname, '../database/backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const backupFile = path.join(backupDir, `backup-before-mvp-cleanup-${timestamp}.sql`);

console.log('🔄 Creating database backup...');
console.log(`Database: ${dbConfig.database}`);
console.log(`Backup file: ${backupFile}`);

try {
  if (dbConfig.dialect === 'postgres') {
    // PostgreSQL backup
    const pgDumpCmd = `pg_dump -U ${dbConfig.username} -h ${dbConfig.host} -p ${dbConfig.port || 5432} ${dbConfig.database} > "${backupFile}"`;
    execSync(pgDumpCmd, { env: { ...process.env, PGPASSWORD: dbConfig.password } });
  } else if (dbConfig.dialect === 'mysql') {
    // MySQL backup
    const mysqldumpCmd = `mysqldump -u ${dbConfig.username} -p${dbConfig.password} -h ${dbConfig.host} -P ${dbConfig.port || 3306} ${dbConfig.database} > "${backupFile}"`;
    execSync(mysqldumpCmd);
  } else {
    console.error('❌ Unsupported database dialect:', dbConfig.dialect);
    process.exit(1);
  }

  console.log('✅ Database backup created successfully!');
  console.log(`📁 Backup location: ${backupFile}`);
  console.log('\n⚠️  IMPORTANT: Keep this backup safe before proceeding with cleanup!');
} catch (error) {
  console.error('❌ Backup failed:', error.message);
  console.log('\n📝 Manual backup instructions:');
  console.log('PostgreSQL: pg_dump dbname > backup.sql');
  console.log('MySQL: mysqldump -u user -p dbname > backup.sql');
  process.exit(1);
}
