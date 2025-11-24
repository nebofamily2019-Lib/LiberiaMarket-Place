const { Model, DataTypes } = require('sequelize');

class Offer extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      buyer_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      seller_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      offer_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'),
        defaultValue: 'pending'
      }
    }, {
      sequelize,
      modelName: 'Offer',
      tableName: 'offers',
      timestamps: true,
      underscored: false
    });
  }

  static associate(models) {
    this.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
    this.belongsTo(models.User, {
      foreignKey: 'buyer_id',
      as: 'buyer'
    });
    this.belongsTo(models.User, {
      foreignKey: 'seller_id',
      as: 'seller'
    });
  }
}

module.exports = Offer;
