const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  archiveConversation,
  unarchiveConversation,
  deleteConversation,
  muteConversation
} = require('../controllers/messageController');

// All routes require authentication
router.use(protect);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/unread-count', getUnreadCount); // Shorter path for frontend
router.get('/conversations/unread-count', getUnreadCount); // Legacy path for compatibility
router.patch('/conversations/:id/archive', archiveConversation);
router.patch('/conversations/:id/unarchive', unarchiveConversation);
router.delete('/conversations/:id', deleteConversation);
router.delete('/conversation/:id', deleteConversation); // Alternative path for frontend compatibility
router.patch('/conversations/:id/mute', muteConversation);

// Message routes
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', upload.single('audio'), sendMessage);
router.patch('/conversations/:id/read', markAsRead);

module.exports = router;
