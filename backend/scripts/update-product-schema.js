
const { sequelize } = require('../src/models');

const updateProductSchema = async () => {
  try {
    console.log('🔄 Checking product schema...');
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('products');

    const columnsToAdd = [
      { name: 'sold_at', type: 'DATE', allowNull: true },
      { name: 'sold_price', type: 'DECIMAL(10, 2)', allowNull: true },
      { name: 'buyer_id', type: 'UUID', allowNull: true, references: { model: 'users', key: 'id' } },
      { name: 'payment_method', type: 'STRING', allowNull: true }
    ];

    for (const column of columnsToAdd) {
      if (!tableDescription[column.name]) {
        console.log(`➕ Adding column: ${column.name}`);
        await queryInterface.addColumn('products', column.name, {
          type: sequelize.Sequelize[column.type.split('(')[0]] || column.type, // Handle types like DECIMAL(10,2)
          allowNull: column.allowNull,
          references: column.references
        });
      } else {
        console.log(`✓ Column exists: ${column.name}`);
      }
    }

    console.log('✅ Product schema update complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
  }
};

updateProductSchema();
