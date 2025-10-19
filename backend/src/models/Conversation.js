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

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const Conversation = sequelize.define('Conversation', {
  // Primary key (UUID for better security and distribution)
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    comment: 'Unique identifier for the conversation'
  },

  // FOREIGN KEYS - Define the relationship participants and product

  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'Products',
      key: 'id'
    },
    onDelete: 'CASCADE', // Delete conversation if product is deleted
    comment: 'The product being discussed in this conversation'
  },

  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'buyer_id',
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE', // Delete conversation if buyer deletes account
    comment: 'User who initiated contact (wants to buy the product)'
  },

  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'seller_id',
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE', // Delete conversation if seller deletes account
    comment: 'User who owns the product listing'
  },

  // LAST MESSAGE CACHE - For conversation list optimization
  // Instead of querying all messages, we store the last message here

  lastMessageText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'last_message_text',
    comment: 'Preview of the last message sent (for conversation list)'
  },

  lastMessageSenderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'last_message_sender_id',
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Who sent the last message'
  },

  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_message_at',
    comment: 'When was the last message sent (for sorting conversations)'
  },

  // UNREAD MESSAGE COUNTERS
  // Allows showing "5 unread messages" without counting every time

  buyerUnreadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'buyer_unread_count',
    validate: {
      min: 0 // Cannot be negative
    },
    comment: 'Number of unread messages for the buyer'
  },

  sellerUnreadCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'seller_unread_count',
    validate: {
      min: 0 // Cannot be negative
    },
    comment: 'Number of unread messages for the seller'
  },

  // SOFT DELETE FLAGS
  // Users can "delete" conversations, but we keep the data
  // Useful for dispute resolution and legal compliance

  deletedByBuyer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'deleted_by_buyer',
    comment: 'Buyer has deleted this conversation from their view'
  },

  deletedBySeller: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'deleted_by_seller',
    comment: 'Seller has deleted this conversation from their view'
  },

  // CONVERSATION STATUS
  // active: Normal ongoing conversation
  // archived: User has archived (not deleted) the conversation
  // blocked: One user has blocked the other (future feature)

  status: {
    type: DataTypes.ENUM('active', 'archived', 'blocked'),
    allowNull: false,
    defaultValue: 'active',
    comment: 'Current status of the conversation'
  }

}, {
  // TABLE OPTIONS

  tableName: 'Conversations',
  timestamps: true, // Adds createdAt and updatedAt automatically
  underscored: true, // Use snake_case in database

  // INDEXES for query performance optimization
  indexes: [
    {
      // Find all conversations for a buyer (not deleted)
      name: 'idx_conversations_buyer',
      fields: ['buyer_id'],
      where: {
        deleted_by_buyer: false
      }
    },
    {
      // Find all conversations for a seller (not deleted)
      name: 'idx_conversations_seller',
      fields: ['seller_id'],
      where: {
        deleted_by_seller: false
      }
    },
    {
      // Find conversation by product
      name: 'idx_conversations_product',
      fields: ['product_id']
    },
    {
      // Sort conversations by most recent activity
      name: 'idx_conversations_last_message',
      fields: [['last_message_at', 'DESC']]
    },
    {
      // Find conversations by status
      name: 'idx_conversations_status',
      fields: ['status']
    },
    {
      // UNIQUE CONSTRAINT: One conversation per buyer-seller-product combo
      // Prevents duplicate conversations
      name: 'unique_conversation',
      unique: true,
      fields: ['product_id', 'buyer_id', 'seller_id']
    }
  ],

  // VALIDATION
  validate: {
    // Business rule: Buyer and seller must be different users
    // You can't message yourself about your own product!
    differentParticipants() {
      if (this.buyerId === this.sellerId) {
        throw new Error('Buyer and seller must be different users')
      }
    }
  },

  // HOOKS - Run code before/after certain operations
  hooks: {
    // Before creating a conversation, validate that buyer isn't the seller
    beforeValidate: (conversation) => {
      if (conversation.buyerId && conversation.sellerId &&
          conversation.buyerId === conversation.sellerId) {
        throw new Error('Cannot create conversation: buyer and seller are the same user')
      }
    }
  }
})

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

module.exports = Conversation
