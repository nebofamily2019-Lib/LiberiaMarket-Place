const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
// const messageController = require('../controllers/messageController')

// All message routes require authentication
// router.use(protect)

// Conversations
// router.get('/conversations', messageController.getConversations) // User's own conversations
// router.get('/conversation/:id', messageController.getConversationMessages) // Messages in a conversation (with participant check)
// router.post('/', messageController.sendMessage) // Send message
// router.patch('/conversation/:id/read', messageController.markConversationAsRead) // Mark as read (with participant check)
// router.get('/unread-count', messageController.getUnreadCount)
// router.delete('/conversation/:id', messageController.deleteConversation) // Delete conversation (with participant check)

// Note: Message controller should verify that req.user.id is a participant in the conversation
// before allowing access to messages or marking as read

module.exports = router
