const { Model, DataTypes } = require('sequelize');

class UserActivity extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      activity_type: {
        type: DataTypes.ENUM('view_product', 'search', 'sent_offer', 'placed_order', 'sold_product', 'listed_product'),
        allowNull: false
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null for searches
        comment: 'ID of the product, order, or offer'
      },
      details: {
        type: DataTypes.JSON, // Store extra info like search query, product title snapshot
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'UserActivity',
      tableName: 'user_activities',
      timestamps: true,
      updatedAt: false, // We only care about when it happened
      underscored: true,
      indexes: [
        {
          fields: ['user_id', 'created_at']
        }
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    // We can't easily associate entity_id to multiple tables, so we'll handle that manually or via details
  }
}

module.exports = UserActivity;
