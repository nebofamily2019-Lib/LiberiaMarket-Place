'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create sms_logs table
    await queryInterface.createTable('sms_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM('pending', 'sent', 'delivered', 'failed'),
        defaultValue: 'pending'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'twilio, africas_talking, etc.'
      },
      provider_message_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cost: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        comment: 'Cost in USD'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
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

    // Add SMS preferences to users table (idempotent)
    const usersDesc = await queryInterface.describeTable('users');
    if (!usersDesc['sms_notifications_enabled']) {
      await queryInterface.addColumn('users', 'sms_notifications_enabled', {
        type: Sequelize.BOOLEAN, defaultValue: true
      });
    }
    if (!usersDesc['sms_preferences']) {
      await queryInterface.addColumn('users', 'sms_preferences', {
        type: Sequelize.JSON, allowNull: true
      });
    }

    // Add indexes (skip if already exist)
    const addIdxSafe = async (table, fields) => {
      try { await queryInterface.addIndex(table, fields); } catch (e) { if (!e.message.includes('already exists')) throw e; }
    };
    await addIdxSafe('sms_logs', ['user_id']);
    await addIdxSafe('sms_logs', ['phone_number']);
    await addIdxSafe('sms_logs', ['status']);
    await addIdxSafe('sms_logs', ['type']);
    await addIdxSafe('sms_logs', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'sms_preferences');
    await queryInterface.removeColumn('users', 'sms_notifications_enabled');
    await queryInterface.dropTable('sms_logs');
  }
};
