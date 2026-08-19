'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class SmsLog extends Model {
    static associate(models) {
      // SmsLog belongs to User
      SmsLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  SmsLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM(
          'verification',
          'new_message',
          'offer_received',
          'offer_accepted',
          'offer_rejected',
          'payment_request',
          'payment_confirmed',
          'price_drop',
          'general'
        ),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
        defaultValue: 'pending'
      },
      provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'twilio, africas_talking, etc.'
      },
      provider_message_id: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cost: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Cost in USD'
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      delivered_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'SmsLog',
      tableName: 'sms_logs',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['phone_number']
        },
        {
          fields: ['status']
        },
        {
          fields: ['type']
        },
        {
          fields: ['created_at']
        }
      ]
    }
  );

  return SmsLog;
};
