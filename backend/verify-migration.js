const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Setup Sequelize based on environment
let sequelize;

console.log('DB_DIALECT:', process.env.DB_DIALECT);

if (process.env.DB_DIALECT === 'sqlite') {
  console.log('Using SQLite database:', process.env.DB_STORAGE);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  });
} else {
  console.log('Using Postgres database');
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false
    }
  );
}

async function testBidding() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Check if columns exist
    // For SQLite, we can use PRAGMA table_info(products)
    let columns = [];
    
    if (process.env.DB_DIALECT === 'sqlite') {
      const [results] = await sequelize.query('PRAGMA table_info(products);');
      columns = results.map(r => r.name);
    } else {
      const [results] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'products';`);
      columns = results.map(r => r.column_name);
    }

    const requiredColumns = ['starting_bid', 'current_bid', 'bid_count', 'auction_end_time'];
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));

    if (missingColumns.length > 0) {
      console.error('Missing columns:', missingColumns.join(', '));
      console.log('Existing columns:', columns);
    } else {
      console.log('All auction columns present.');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testBidding();
