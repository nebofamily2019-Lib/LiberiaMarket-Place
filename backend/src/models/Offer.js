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
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD',
        validate: {
          isIn: [['USD', 'LRD']]
        }
      },
      product_price_snapshot: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered', 'expired', 'completed'),
        defaultValue: 'pending'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delivery_method: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: { isIn: [['delivery', 'pickup']] }
      },
      seller_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      seller_confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      buyer_confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      buyer_confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      counter_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      counter_currency: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [['USD', 'LRD']]
        }
      },
      counter_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      offer_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      responded_by: {
        type: DataTypes.UUID,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'Offer',
      tableName: 'offers',
      timestamps: true,
      underscored: true,
      indexes: [
        // Foreign key indexes
        {
          name: 'idx_offers_product_id',
          fields: ['product_id']
        },
        {
          name: 'idx_offers_buyer_id',
          fields: ['buyer_id']
        },
        {
          name: 'idx_offers_seller_id',
          fields: ['seller_id']
        },
        // Status filtering
        {
          name: 'idx_offers_status',
          fields: ['status']
        },
        // Composite: Product's pending offers
        {
          name: 'idx_offers_product_status',
          fields: ['product_id', 'status']
        },
        // Composite: Seller's pending offers (sorted by time)
        {
          name: 'idx_offers_seller_status_created',
          fields: ['seller_id', 'status', 'created_at']
        },
        // Composite: Buyer's offers
        {
          name: 'idx_offers_buyer_created',
          fields: ['buyer_id', 'created_at']
        }
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'offerProduct'
    });
    this.belongsTo(models.User, {
      foreignKey: 'buyer_id',
      as: 'buyer'
    });
    this.belongsTo(models.User, {
      foreignKey: 'seller_id',
      as: 'seller'
    });
    this.hasMany(models.Payment, {
      foreignKey: 'offer_id',
      as: 'payments'
    });
    this.hasMany(models.Review, {
      foreignKey: 'offer_id',
      as: 'reviews'
    });
  }
}

module.exports = Offer;
