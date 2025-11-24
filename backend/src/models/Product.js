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
      condition: {
        type: DataTypes.STRING,
        defaultValue: 'good'
      },
      contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        field: 'contact_phone'
      },
      tags: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      isNegotiable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_negotiable'
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
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
      }
    }, {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true,
      underscored: false, // IMPORTANT: Set to false to use camelCase (deletedAt)
      paranoid: true, // Enables soft deletes
    })
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'seller_id',
      as: 'seller'
    });

    this.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category'
    });

    // REMOVED: Offer association (using raw SQL queries in controller instead)
  }
}

module.exports = Product