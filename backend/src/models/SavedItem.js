const { Model, DataTypes } = require('sequelize');

class SavedItem extends Model {
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
      product_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'SavedItem',
      tableName: 'saved_items',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'product_id']
        }
      ]
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}

module.exports = SavedItem;
