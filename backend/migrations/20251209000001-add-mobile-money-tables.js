'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create mobile_money_accounts table
    await queryInterface.createTable('mobile_money_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.ENUM('orange_money', 'mtn_mobile_money', 'lonestar_money'),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      account_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create payments table
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      offer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'offers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      payer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      payee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.ENUM('USD', 'LRD'),
        defaultValue: 'USD'
      },
      payment_method: {
        type: Sequelize.ENUM('orange_money', 'mtn_mobile_money', 'lonestar_money', 'cash'),
        allowNull: false
      },
      payment_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
        defaultValue: 'pending'
      },
      escrow_status: {
        type: Sequelize.ENUM('held', 'released', 'refunded'),
        allowNull: true
      },
      platform_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      payment_reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes (skip if already exist)
    const addIndexSafe = async (table, fields) => {
      try { await queryInterface.addIndex(table, fields); } catch (e) { if (!e.message.includes('already exists')) throw e; }
    };
    await addIndexSafe('mobile_money_accounts', ['user_id']);
    await addIndexSafe('mobile_money_accounts', ['provider']);
    await addIndexSafe('mobile_money_accounts', ['phone_number']);
    await addIndexSafe('payments', ['offer_id']);
    await addIndexSafe('payments', ['payer_id']);
    await addIndexSafe('payments', ['payee_id']);
    await addIndexSafe('payments', ['status']);
    await addIndexSafe('payments', ['transaction_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('mobile_money_accounts');
  }
};
