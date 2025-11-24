const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount
} = require('../controllers/messageController');

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/unread-count', getUnreadCount);

// Message routes
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);
router.patch('/conversations/:id/read', markAsRead);

module.exports = router;
