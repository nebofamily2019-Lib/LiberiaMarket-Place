
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('products');

    if (!tableDescription.sold_at) {
      await queryInterface.addColumn('products', 'sold_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!tableDescription.sold_price) {
      await queryInterface.addColumn('products', 'sold_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
    }

    if (!tableDescription.buyer_id) {
      await queryInterface.addColumn('products', 'buyer_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      });
    }

    if (!tableDescription.payment_method) {
      await queryInterface.addColumn('products', 'payment_method', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'sold_at');
    await queryInterface.removeColumn('products', 'sold_price');
    await queryInterface.removeColumn('products', 'buyer_id');
    await queryInterface.removeColumn('products', 'payment_method');
  }
};
