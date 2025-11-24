const { Conversation, Message, User, Product } = require('../models');
const { Op } = require('sequelize');
const validator = require('validator');
const logger = require('../utils/logger');

// @desc    Get all conversations for logged-in user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { buyer_id: userId },
          { seller_id: userId }
        ],
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Product,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images', 'status']
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'content', 'isRead', 'createdAt', 'sender_id']
        }
      ],
      order: [['lastMessageAt', 'DESC NULLS LAST'], ['updatedAt', 'DESC']]
    });

    // Add unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.count({
          where: {
            conversation_id: conv.id,
            sender_id: { [Op.ne]: userId },
            isRead: false
          }
        });

        return {
          ...conv.toJSON(),
          unreadCount
        };
      })
    );

    logger.info('Conversations fetched', {
      userId,
      count: conversationsWithUnread.length
    });

    res.status(200).json({
      success: true,
      count: conversationsWithUnread.length,
      data: conversationsWithUnread
    });
  } catch (error) {
    logger.error('Error fetching conversations', {
      error: error.message,
      userId: req.user.id
    });
    next(error);
  }
};

// @desc    Get or create conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res, next) => {
  try {
    const { listing_id } = req.body;
    const buyerId = req.user.id;

    if (!listing_id) {
      return res.status(400).json({
        success: false,
        error: 'Listing ID is required'
      });
    }

    // Get the product
    const product = await Product.findByPk(listing_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const sellerId = product.seller_id;

    // Can't message yourself
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot message yourself about your own product'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      where: {
        buyer_id: buyerId,
        seller_id: sellerId,
        listing_id: listing_id
      },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Product,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images', 'status']
        }
      ]
    });

    if (conversation) {
      // Reactivate if inactive
      if (!conversation.isActive) {
        await conversation.update({ isActive: true });
      }

      logger.info('Existing conversation found', {
        conversationId: conversation.id,
        buyerId,
        sellerId
      });

      return res.status(200).json({
        success: true,
        data: conversation,
        isNew: false
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      buyer_id: buyerId,
      seller_id: sellerId,
      listing_id: listing_id
    });

    // Fetch with associations
    conversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: Product,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images', 'status']
        }
      ]
    });

    logger.info('New conversation created', {
      conversationId: conversation.id,
      buyerId,
      sellerId,
      listingId: listing_id
    });

    res.status(201).json({
      success: true,
      data: conversation,
      isNew: true
    });
  } catch (error) {
    logger.error('Error creating conversation', {
      error: error.message,
      userId: req.user.id
    });
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/conversations/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this conversation'
      });
    }

    // Get messages
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          isRead: false
        }
      }
    );

    logger.info('Messages fetched', {
      conversationId,
      userId,
      count: messages.length
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      totalMessages: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: messages.reverse() // Oldest first for display
    });
  } catch (error) {
    logger.error('Error fetching messages', {
      error: error.message,
      conversationId: req.params.id,
      userId: req.user.id
    });
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/conversations/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Sanitize content
    const sanitizedContent = validator.escape(content.trim());

    if (sanitizedContent.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message too long. Maximum 5000 characters.'
      });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content: sanitizedContent
    });

    // Update conversation's lastMessageAt
    await conversation.update({ lastMessageAt: new Date() });

    // Fetch message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ]
    });

    logger.info('Message sent', {
      messageId: message.id,
      conversationId,
      senderId: userId
    });

    res.status(201).json({
      success: true,
      data: messageWithSender
    });
  } catch (error) {
    logger.error('Error sending message', {
      error: error.message,
      conversationId: req.params.id,
      userId: req.user.id
    });
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/conversations/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    // Mark messages as read
    const [updatedCount] = await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          isRead: false
        }
      }
    );

    logger.info('Messages marked as read', {
      conversationId,
      userId,
      count: updatedCount
    });

    res.status(200).json({
      success: true,
      message: `${updatedCount} message(s) marked as read`
    });
  } catch (error) {
    logger.error('Error marking messages as read', {
      error: error.message,
      conversationId: req.params.id,
      userId: req.user.id
    });
    next(error);
  }
};

// @desc    Get unread message count
// @route   GET /api/conversations/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user's conversations
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { buyer_id: userId },
          { seller_id: userId }
        ],
        isActive: true
      },
      attributes: ['id']
    });

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages
    const unreadCount = await Message.count({
      where: {
        conversation_id: { [Op.in]: conversationIds },
        sender_id: { [Op.ne]: userId },
        isRead: false
      }
    });

    res.status(200).json({
      success: true,
      unreadCount
    });
  } catch (error) {
    logger.error('Error getting unread count', {
      error: error.message,
      userId: req.user.id
    });
    next(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
};
