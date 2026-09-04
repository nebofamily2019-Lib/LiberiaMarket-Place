const { Model, DataTypes } = require('sequelize')

class Product extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Untitled Product'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'No description provided'
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD',
        validate: {
          isIn: [['USD', 'LRD']]
        }
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'expires_at'
      },
      condition: {
        type: DataTypes.STRING,
        defaultValue: 'good'
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'contactPhone'
      },
      images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      seller_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'sold', 'inactive', 'pending']]
        }
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      county_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'counties',
          key: 'id'
        }
      },
      specific_location: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Specific area/street within county'
      },
      district: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'District/city/zone within the county (e.g. Sinkor, Paynesville)'
      },
      landmark: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Free-form nearby landmark (e.g. "Near Total Gas Station, 12th Street")'
      },
      coordinates: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Lat/Long coordinates'
      },
      sold_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      sold_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      buyer_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isIn: [['cash', 'mobile_money', 'other']]
        }
      }
    }, {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      paranoid: true, // Soft deletes
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at'
    })
  }

  static associate(models) {
    // Define associations here
    this.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' })
    this.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' })
    this.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' })
    this.belongsTo(models.County, { foreignKey: 'county_id', as: 'county' })
    this.hasMany(models.SavedItem, { foreignKey: 'product_id', as: 'savedBy' })
    this.hasMany(models.Offer, { foreignKey: 'product_id', as: 'offers' })
  }
}

module.exports = Product