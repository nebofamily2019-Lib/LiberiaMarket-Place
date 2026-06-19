/**
 * CONVERSATION MODEL
 *
 * Represents a conversation thread between a buyer and seller about a specific product.
 *
 * BUSINESS RULES:
 * - One conversation per unique (buyer, seller, product) combination
 * - Buyer and seller must be different users
 * - Conversations are soft-deleted (hidden from view but data preserved)
 * - Last message info cached for performance (conversation list preview)
 * - Unread counters for both participants (notification badges)
 *
 * RELATIONSHIPS:
 * - belongsTo Product (the product being discussed)
 * - belongsTo User as buyer (person interested in buying)
 * - belongsTo User as seller (person who owns the product)
 * - belongsTo User as lastMessageSender (who sent the last message)
 * - hasMany Message (all messages in this conversation)
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Conversation Model
 * Represents a chat conversation between buyer and seller about a product
 */
const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  seller_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  listing_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    comment: 'The product this conversation is about'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp of the last message sent'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the conversation is active'
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['buyer_id', 'seller_id', 'listing_id'],
      name: 'unique_conversation'
    },
    {
      fields: ['buyer_id']
    },
    {
      fields: ['seller_id']
    },
    {
      fields: ['listing_id']
    }
  ]
});

module.exports = Conversation;

/**
 * INSTANCE METHODS
 * Methods that can be called on individual conversation instances
 */

// Mark conversation as read for a specific user
Conversation.prototype.markAsRead = async function(userId) {
  if (this.buyerId === userId) {
    this.buyerUnreadCount = 0
  } else if (this.sellerId === userId) {
    this.sellerUnreadCount = 0
  }
  await this.save()
}

// Get unread count for a specific user
Conversation.prototype.getUnreadCount = function(userId) {
  if (this.buyerId === userId) {
    return this.buyerUnreadCount
  } else if (this.sellerId === userId) {
    return this.sellerUnreadCount
  }
  return 0
}

// Check if user is a participant in this conversation
Conversation.prototype.isParticipant = function(userId) {
  return this.buyerId === userId || this.sellerId === userId
}

// Get the other participant's ID (given one participant)
Conversation.prototype.getOtherParticipantId = function(userId) {
  if (this.buyerId === userId) {
    return this.sellerId
  } else if (this.sellerId === userId) {
    return this.buyerId
  }
  return null
}

// Soft delete conversation for a specific user
Conversation.prototype.softDelete = async function(userId) {
  if (this.buyerId === userId) {
    this.deletedByBuyer = true
  } else if (this.sellerId === userId) {
    this.deletedBySeller = true
  }
  await this.save()
}

/**
 * CLASS METHODS
 * Methods that can be called on the Conversation model itself
 */

// Find or create a conversation for a specific buyer-seller-product combo
Conversation.findOrCreateConversation = async function(productId, buyerId, sellerId) {
  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    where: {
      productId,
      buyerId,
      sellerId
    }
  })

  // If not, create it
  if (!conversation) {
    conversation = await Conversation.create({
      productId,
      buyerId,
      sellerId
    })
  }

  // If it was soft-deleted, restore it
  if (conversation.deletedByBuyer || conversation.deletedBySeller) {
    conversation.deletedByBuyer = false
    conversation.deletedBySeller = false
    await conversation.save()
  }

  return conversation
}

// Get all conversations for a user (as buyer or seller)
Conversation.getConversationsForUser = async function(userId, options = {}) {
  const { limit = 50, offset = 0, status = 'active' } = options

  return await Conversation.findAll({
    where: {
      [sequelize.Sequelize.Op.or]: [
        {
          buyerId: userId,
          deletedByBuyer: false
        },
        {
          sellerId: userId,
          deletedBySeller: false
        }
      ],
      status
    },
    order: [['last_message_at', 'DESC NULLS LAST']],
    limit,
    offset
  })
}
