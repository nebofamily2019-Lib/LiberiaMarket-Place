'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Payment extends Model {
    static associate(models) {
      // Payment belongs to Offer
      Payment.belongsTo(models.Offer, {
        foreignKey: 'offer_id',
        as: 'offer'
      });

      // Payment belongs to payer (User)
      Payment.belongsTo(models.User, {
        foreignKey: 'payer_id',
        as: 'payer'
      });

      // Payment belongs to payee (User)
      Payment.belongsTo(models.User, {
        foreignKey: 'payee_id',
        as: 'payee'
      });

      // Payment belongs to MobileMoneyAccount
      Payment.belongsTo(models.MobileMoneyAccount, {
        foreignKey: 'mobile_money_account_id',
        as: 'mobileMoneyAccount'
      });
    }
  }

  Payment.init(
    {
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
      payer_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      payee_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      mobile_money_account_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'mobile_money_accounts',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.ENUM('USD', 'LRD'),
        defaultValue: 'USD'
      },
      payment_method: {
        type: DataTypes.ENUM(
          'orange_money',
          'mtn_mobile_money',
          'lonestar_money',
          'cash',
          'bank_transfer'
        ),
        allowNull: false
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Provider transaction ID'
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'processing',
          'completed',
          'failed',
          'refunded',
          'cancelled'
        ),
        defaultValue: 'pending'
      },
      escrow_status: {
        type: DataTypes.ENUM('held', 'released', 'refunded'),
        defaultValue: 'held',
        comment: 'Escrow state for buyer protection'
      },
      platform_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Platform commission (1%)'
      },
      payment_metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Provider-specific payment data'
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      completed_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      refunded_at: {
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
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['offer_id']
        },
        {
          fields: ['payer_id']
        },
        {
          fields: ['payee_id']
        },
        {
          fields: ['status']
        },
        {
          fields: ['escrow_status']
        },
        {
          fields: ['transaction_id']
        }
      ]
    }
  );

  return Payment;
};
