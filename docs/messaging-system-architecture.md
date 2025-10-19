# LibeMarket Messaging System - Architecture Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Database Design](#database-design)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [User Flows](#user-flows)
6. [Technical Decisions](#technical-decisions)

---

## 🎯 System Overview

### Purpose
Enable secure, private communication between buyers and sellers about specific products, similar to Facebook Marketplace or WhatsApp business chats.

### Key Features
- ✅ **Conversation-based messaging** - Messages grouped by product
- ✅ **Read receipts** - "Seen" indicators like WhatsApp
- ✅ **Unread counters** - Badge showing number of unread messages
- ✅ **Message history** - Full conversation history stored
- ✅ **Soft deletes** - Users can "delete" conversations without losing data
- ✅ **Mobile-optimized** - Works on slow Liberian internet connections

---

## 🗄️ Database Design

### Entity Relationship

```
Users (existing table)
  |
  ├─── Products (existing table)
  |       |
  |       └─── Conversations
  |               |
  |               └─── Messages
  └─── (participates in Conversations as buyer or seller)
```

### Tables

#### 1. **Conversations Table**
**Purpose:** Groups messages between 2 users about 1 product

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `product_id` | UUID | Which product is being discussed |
| `buyer_id` | UUID | User interested in buying |
| `seller_id` | UUID | User who owns the product |
| `last_message_text` | TEXT | Preview of last message (optimization) |
| `last_message_sender_id` | UUID | Who sent the last message |
| `last_message_at` | TIMESTAMP | When was last message sent |
| `buyer_unread_count` | INTEGER | Buyer's unread message count |
| `seller_unread_count` | INTEGER | Seller's unread message count |
| `deleted_by_buyer` | BOOLEAN | Buyer "deleted" this conversation |
| `deleted_by_seller` | BOOLEAN | Seller "deleted" this conversation |
| `status` | VARCHAR(20) | active, archived, or blocked |

**Important Constraints:**
- **UNIQUE(product_id, buyer_id, seller_id)** - Prevents duplicate conversations
- **CHECK(buyer_id != seller_id)** - Can't message yourself

**Why these fields?**
- `last_message_*` fields: Show conversation preview without loading all messages
- `*_unread_count`: Show badge numbers without counting messages every time
- `deleted_by_*`: Soft delete - hide from user but keep data

#### 2. **Messages Table**
**Purpose:** Stores individual messages within conversations

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | Which conversation this belongs to |
| `sender_id` | UUID | Who sent the message |
| `recipient_id` | UUID | Who receives the message |
| `content` | TEXT | The actual message text |
| `message_type` | VARCHAR(20) | text, image, offer, or system |
| `is_read` | BOOLEAN | Has recipient seen this? |
| `read_at` | TIMESTAMP | When was it read? |
| `deleted_by_sender` | BOOLEAN | Sender deleted this message |
| `deleted_by_recipient` | BOOLEAN | Recipient deleted this message |
| `metadata` | JSONB | Extra data (image URLs, offers, etc.) |

**Message Types:**
- `text` - Regular text message
- `image` - Message with attached image (future)
- `offer` - Price offer from seller (future)
- `system` - Auto-generated message (e.g., "Price changed")

### Database Triggers (Automatic Updates)

#### ✨ Why Triggers?
Instead of manually updating counters and metadata in our code, database triggers do it automatically. This ensures data is always consistent and reduces bugs.

#### Trigger 1: Update Last Message Preview
```sql
WHEN: A new message is inserted
THEN: Update the conversation's last_message_text, last_message_at, etc.
WHY: Conversation lists can show previews without loading all messages
```

#### Trigger 2: Increment Unread Count
```sql
WHEN: A new message is inserted
THEN: Increment the recipient's unread_count in the conversation
WHY: Show unread badges without counting messages
```

#### Trigger 3: Decrement Unread Count
```sql
WHEN: A message is marked as read
THEN: Decrement the recipient's unread_count
WHY: Keep unread badges accurate
```

#### Trigger 4: Update Timestamps
```sql
WHEN: Any record is updated
THEN: Set updated_at to current time
WHY: Track when records were last modified
```

---

## 🔌 API Endpoints

### Conversations

```
GET    /api/conversations
       Get all conversations for the logged-in user
       Response: Array of conversations with last message preview

GET    /api/conversations/:id
       Get a specific conversation with all messages
       Response: Conversation object with messages array

POST   /api/conversations
       Create or get existing conversation
       Body: { productId, recipientId }
       Response: Conversation object

DELETE /api/conversations/:id
       Soft delete a conversation (hide from user's view)
       Response: Success message

POST   /api/conversations/:id/archive
       Archive a conversation
       Response: Success message
```

### Messages

```
GET    /api/conversations/:conversationId/messages
       Get all messages in a conversation
       Query params: ?limit=50&offset=0 (pagination)
       Response: Array of messages

POST   /api/conversations/:conversationId/messages
       Send a new message
       Body: { content, messageType }
       Response: Created message object

PUT    /api/conversations/:conversationId/messages/mark-read
       Mark all messages in conversation as read
       Response: Number of messages marked as read

GET    /api/messages/unread-count
       Get total unread message count for user
       Response: { count: 5 }
```

---

## 🎨 Frontend Components

### Page Structure

```
src/pages/
  └── Messages.tsx           Main messages page
      ├── ConversationList   Left panel: list of conversations
      └── ChatWindow         Right panel: active conversation

src/components/
  ├── ConversationItem.tsx   Single conversation in the list
  ├── MessageBubble.tsx      Single message in the chat
  └── MessageInput.tsx       Text input to send messages
```

### Component Hierarchy

```
Messages Page
│
├── ConversationList (left side)
│   ├── SearchBox
│   └── ConversationItem (for each conversation)
│       ├── User Avatar
│       ├── Product Thumbnail
│       ├── Last Message Preview
│       ├── Timestamp
│       └── Unread Badge
│
└── ChatWindow (right side)
    ├── ChatHeader
    │   ├── Product Info
    │   └── Participant Info
    ├── MessageList
    │   └── MessageBubble (for each message)
    │       ├── Avatar
    │       ├── Content
    │       ├── Timestamp
    │       └── Read Receipt
    └── MessageInput
        ├── Text Input
        └── Send Button
```

### Mobile Layout

```
Mobile View (< 768px):
- Shows ConversationList by default
- Clicking a conversation navigates to full-screen ChatWindow
- Back button returns to ConversationList

Desktop View (≥ 768px):
- Split screen: ConversationList on left, ChatWindow on right
- Clicking a conversation updates ChatWindow panel
```

---

## 👤 User Flows

### Flow 1: Buyer Contacts Seller

```
1. Buyer views a product listing
2. Clicks "Message Seller" button
3. Frontend checks: Does conversation exist?
   - NO:  POST /api/conversations { productId, sellerId }
   - YES: GET /api/conversations/:id
4. Opens ChatWindow with existing/new conversation
5. Buyer types message and clicks Send
6. POST /api/conversations/:id/messages { content: "Is this available?" }
7. Database triggers:
   - Updates conversation.last_message_text
   - Increments seller's unread count
8. Seller sees notification badge (unread count)
9. Seller opens conversation
10. PUT /api/conversations/:id/messages/mark-read
11. Database trigger decrements seller's unread count
12. Seller sees "Is this available?" message
```

### Flow 2: Viewing All Conversations

```
1. User clicks "Messages" in navigation
2. GET /api/conversations
3. Response includes:
   - All conversations (not soft-deleted)
   - Last message preview
   - Unread counts
   - Product info
   - Other participant info
4. Display conversations sorted by last_message_at (newest first)
5. Show unread badges on conversations with unread messages
```

### Flow 3: Reading Messages

```
1. User clicks on a conversation
2. GET /api/conversations/:id/messages
3. Display messages in chronological order
4. Scroll to bottom (most recent message)
5. PUT /api/conversations/:id/messages/mark-read
6. Update UI: Remove unread badge, show "Seen" status
```

---

## 🤔 Technical Decisions Explained

### Why Conversation-Based Instead of Direct Messages?

**Context is Key:** In e-commerce, conversations are always about a specific product. Grouping messages by product makes sense:
- ✅ User sees which product the conversation is about
- ✅ Prevents confusion when talking to same seller about multiple products
- ✅ Easier to archive/delete conversations by product

### Why Soft Deletes?

**Legal & Dispute Protection:**
- If there's a payment dispute, we need message history
- Soft deletes hide data from users but keep it in the database
- Can be restored if needed
- Complies with data retention policies

### Why Store Last Message in Conversations Table?

**Performance Optimization:**
```
BAD (slow):
For each conversation:
  Query: SELECT * FROM Messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1

GOOD (fast):
One query: SELECT * FROM Conversations WHERE user_id = ?
All last messages already in the result!
```

**Impact:** On slow Liberian internet, this reduces load time from 5+ seconds to <1 second.

### Why Triggers Instead of Application Code?

**Consistency & Reliability:**

❌ **Without Triggers (Manual Updates):**
```javascript
// Developer must remember to update 3 things:
await Message.create({ content, conversationId })
await Conversation.update({ last_message_text: content })
await Conversation.increment('buyer_unread_count')
// What if one fails? Data is now inconsistent!
```

✅ **With Triggers (Automatic):**
```javascript
// Developer only does this:
await Message.create({ content, conversationId })
// Database automatically updates everything else!
```

### Why Separate sender_id and recipient_id in Messages?

**Query Optimization:**
```sql
-- Find all my unread messages:
SELECT * FROM Messages WHERE recipient_id = ? AND is_read = false

-- Without recipient_id, we need a complex join:
SELECT m.* FROM Messages m
JOIN Conversations c ON m.conversation_id = c.id
WHERE (c.buyer_id = ? OR c.seller_id = ?) AND m.is_read = false
```

The simpler query is faster on slow connections.

### Why JSONB for metadata?

**Flexibility for Future Features:**
```json
// For image messages:
{ "imageUrl": "https://...", "thumbnailUrl": "..." }

// For price offers:
{ "offerType": "price", "originalPrice": 500, "offeredPrice": 400 }

// For system messages:
{ "systemType": "price_change", "oldPrice": 500, "newPrice": 450 }
```

We can add new message types without changing the database schema.

---

## 📊 Performance Considerations for Liberia

### Challenge: Slow Internet (2G/3G networks)

**Solutions:**

1. **Pagination:** Load only 50 messages at a time
2. **Caching:** Store last message preview in Conversations table
3. **Indexes:** Fast queries using strategic database indexes
4. **Compression:** Use gzip compression for API responses
5. **Lazy Loading:** Load older messages only when user scrolls up

### Estimated Data Usage

```
Single Message:
- Text (100 chars): ~100 bytes
- Metadata: ~50 bytes
- Total: ~150 bytes

Loading Conversation List (20 conversations):
- Conversation preview: ~200 bytes each
- Total: ~4KB

Loading Chat (50 messages):
- Messages: 150 bytes × 50 = ~7.5KB
- Total: ~10KB with overhead

Result: Very data-efficient for mobile users! 🎉
```

---

## 🔒 Security Considerations

### Authorization Rules

1. **View Conversation:** User must be buyer OR seller
2. **Send Message:** User must be participant in conversation
3. **Read Messages:** User must be participant in conversation
4. **Delete Conversation:** User can only soft-delete their own view

### Implementation

```javascript
// Middleware check:
const conversation = await Conversation.findByPk(conversationId)
if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
  return res.status(403).json({ error: 'Unauthorized' })
}
```

---

## 🚀 Future Enhancements

### Phase 2 (After MVP)
- [ ] Real-time messaging with WebSockets/Socket.io
- [ ] Typing indicators ("User is typing...")
- [ ] Image sharing in messages
- [ ] Voice messages (important for low-literacy users in Liberia)
- [ ] Message search functionality
- [ ] Block/report users

### Phase 3 (Advanced Features)
- [ ] Automated translations (Liberia has 20+ languages)
- [ ] Price negotiation workflow (offer/counteroffer)
- [ ] Payment integration within chat
- [ ] Message encryption for privacy

---

## 📝 Summary

This messaging system provides:
- ✅ Simple, familiar interface (like WhatsApp/Facebook)
- ✅ Optimized for slow internet
- ✅ Scalable architecture (handles thousands of conversations)
- ✅ Secure and private
- ✅ Low data usage (critical for Liberia)

**Next Steps:**
1. ✅ Database schema designed
2. ⏳ Create backend models
3. ⏳ Build API controllers
4. ⏳ Create frontend components
5. ⏳ Test end-to-end

---

*Built for LibeMarket - Empowering Commerce in Liberia* 🇱🇷
