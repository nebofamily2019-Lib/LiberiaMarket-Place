const { Model, DataTypes } = require('sequelize');

class Payment extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      offer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'offers',
          key: 'id'
        }
      },
      buyer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0
        }
      },
      payment_method: {
        type: DataTypes.ENUM('mtn_mobile_money', 'orange_money', 'lonestar_cell', 'cash', 'bank_transfer'),
        allowNull: false
      },
      payment_phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Mobile money phone number'
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'External payment reference'
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      payment_proof: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Screenshot or reference for manual verification'
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
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

module.exports = Payment;
