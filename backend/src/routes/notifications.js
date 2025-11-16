const express = require('express')
const router = express.Router()
const { protect, checkOwnership } = require('../middleware/auth')
// const { Notification } = require('../models') // Uncomment when model created
// const notificationController = require('../controllers/notificationController')

// All notification routes require authentication
// router.use(protect) // Apply to all routes below

// User's own notifications
// router.get('/', notificationController.getNotifications) // Only gets current user's notifications
// router.get('/unread-count', notificationController.getUnreadCount)
// router.patch('/read-all', notificationController.markAllAsRead)

// Single notification operations (with ownership check)
// router.patch('/:id/read', checkOwnership(Notification, 'id', 'user_id'), notificationController.markAsRead)
// router.delete('/:id', checkOwnership(Notification, 'id', 'user_id'), notificationController.deleteNotification)

module.exports = router
