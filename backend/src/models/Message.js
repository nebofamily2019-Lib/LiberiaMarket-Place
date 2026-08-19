const { Model, DataTypes } = require('sequelize');

/**
 * Message Model
 * Represents individual messages in a conversation
 */
class Message extends Model {
  static init(sequelize) {
    return super.init({
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
        allowNull: true,
        validate: {
          len: [0, 5000]
        }
      },
      audioUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'audio_url'
      },
      messageType: {
        type: DataTypes.ENUM('text', 'audio', 'image'),
        defaultValue: 'text',
        allowNull: false,
        field: 'message_type'
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_read'
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'read_at'
      }
    }, {
      sequelize,
      tableName: 'messages',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          fields: ['conversation_id', 'created_at']
        },
        {
          fields: ['sender_id']
        }
      ]
    });
  }
}

module.exports = Message;
