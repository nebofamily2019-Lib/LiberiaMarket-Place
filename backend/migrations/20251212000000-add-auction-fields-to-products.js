'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('products');
    const addSafe = async (col, def) => { if (!desc[col]) await queryInterface.addColumn('products', col, def); };
    await addSafe('starting_bid',     { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 });
    await addSafe('current_bid',      { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: 0 });
    await addSafe('auction_end_time', { type: Sequelize.DATE, allowNull: true });
    await addSafe('bid_count',        { type: Sequelize.INTEGER, allowNull: true, defaultValue: 0 });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'starting_bid');
    await queryInterface.removeColumn('products', 'current_bid');
    await queryInterface.removeColumn('products', 'auction_end_time');
    await queryInterface.removeColumn('products', 'bid_count');
  }
};
