const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addIfMissing = async (table, column, spec) => {
      const desc = await queryInterface.describeTable(table);
      if (desc[column]) {
        console.log(`ℹ️ ${table}.${column} already exists, skipping`);
        return;
      }
      await queryInterface.addColumn(table, column, spec);
      console.log(`✅ Added ${table}.${column}`);
    };

    // messages
    await addIfMissing('messages', 'audio_url', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await addIfMissing('messages', 'message_type', {
      type: DataTypes.ENUM('text', 'audio', 'image'),
      defaultValue: 'text',
      allowNull: false
    });
    await addIfMissing('messages', 'is_read', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await addIfMissing('messages', 'read_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    // mobile_money_accounts
    await addIfMissing('mobile_money_accounts', 'last_used_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
    await addIfMissing('mobile_money_accounts', 'metadata', {
      type: DataTypes.JSON,
      allowNull: true
    });

    // payments
    await addIfMissing('payments', 'mobile_money_account_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'mobile_money_accounts', key: 'id' }
    });
    await addIfMissing('payments', 'error_message', {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await addIfMissing('payments', 'paid_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
    await addIfMissing('payments', 'refunded_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('messages', 'audio_url');
    await queryInterface.removeColumn('messages', 'message_type');
    await queryInterface.removeColumn('messages', 'is_read');
    await queryInterface.removeColumn('messages', 'read_at');
    await queryInterface.removeColumn('mobile_money_accounts', 'last_used_at');
    await queryInterface.removeColumn('mobile_money_accounts', 'metadata');
    await queryInterface.removeColumn('payments', 'mobile_money_account_id');
    await queryInterface.removeColumn('payments', 'error_message');
    await queryInterface.removeColumn('payments', 'paid_at');
    await queryInterface.removeColumn('payments', 'refunded_at');
  }
};
