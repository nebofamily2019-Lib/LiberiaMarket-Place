'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to User (recipient)
      Notification.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Notification.init(
    {
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
      type: {
        type: DataTypes.ENUM('offer', 'message', 'price_drop', 'system', 'order'),
        allowNull: false,
        defaultValue: 'system'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data for navigation (e.g., { productId: "..." })'
      }
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notifications',
      timestamps: true,
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['is_read']
        }
      ]
    }
  );

  return Notification;
};
