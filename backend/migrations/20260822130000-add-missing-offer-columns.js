const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('offers');

    const addIfMissing = async (column, spec) => {
      if (desc[column]) {
        console.log(`ℹ️ offers.${column} already exists, skipping`);
        return;
      }
      await queryInterface.addColumn('offers', column, spec);
    };

    await addIfMissing('currency', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD'
    });

    await addIfMissing('product_price_snapshot', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });

    await addIfMissing('counter_amount', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    });

    await addIfMissing('counter_currency', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await addIfMissing('counter_message', {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await addIfMissing('offer_count', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await addIfMissing('responded_by', {
      type: DataTypes.UUID,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    for (const column of [
      'currency',
      'product_price_snapshot',
      'counter_amount',
      'counter_currency',
      'counter_message',
      'offer_count',
      'responded_by'
    ]) {
      await queryInterface.removeColumn('offers', column);
    }
  }
};
