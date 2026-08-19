# Notification Model Fix - Import Error

## Issue
```
Error fetching unread count: TypeError: Cannot read properties of undefined (reading 'count')
    at getUnreadCount (notificationController.js:82:38)
```

The notification controller was trying to use `Notification.count()` but the `Notification` model was undefined.

## Root Cause
The `Notification` model exists in `models/Notification.js` but was NOT:
1. Imported in `models/index.js`
2. Initialized with Sequelize
3. Added to the models object
4. Exported from the models module

This caused the controller to receive `undefined` when trying to import the model.

---

## Fix Applied

### 1. **Import Notification Model** (models/index.js:15)
```javascript
const Notification = require('./Notification');
```

### 2. **Initialize Notification Model** (models/index.js:38)
```javascript
Notification.init(sequelize);
```

### 3. **Add to Models Object** (models/index.js:46)
```javascript
const models = { User, Product, Category, Offer, Notification, Review, Report, Favorite, Follower, Sale };
```

### 4. **Setup Associations** (models/index.js:74-76)
```javascript
if (Notification.associate) {
  Notification.associate(models);
}
```

### 5. **Add User-Notification Relationship** (models/index.js:85)
```javascript
User.hasMany(Notification, { as: 'notifications', foreignKey: 'user_id' });
```

### 6. **Export Notification** (models/index.js:128)
```javascript
module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Conversation,
  Message,
  Notification,  // ← Added
  Review,
  Report,
  Favorite,
  Follower,
  Sale,
  syncDatabase
};
```

---

## Notification Model Structure

The Notification model (models/Notification.js) has the following fields:

```javascript
{
  id: UUID (primary key),
  user_id: UUID (references users.id),
  type: ENUM('message', 'offer', 'product', 'review', 'follow', 'favorite', 'system'),
  title: STRING,
  message: TEXT,
  link: STRING (optional),
  is_read: BOOLEAN (default: false),
  related_id: UUID (optional),
  created_at: DATE,
  updated_at: DATE
}
```

**Associations:**
- `belongsTo User` (user_id)
- `User hasMany Notification` (user_id)

---

## Notification API Endpoints

Now that the model is properly initialized, these endpoints will work:

### GET /api/notifications
Get user's notifications with pagination
- Returns: List of notifications, unread count

### GET /api/notifications/unread-count
Get unread notification count
- Returns: `{ success: true, count: number }`

### PATCH /api/notifications/:id/read
Mark notification as read
- Returns: Updated notification

### PATCH /api/notifications/read-all
Mark all notifications as read
- Returns: Count of updated notifications

### DELETE /api/notifications/:id
Delete notification
- Returns: Success message

---

## Notification Creation

Notifications are created by other controllers when events occur:

**Message sent:**
```javascript
await createNotification(recipientId, {
  type: 'message',
  title: 'New Message',
  message: 'John sent you a message about "iPhone 13"',
  link: '/messages/conversation-id',
  relatedId: messageId
});
```

**Offer received:**
```javascript
await createNotification(sellerId, {
  type: 'offer',
  title: 'New Offer',
  message: 'Jane made an offer on your product',
  link: '/offers/offer-id',
  relatedId: offerId
});
```

---

## Real-time Notifications

When a notification is created, it's also emitted via Socket.io:

```javascript
const { emitNotificationToUser } = require('../socket/socketManager');

emitNotificationToUser(userId, {
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link,
  isRead: false,
  created_at: notification.created_at
});
```

This allows users to see notifications instantly without page refresh.

---

## Files Modified

**backend/src/models/index.js**
- Line 15: Added `const Notification = require('./Notification')`
- Line 38: Added `Notification.init(sequelize)`
- Line 46: Added `Notification` to models object
- Lines 74-76: Added Notification association setup
- Line 85: Added User-Notification relationship
- Line 128: Added `Notification` to exports

---

## Testing

### Test notification creation:
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system",
    "title": "Test Notification",
    "message": "This is a test notification"
  }'
```

### Test get unread count:
```bash
curl http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test get notifications:
```bash
curl http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Status: ✅ FIXED

The Notification model is now properly:
- ✅ Imported
- ✅ Initialized
- ✅ Associated with User model
- ✅ Exported from models/index.js
- ✅ Available to all controllers

All notification API endpoints should now work correctly.
