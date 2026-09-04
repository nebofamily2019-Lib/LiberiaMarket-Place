const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addIfMissing = async (table, column, spec) => {
      const desc = await queryInterface.describeTable(table);
      if (desc[column]) {
        console.log(`ℹ️ ${table}.${column} already exists, skipping`);
        return;
      }
      await queryInterface.addColumn(table, column, spec);
      console.log(`✅ Added ${table}.${column}`);
    };

    await addIfMissing('products', 'district', {
      type: DataTypes.STRING(100),
      allowNull: true
    });
    await addIfMissing('products', 'landmark', {
      type: DataTypes.STRING(200),
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'district');
    await queryInterface.removeColumn('products', 'landmark');
  }
};
