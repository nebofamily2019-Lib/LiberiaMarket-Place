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

    // completed_deals_count is intentionally NOT a separate column — Phase A
    // already made `total_sales` increment on every completed sale, so it IS
    // the completed-deals count. A second counter would just duplicate it
    // with no benefit and a real risk of the two drifting apart.
    await addIfMissing('users', 'trust_score', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'trust_score');
  }
};
