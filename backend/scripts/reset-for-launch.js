const { sequelize } = require('../src/models');

// Wipes all user-generated/transactional data before real go-live, while
// keeping seeded reference data (categories, counties) that real users need
// in order to list items. Postgres-only (uses TRUNCATE ... CASCADE).
const TABLES_TO_WIPE = [
  'users',
  'products',
  'offers',
  'conversations',
  'messages',
  'mobile_money_accounts',
  'payments',
  'sms_logs',
  'reviews',
  'saved_items',
  'notifications',
  'reports',
  'user_activities'
];

async function main() {
  if (process.argv[2] !== '--yes-really-wipe-prod-data') {
    console.error('This permanently deletes all users, listings, offers, messages, and payments.');
    console.error('Re-run with --yes-really-wipe-prod-data to confirm.');
    process.exit(1);
  }

  console.log(`Truncating: ${TABLES_TO_WIPE.join(', ')}`);
  console.log('Keeping: categories, counties');

  await sequelize.query(`TRUNCATE TABLE ${TABLES_TO_WIPE.join(', ')} RESTART IDENTITY CASCADE;`);

  console.log('Done. Run the create-admin script next to set up the real production admin account.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
