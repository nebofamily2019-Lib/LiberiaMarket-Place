const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Message Model
 * Represents individual messages in a conversation
 */
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 5000]
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the message has been read by recipient'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the message was read'
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['conversation_id', 'createdAt']
    },
    {
      fields: ['sender_id']
    },
    {
      fields: ['isRead']
    }
  ]
});

module.exports = Message;
