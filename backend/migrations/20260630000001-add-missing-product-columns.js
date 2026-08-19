'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('products');
    const addSafe = async (col, def) => { if (!desc[col]) await queryInterface.addColumn('products', col, def); };
    await addSafe('currency',   { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' });
    await addSafe('latitude',   { type: Sequelize.DECIMAL(10, 8), allowNull: true });
    await addSafe('longitude',  { type: Sequelize.DECIMAL(11, 8), allowNull: true });
    await addSafe('expires_at', { type: Sequelize.DATE, allowNull: true });
    console.log('✅ Added missing product columns (currency, latitude, longitude, expires_at)');
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'currency');
    await queryInterface.removeColumn('products', 'latitude');
    await queryInterface.removeColumn('products', 'longitude');
    await queryInterface.removeColumn('products', 'expires_at');
  }
};
