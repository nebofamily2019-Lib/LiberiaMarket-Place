-- ============================================================================
-- MESSAGING SYSTEM DATABASE SCHEMA FOR LIBMARKET
-- ============================================================================
-- This schema implements a conversation-based messaging system similar to
-- Facebook Marketplace, where buyers and sellers can communicate about products.
--
-- DESIGN PRINCIPLES:
-- 1. Each conversation is between exactly 2 users about 1 specific product
-- 2. Messages are stored chronologically within conversations
-- 3. Read receipts track message read status
-- 4. Soft deletes allow users to "delete" conversations without losing data
-- ============================================================================

-- Connect to the database
-- \c libmarket_db;

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
-- Stores the conversation metadata between a buyer and seller about a product.
--
-- WHY WE NEED THIS:
-- - Groups related messages together
-- - Links conversation to a specific product listing
-- - Tracks who is participating (buyer and seller)
-- - Prevents duplicate conversations for the same buyer-seller-product combo
-- - Stores last message info for UI optimization (conversation list preview)
--
-- BUSINESS LOGIC:
-- - One conversation per unique combination of (buyer, seller, product)
-- - Both participants can view all messages
-- - Either participant can "delete" the conversation (soft delete)
-- ============================================================================

DROP TABLE IF EXISTS "Messages" CASCADE;
DROP TABLE IF EXISTS "Conversations" CASCADE;

CREATE TABLE "Conversations" (
    -- Primary identifier for the conversation
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- The product being discussed
    -- ON DELETE CASCADE: If product is deleted, conversation is also deleted
    -- This makes sense because the conversation context (the product) no longer exists
    product_id UUID NOT NULL REFERENCES "Products"(id) ON DELETE CASCADE,

    -- The buyer (person interested in purchasing)
    -- ON DELETE CASCADE: If buyer account is deleted, their conversations are deleted
    buyer_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,

    -- The seller (person who listed the product)
    -- ON DELETE CASCADE: If seller account is deleted, their conversations are deleted
    seller_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,

    -- OPTIMIZATION: Store last message details for quick conversation list rendering
    -- Instead of querying all messages to show conversation preview, we store it here
    last_message_text TEXT,
    last_message_sender_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP,

    -- UNREAD MESSAGE COUNTERS
    -- These allow us to show unread badges without counting messages each time
    -- buyer_unread_count: How many messages the buyer hasn't read yet
    -- seller_unread_count: How many messages the seller hasn't read yet
    buyer_unread_count INTEGER NOT NULL DEFAULT 0,
    seller_unread_count INTEGER NOT NULL DEFAULT 0,

    -- SOFT DELETE FLAGS
    -- Instead of deleting conversations, we hide them from users
    -- This preserves data for legal/dispute purposes
    -- deleted_by_buyer: Buyer has "deleted" this conversation from their view
    -- deleted_by_seller: Seller has "deleted" this conversation from their view
    deleted_by_buyer BOOLEAN NOT NULL DEFAULT false,
    deleted_by_seller BOOLEAN NOT NULL DEFAULT false,

    -- STATUS TRACKING
    -- active: Conversation is ongoing
    -- archived: User has archived (not deleted) the conversation
    -- blocked: One user has blocked the other (future feature)
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'archived', 'blocked')),

    -- Timestamps for auditing and sorting
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- IMPORTANT CONSTRAINT: Prevent duplicate conversations
    -- Only one conversation can exist for a specific buyer-seller-product combination
    -- This prevents confusion and keeps messaging organized
    CONSTRAINT unique_conversation UNIQUE (product_id, buyer_id, seller_id),

    -- BUSINESS RULE: Buyer and seller must be different people
    -- You can't message yourself about your own product!
    CONSTRAINT different_participants CHECK (buyer_id != seller_id)
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Stores individual messages within conversations.
--
-- WHY WE NEED THIS:
-- - Stores actual message content and metadata
-- - Tracks sender and recipient for each message
-- - Implements read receipts
-- - Maintains chronological order of messages
--
-- BUSINESS LOGIC:
-- - Messages belong to exactly one conversation
-- - Messages have one sender (either buyer or seller)
-- - Messages can be marked as read by recipient
-- - Messages can contain text content (future: images, offers)
-- ============================================================================

