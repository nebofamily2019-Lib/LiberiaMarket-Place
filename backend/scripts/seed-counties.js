const { sequelize } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

/**
 * Seed script for Liberian Counties
 * Run with: node scripts/seed-counties.js
 */

const liberianCounties = [
  {
    name: 'Montserrado',
    code: 'MO',
    capital: 'Bensonville',
    population: 1118241,
    coordinates: { lat: 6.5514, lng: -10.7466 },
    major_cities: ['Monrovia', 'Bensonville', 'Congo Town', 'Sinkor', 'Paynesville', 'New Kru Town']
  },
  {
    name: 'Nimba',
    code: 'NI',
    capital: 'Sanniquellie',
    population: 462026,
    coordinates: { lat: 7.3667, lng: -8.7167 },
    major_cities: ['Sanniquellie', 'Ganta', 'Saclepea', 'Tappita']
  },
  {
    name: 'Margibi',
    code: 'MG',
    capital: 'Kakata',
    population: 209923,
    coordinates: { lat: 6.5319, lng: -10.3489 },
    major_cities: ['Kakata', 'Harbel', 'Coco Town']
  },
  {
    name: 'Grand Bassa',
    code: 'GB',
    capital: 'Buchanan',
    population: 221693,
    coordinates: { lat: 5.8808, lng: -10.0467 },
    major_cities: ['Buchanan', 'Compound Number Three']
  },
  {
    name: 'Bong',
    code: 'BG',
    capital: 'Gbarnga',
    population: 333481,
    coordinates: { lat: 6.9952, lng: -9.4725 },
    major_cities: ['Gbarnga', 'Totota', 'Salala']
  },
  {
    name: 'Lofa',
    code: 'LO',
    capital: 'Voinjama',
    population: 276863,
    coordinates: { lat: 8.4219, lng: -9.7500 },
    major_cities: ['Voinjama', 'Zorzor', 'Foya']
  },
  {
    name: 'Grand Cape Mount',
    code: 'CM',
    capital: 'Robertsport',
    population: 127076,
    coordinates: { lat: 6.7533, lng: -11.3686 },
    major_cities: ['Robertsport', 'Sinje']
  },
  {
    name: 'Bomi',
    code: 'BM',
    capital: 'Tubmanburg',
    population: 82036,
    coordinates: { lat: 6.8714, lng: -10.8156 },
    major_cities: ['Tubmanburg', 'Suehn Mecca', 'Klay']
  },
  {
    name: 'Grand Gedeh',
    code: 'GG',
    capital: 'Zwedru',
    population: 125258,
    coordinates: { lat: 6.0667, lng: -8.1333 },
    major_cities: ['Zwedru', 'Tchien', 'Putu']
  },
  {
    name: 'Sinoe',
    code: 'SI',
    capital: 'Greenville',
    population: 102391,
    coordinates: { lat: 5.0108, lng: -9.0411 },
    major_cities: ['Greenville', 'Jazon Town']
  },
  {
    name: 'Grand Kru',
    code: 'GK',
    capital: 'Barclayville',
    population: 57913,
    coordinates: { lat: 4.6772, lng: -7.7036 },
    major_cities: ['Barclayville', 'Picnicess']
  },
  {
    name: 'Maryland',
    code: 'MY',
    capital: 'Harper',
    population: 135938,
    coordinates: { lat: 4.3750, lng: -7.7167 },
    major_cities: ['Harper', 'Pleebo', 'Karloken']
  },
  {
    name: 'River Cess',
    code: 'RI',
    capital: 'Cestos City',
    population: 71509,
    coordinates: { lat: 5.4333, lng: -9.4833 },
    major_cities: ['Cestos City', 'Yarpah Town']
  },
  {
    name: 'River Gee',
    code: 'RG',
    capital: 'Fish Town',
    population: 66789,
    coordinates: { lat: 5.2667, lng: -7.8167 },
    major_cities: ['Fish Town', 'Tuobo']
  },
  {
    name: 'Gbarpolu',
    code: 'GP',
    capital: 'Bopolu',
    population: 83388,
    coordinates: { lat: 7.4833, lng: -10.0833 },
    major_cities: ['Bopolu', 'Gbarma', 'Belle Yella']
  }
];

async function seedCounties() {
  try {
    console.log('🌍 Starting county seeding...\n');

    // Check if counties already exist
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM counties');
    const count = results[0].count;

    if (count > 0) {
      console.log(`⚠️  Found ${count} existing counties. Skipping seed.`);
      console.log('   To reseed, run: DELETE FROM counties; and rerun this script.\n');
      process.exit(0);
    }

    // Insert counties
    const timestamp = new Date();
    const countyInserts = liberianCounties.map(county => ({
      id: uuidv4(),
      name: county.name,
      code: county.code,
      capital: county.capital,
      population: county.population,
      coordinates: JSON.stringify(county.coordinates),
      created_at: timestamp,
      updated_at: timestamp
    }));

    await sequelize.queryInterface.bulkInsert('counties', countyInserts);

    console.log('✅ Successfully seeded 15 Liberian counties:\n');
    liberianCounties.forEach((county, index) => {
      console.log(`   ${index + 1}. ${county.name} (${county.code}) - Capital: ${county.capital}`);
    });

    console.log('\n📊 County Statistics:');
    console.log(`   Total Population: ${liberianCounties.reduce((sum, c) => sum + c.population, 0).toLocaleString()}`);
    console.log(`   Most Populous: ${liberianCounties[0].name} (${liberianCounties[0].population.toLocaleString()})`);
    console.log(`   Least Populous: ${liberianCounties[10].name} (${liberianCounties[10].population.toLocaleString()})\n`);

    console.log('🎉 County seeding complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding counties:', error);
    process.exit(1);
  }
}

// Run the seed
seedCounties();
