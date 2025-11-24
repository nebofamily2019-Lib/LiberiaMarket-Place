'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create conversations table
    const conversationsTableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('conversations'));

    if (!conversationsTableExists) {
      await queryInterface.createTable('conversations', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        buyer_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        seller_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        listing_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        lastMessageAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      // Add unique constraint
      await queryInterface.addConstraint('conversations', {
        fields: ['buyer_id', 'seller_id', 'listing_id'],
        type: 'unique',
        name: 'unique_conversation'
      });

      // Add indexes
      await queryInterface.addIndex('conversations', ['buyer_id']);
      await queryInterface.addIndex('conversations', ['seller_id']);
      await queryInterface.addIndex('conversations', ['listing_id']);

      console.log('✅ Conversations table created');
    } else {
      console.log('⚠️ Conversations table already exists');
    }

    // Create messages table
    const messagesTableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('messages'));

    if (!messagesTableExists) {
      await queryInterface.createTable('messages', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        conversation_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'conversations',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        sender_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        readAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      // Add indexes
      await queryInterface.addIndex('messages', ['conversation_id', 'createdAt']);
      await queryInterface.addIndex('messages', ['sender_id']);
      await queryInterface.addIndex('messages', ['isRead']);

      console.log('✅ Messages table created');
    } else {
      console.log('⚠️ Messages table already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
    console.log('✅ Conversations and Messages tables dropped');
  }
};
