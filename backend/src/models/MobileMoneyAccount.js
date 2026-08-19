'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class MobileMoneyAccount extends Model {
    static associate(models) {
      // MobileMoneyAccount belongs to User
      MobileMoneyAccount.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  MobileMoneyAccount.init(
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
      provider: {
        type: DataTypes.ENUM('orange_money', 'mtn_mobile_money', 'lonestar_money'),
        allowNull: false
      },
      phone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      account_name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verification_code: {
        type: DataTypes.STRING(10),
        allowNull: true
      },
      verification_expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional provider-specific data'
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
      modelName: 'MobileMoneyAccount',
      tableName: 'mobile_money_accounts',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['user_id']
        },
        {
          fields: ['provider']
        },
        {
          unique: true,
          fields: ['provider', 'phone_number']
        }
      ]
    }
  );

  return MobileMoneyAccount;
};
