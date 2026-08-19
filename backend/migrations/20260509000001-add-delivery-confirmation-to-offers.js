'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('offers');
    const addSafe = async (col, def) => { if (!desc[col]) await queryInterface.addColumn('offers', col, def); };
    await addSafe('delivery_method',     { type: Sequelize.STRING(20), allowNull: true, defaultValue: null });
    await addSafe('seller_confirmed',    { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await addSafe('seller_confirmed_at', { type: Sequelize.DATE, allowNull: true, defaultValue: null });
    await addSafe('buyer_confirmed',     { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await addSafe('buyer_confirmed_at',  { type: Sequelize.DATE, allowNull: true, defaultValue: null });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('offers', 'delivery_method');
    await queryInterface.removeColumn('offers', 'seller_confirmed');
    await queryInterface.removeColumn('offers', 'seller_confirmed_at');
    await queryInterface.removeColumn('offers', 'buyer_confirmed');
    await queryInterface.removeColumn('offers', 'buyer_confirmed_at');
  }
};
