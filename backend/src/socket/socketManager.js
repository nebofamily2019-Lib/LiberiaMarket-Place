const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;
const userSockets = new Map(); // Map of userId -> socket.id
const conversationRooms = new Map(); // Map of conversationId -> Set of userIds
const typingUsers = new Map(); // Map of conversationId -> Map of userId -> timeout

/**
 * Initialize Socket.io server
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      let token = socket.handshake.auth.token;

      // If no token in auth object, try to get from cookies
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {});
        token = cookies.token;
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = decoded;

      logger.info('Socket authenticated', {
        userId: socket.userId,
        socketId: socket.id
      });

      next();
    } catch (error) {
      logger.error('Socket authentication failed', {
        error: error.message
      });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const userId = socket.userId;

    logger.info('User connected to socket', {
      userId,
      socketId: socket.id
    });

    // Store user's socket connection
    userSockets.set(userId, socket.id);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to real-time notifications',
      userId
    });

    // Broadcast user online status to relevant conversations
    broadcastUserStatus(userId, 'online');

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);

      // Track user in conversation
      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId).add(userId);

      logger.info('User joined conversation room', {
        userId,
        conversationId,
        socketId: socket.id
      });
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);

      // Remove user from conversation tracking
      if (conversationRooms.has(conversationId)) {
        conversationRooms.get(conversationId).delete(userId);
        if (conversationRooms.get(conversationId).size === 0) {
          conversationRooms.delete(conversationId);
        }
      }

      // Clear any typing indicator
      clearTypingIndicator(conversationId, userId);

      logger.info('User left conversation room', {
        userId,
        conversationId
      });
    });

    // Handle typing indicator
    socket.on('typing_start', ({ conversationId }) => {
      handleTypingStart(conversationId, userId, socket);
    });

    socket.on('typing_stop', ({ conversationId }) => {
      handleTypingStop(conversationId, userId, socket);
    });

    // Mark message as read (real-time)
    socket.on('message_read', ({ conversationId, messageId }) => {
      // Emit to other users in conversation
      socket.to(`conversation:${conversationId}`).emit('message_read_by_user', {
        conversationId,
        messageId,
        userId,
        readAt: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info('User disconnected from socket', {
        userId,
        socketId: socket.id
      });

      // Remove from active connections
      userSockets.delete(userId);

      // Clean up conversation rooms
      conversationRooms.forEach((users, conversationId) => {
        users.delete(userId);
        if (users.size === 0) {
          conversationRooms.delete(conversationId);
        }
      });

      // Clear all typing indicators for this user
      typingUsers.forEach((users, conversationId) => {
        if (users.has(userId)) {
          clearTypingIndicator(conversationId, userId);
        }
      });

      // Broadcast user offline status
      broadcastUserStatus(userId, 'offline');
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', {
        userId,
        error: error.message
      });
    });
  });

  logger.info('Socket.io server initialized');
  return io;
};

/**
 * Emit notification to a specific user
 */
const emitNotificationToUser = (userId, notification) => {
  try {
    const socketId = userSockets.get(userId);

    if (socketId) {
      io.to(socketId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });

      logger.info('Notification emitted to user', {
        userId,
        notificationType: notification.type,
        socketId
      });

      return true;
    } else {
      logger.debug('User not connected to socket', { userId });
      return false;
    }
  } catch (error) {
    logger.error('Error emitting notification', {
      userId,
      error: error.message
    });
    return false;
  }
};

/**
 * Emit message notification to a specific user
 */
const emitMessageToUser = (userId, message) => {
  try {
    const socketId = userSockets.get(userId);

    if (socketId) {
      io.to(socketId).emit('new_message', {
        ...message,
        timestamp: new Date().toISOString()
      });

      logger.info('Message notification emitted to user', {
        userId,
        socketId
      });

      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error emitting message notification', {
      userId,
      error: error.message
    });
    return false;
  }
};

/**
 * Broadcast to all connected users (admin only)
 */
const broadcastNotification = (notification) => {
  try {
    io.emit('broadcast', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    logger.info('Broadcast notification sent', {
      type: notification.type
    });

    return true;
  } catch (error) {
    logger.error('Error broadcasting notification', {
      error: error.message
    });
    return false;
  }
};

/**
 * Handle typing start
 */
const handleTypingStart = (conversationId, userId, socket) => {
  // Initialize conversation typing map if needed
  if (!typingUsers.has(conversationId)) {
    typingUsers.set(conversationId, new Map());
  }

  const conversationTyping = typingUsers.get(conversationId);

  // Clear any existing timeout
  if (conversationTyping.has(userId)) {
    clearTimeout(conversationTyping.get(userId));
  }

  // Emit typing indicator to other users in conversation
  socket.to(`conversation:${conversationId}`).emit('user_typing', {
    conversationId,
    userId,
    isTyping: true
  });

  // Auto-stop typing after 3 seconds of inactivity
  const timeout = setTimeout(() => {
    handleTypingStop(conversationId, userId, socket);
  }, 3000);

  conversationTyping.set(userId, timeout);

  logger.debug('User started typing', { userId, conversationId });
};

/**
 * Handle typing stop
 */
const handleTypingStop = (conversationId, userId, socket) => {
  clearTypingIndicator(conversationId, userId);

  // Emit typing stopped to other users
  socket.to(`conversation:${conversationId}`).emit('user_typing', {
    conversationId,
    userId,
    isTyping: false
  });

  logger.debug('User stopped typing', { userId, conversationId });
};

/**
 * Clear typing indicator for a user
 */
const clearTypingIndicator = (conversationId, userId) => {
  if (typingUsers.has(conversationId)) {
    const conversationTyping = typingUsers.get(conversationId);
    if (conversationTyping.has(userId)) {
      clearTimeout(conversationTyping.get(userId));
      conversationTyping.delete(userId);

      // Clean up empty conversation maps
      if (conversationTyping.size === 0) {
        typingUsers.delete(conversationId);
      }
    }
  }
};

/**
 * Broadcast user online/offline status
 */
const broadcastUserStatus = (userId, status) => {
  try {
    // Emit to all connected sockets
    io.emit('user_status', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });

    logger.debug('User status broadcast', { userId, status });
  } catch (error) {
    logger.error('Error broadcasting user status', {
      userId,
      status,
      error: error.message
    });
  }
};

/**
 * Emit new message to conversation participants
 */
const emitNewMessageToConversation = (conversationId, message, senderId) => {
  try {
    // Emit to all users in the conversation room except sender
    io.to(`conversation:${conversationId}`).emit('new_message', {
      conversationId,
      message,
      senderId,
      timestamp: new Date().toISOString()
    });

    logger.info('New message emitted to conversation', {
      conversationId,
      messageId: message.id,
      senderId
    });

    return true;
  } catch (error) {
    logger.error('Error emitting new message', {
      conversationId,
      error: error.message
    });
    return false;
  }
};

/**
 * Get number of connected users
 */
const getConnectedUsersCount = () => {
  return userSockets.size;
};

/**
 * Check if user is connected
 */
const isUserConnected = (userId) => {
  return userSockets.has(userId);
};

/**
 * Get conversation participants
 */
const getConversationParticipants = (conversationId) => {
  return conversationRooms.get(conversationId) || new Set();
};

module.exports = {
  initializeSocket,
  emitNotificationToUser,
  emitMessageToUser,
  emitNewMessageToConversation,
  broadcastNotification,
  broadcastUserStatus,
  getConnectedUsersCount,
  isUserConnected,
  getConversationParticipants
};