CREATE TABLE "Messages" (
    -- Primary identifier for the message
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- The conversation this message belongs to
    -- ON DELETE CASCADE: If conversation is deleted, all its messages are deleted
    conversation_id UUID NOT NULL REFERENCES "Conversations"(id) ON DELETE CASCADE,

    -- Who sent this message
    -- ON DELETE SET NULL: If sender deletes their account, we keep the message
    -- but mark sender as NULL (shows as "Deleted User" in UI)
    sender_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE SET NULL,

    -- Who should receive this message (the other participant)
    -- This is redundant but optimizes queries for "show me my unread messages"
    recipient_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE SET NULL,

    -- The actual message content
    -- TEXT type allows messages up to 1GB (practically unlimited for text)
    -- We could add a CHECK constraint to limit length if needed for mobile data
    content TEXT NOT NULL,

    -- MESSAGE TYPE (for future expansion)
    -- text: Regular text message
    -- image: Message contains an image
    -- offer: Seller made a price offer
    -- system: System-generated message (e.g., "Product price changed")
    message_type VARCHAR(20) NOT NULL DEFAULT 'text'
        CHECK (message_type IN ('text', 'image', 'offer', 'system')),

    -- READ RECEIPT TRACKING
    -- is_read: Has the recipient opened/seen this message?
    -- read_at: When did they read it? (NULL if unread)
    -- This enables "seen" indicators like WhatsApp
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP,

    -- SOFT DELETE
    -- User can delete messages from their view without removing them from DB
    deleted_by_sender BOOLEAN NOT NULL DEFAULT false,
    deleted_by_recipient BOOLEAN NOT NULL DEFAULT false,

    -- METADATA FOR FUTURE FEATURES
    -- For image messages: store image URL
    -- For offer messages: store offer amount
    -- Stored as JSON for flexibility
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- BUSINESS RULE: Sender and recipient must be different
    CONSTRAINT different_users CHECK (sender_id != recipient_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
-- These indexes dramatically speed up common queries in the messaging system.
-- Liberia has limited internet speeds, so fast queries are critical.
-- ============================================================================

-- CONVERSATIONS TABLE INDEXES

-- Find all conversations for a specific user (buyer OR seller)
-- Used when loading "My Messages" page
CREATE INDEX idx_conversations_buyer ON "Conversations"(buyer_id)
    WHERE deleted_by_buyer = false;
CREATE INDEX idx_conversations_seller ON "Conversations"(seller_id)
    WHERE deleted_by_seller = false;

-- Find conversation by product (to check if one already exists)
-- Used when user clicks "Message Seller" on a product
CREATE INDEX idx_conversations_product ON "Conversations"(product_id);

-- Sort conversations by most recent activity
-- Used to show newest conversations first in the conversation list
CREATE INDEX idx_conversations_last_message ON "Conversations"(last_message_at DESC);

-- Find conversations by status (active, archived, blocked)
CREATE INDEX idx_conversations_status ON "Conversations"(status);

-- MESSAGES TABLE INDEXES

-- Find all messages in a conversation, ordered by time
-- Used when opening a conversation to show message history
CREATE INDEX idx_messages_conversation ON "Messages"(conversation_id, created_at DESC);

-- Find unread messages for a user
-- Used to show notification badges ("You have 5 unread messages")
CREATE INDEX idx_messages_unread ON "Messages"(recipient_id, is_read)
    WHERE is_read = false;

-- Find messages by sender (for user's sent message history)
CREATE INDEX idx_messages_sender ON "Messages"(sender_id, created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================
-- These triggers automatically maintain data consistency without manual code.
-- ============================================================================

-- TRIGGER 1: Update conversation's last_message fields when a new message is sent
-- WHY: This keeps conversation previews up-to-date without extra queries
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Conversations"
    SET
        last_message_text = NEW.content,
        last_message_sender_id = NEW.sender_id,
        last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_message
    AFTER INSERT ON "Messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- TRIGGER 2: Increment unread counter when a new message is sent
-- WHY: Efficiently track unread messages without counting them each time
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the recipient's unread count
    -- If sender is the buyer, increment seller's unread count
    -- If sender is the seller, increment buyer's unread count
    UPDATE "Conversations"
    SET
        buyer_unread_count = CASE
            WHEN NEW.recipient_id = (SELECT buyer_id FROM "Conversations" WHERE id = NEW.conversation_id)
            THEN buyer_unread_count + 1
            ELSE buyer_unread_count
        END,
        seller_unread_count = CASE
            WHEN NEW.recipient_id = (SELECT seller_id FROM "Conversations" WHERE id = NEW.conversation_id)
            THEN seller_unread_count + 1
            ELSE seller_unread_count
        END
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_unread
    AFTER INSERT ON "Messages"
    FOR EACH ROW
    EXECUTE FUNCTION increment_unread_count();

-- TRIGGER 3: Decrement unread counter when messages are marked as read
-- WHY: Keep unread counts accurate when user opens a conversation
CREATE OR REPLACE FUNCTION update_unread_on_read()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if message changed from unread to read
    IF OLD.is_read = false AND NEW.is_read = true THEN
        UPDATE "Conversations"
        SET
            buyer_unread_count = CASE
                WHEN NEW.recipient_id = (SELECT buyer_id FROM "Conversations" WHERE id = NEW.conversation_id)
                THEN GREATEST(buyer_unread_count - 1, 0)
                ELSE buyer_unread_count
            END,
            seller_unread_count = CASE
                WHEN NEW.recipient_id = (SELECT seller_id FROM "Conversations" WHERE id = NEW.conversation_id)
                THEN GREATEST(seller_unread_count - 1, 0)
                ELSE seller_unread_count
            END
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_unread_on_read
    AFTER UPDATE ON "Messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_unread_on_read();

-- TRIGGER 4: Auto-update the updated_at timestamp
-- WHY: Track when records were last modified for auditing
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON "Conversations"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON "Messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE "Conversations" IS 'Stores conversation threads between buyers and sellers about specific products';
COMMENT ON TABLE "Messages" IS 'Stores individual messages within conversations';

COMMENT ON COLUMN "Conversations".buyer_id IS 'User who initiated contact (wants to buy the product)';
COMMENT ON COLUMN "Conversations".seller_id IS 'User who owns the product listing';
COMMENT ON COLUMN "Conversations".last_message_text IS 'Cached last message for conversation list preview';
COMMENT ON COLUMN "Conversations".buyer_unread_count IS 'Number of unread messages for the buyer';
COMMENT ON COLUMN "Conversations".seller_unread_count IS 'Number of unread messages for the seller';
COMMENT ON COLUMN "Conversations".deleted_by_buyer IS 'Soft delete flag: buyer has hidden this conversation';
COMMENT ON COLUMN "Conversations".deleted_by_seller IS 'Soft delete flag: seller has hidden this conversation';

COMMENT ON COLUMN "Messages".content IS 'The actual text content of the message';
COMMENT ON COLUMN "Messages".is_read IS 'Whether the recipient has seen this message';
COMMENT ON COLUMN "Messages".read_at IS 'Timestamp when the message was read by recipient';
COMMENT ON COLUMN "Messages".message_type IS 'Type of message: text, image, offer, or system';
COMMENT ON COLUMN "Messages".metadata IS 'JSON field for storing additional message data (images, offers, etc.)';

-- ============================================================================
-- END OF MESSAGING SCHEMA
-- ============================================================================
--
-- USAGE INSTRUCTIONS:
-- 1. Ensure the main schema.sql has been run first (creates Users, Products tables)
-- 2. Run this file: psql -U postgres -d libmarket_db -f messaging-schema.sql
-- 3. Verify tables were created: \dt in psql
-- 4. Check triggers: \df in psql
--
-- NEXT STEPS:
-- - Create Sequelize models for Conversations and Messages
-- - Build messaging controller with API endpoints
-- - Create frontend messaging components
-- ============================================================================
