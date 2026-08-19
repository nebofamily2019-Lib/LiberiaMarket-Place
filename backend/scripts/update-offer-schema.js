
const { sequelize } = require('../src/models');

const updateOfferSchema = async () => {
  try {
    console.log('🔄 Checking offer schema...');
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('offers');

    const columnsToAdd = [
      { name: 'currency', type: 'STRING', allowNull: false, defaultValue: 'USD' },
      { name: 'counter_amount', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'counter_currency', type: 'STRING', allowNull: true },
      { name: 'counter_message', type: 'TEXT', allowNull: true },
      { name: 'offer_count', type: 'INTEGER', allowNull: false, defaultValue: 1 },
      { name: 'responded_by', type: 'UUID', allowNull: true }
    ];

    for (const column of columnsToAdd) {
      if (!tableDescription[column.name]) {
        console.log(`➕ Adding column: ${column.name}`);
        await queryInterface.addColumn('offers', column.name, {
          type: sequelize.Sequelize[column.type.split('(')[0]] || column.type,
          allowNull: column.allowNull,
          defaultValue: column.defaultValue
        });
      } else {
        console.log(`✓ Column exists: ${column.name}`);
      }
    }

    console.log('✅ Offer schema update complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  }
};

updateOfferSchema();
