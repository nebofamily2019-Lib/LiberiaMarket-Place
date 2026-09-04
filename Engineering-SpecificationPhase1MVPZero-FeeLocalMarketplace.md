
Engineering Specification: Phase 1 MVP (Zero-Fee Local Marketplace)
1. System Overview & Core Philosophy
The objective of Phase 1 is maximum liquidity and trust generation in a localized cash/direct peer-to-peer exchange environment (Liberian market context).
 * Zero Transaction Fees: No percentages or payment deductions are charged on completed trades.
 * Decoupled Settlement: Buyers and sellers settle payments offline (Cash on Delivery or direct P2P Mobile Money).
 * Reputation-Driven Confirmation: The incentive for users to confirm transactions on-platform is identity verification, public star ratings, and algorithmic visibility.
[Buyer Discovers Listing] ──> [In-App Chat / Call Initiation] ──> [Offline Agreement & Handshake]
                                                                          │
                                     [Seller Clicks: "Mark as Completed / Sold"]
                                                                          │
                                     [Buyer Receives One-Click Confirmation Prompt]
                                                                          │
                                     [Review & Star Rating Unlocked on Both Profiles]
                                                                          │
                                     [Algorithm Boosts Verified Seller in Search]

2. Core Functional Requirements
2.1. Listing & Category Architecture
 * Location Scoping: Mandatory localized taxonomy. Every listing must bind to:
   * County (e.g., Montserrado)
   * District / Zone (e.g., Sinkor, Paynesville, Central Monrovia, Bushrod Island)
   * Free-form text landmark field (e.g., "Near Total Gas Station, 12th Street").
 * Service vs. Physical Goods Mode:
   * Physical Goods: Fixed price or "Negotiable" flag.
   * Labor / Services: Hourly, Fixed, or "Request Quote" rate display.
 * Dual Currency Display: Database stores an amount and a currency enum (USD or LRD). Front-end must clearly display the selected currency tag without automated conversions.
2.2. Lead Handshake & Contact Shield
To prevent anonymous ghosting and preserve platform transaction history:
 * Contact Gating: To reveal a seller’s direct phone/WhatsApp number or initiate in-app chat, the buyer must be logged in.
 * Lead Logging: When a buyer clicks "Call Seller" or "Chat on WhatsApp", log an event in trade_leads linking buyer_id, seller_id, and listing_id. This creates the audit trail for later confirmation prompts.
2.3. The Zero-Fee "Confirmation & Reputation" Engine
Because no escrow is used, completion must be frictionless:
 * Trigger: Seller or Buyer clicks "Mark as Done / Delivered".
 * Verification State Machine:
   * If Seller clicks first: Order status moves to PENDING_BUYER_CONFIRMATION. The system sends an in-app banner/SMS/push alert to the buyer: "Did you complete this deal with [Seller Name]?"
   * If Buyer clicks "Yes, Confirm": Order status immediately transitions to COMPLETED.
   * If Buyer does not respond within 48 hours: Auto-archive to AUTO_RESOLVED if an active in-app chat or lead click was logged.
 * Incentive Mechanics (The "Why Confirm" Hook):
   * Badge Unlocks: Sellers hit milestones (5 Confirmed Deals, Top Rated Artisan, Verified Local Merchant).
   * Review Gate: Mutual reviews and 1–5 star ratings only unlock once a transaction reaches COMPLETED.
3. Database Schema Blueprint
-- Profiles Extension for Local Trust
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN primary_county VARCHAR(50);
ALTER TABLE users ADD COLUMN primary_district VARCHAR(50);
ALTER TABLE users ADD COLUMN trust_score INT DEFAULT 0;
ALTER TABLE users ADD COLUMN completed_deals_count INT DEFAULT 0;

-- Lead Intent Audit Trail
CREATE TABLE trade_leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    interaction_type ENUM('IN_APP_CHAT', 'WHATSAPP_REDIRECT', 'PHONE_CLICK') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_listing (listing_id),
    INDEX idx_buyer_seller (buyer_id, seller_id)
);

-- P2P Non-Escrow Transactions
CREATE TABLE p2p_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    agreed_price DECIMAL(12, 2) NULL,
    currency ENUM('USD', 'LRD') DEFAULT 'USD',
    status ENUM('INITIATED', 'PENDING_BUYER_CONFIRMATION', 'COMPLETED', 'CANCELLED', 'DISPUTED') DEFAULT 'INITIATED',
    seller_confirmed_at TIMESTAMP NULL,
    buyer_confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- Reviews & Ratings Table
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL UNIQUE,
    reviewer_id BIGINT NOT NULL,
    reviewee_id BIGINT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES p2p_orders(id)
);

-- Future-Proof Monetization Hooks (Prepared for Phase 2)
CREATE TABLE listing_promotions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    listing_id BIGINT NOT NULL,
    promotion_type ENUM('PINNED_TOP', 'CATEGORY_HIGHLIGHT', 'HOMEPAGE_FEATURE') NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE'
);

4. Search & Algorithmic Ranking Logic
Instruct the developer to compute the search sorting score using this formula instead of chronological posting order:
Where:
 * R = Average Star Rating (1.0 to 5.0).
 * C = Total completed_deals_count (capped at 20 so new sellers still stand a chance).
 * \text{ActivePromotion} = 1 if the record exists in listing_promotions (Phase 2 hook), else 0.
 * \text{DaysOld} = Number of days since the listing was published.
5. Monetization Hooks for Future Deployment (Phase 2 Roadmap)
Your developer does not need to build payment gateways today, but they must reserve the UI/UX placement now:
 * "Promote Listing" Action Button: Visible on the seller's listing dashboard (currently labeled "Promotions Coming Soon" or wired to a manual admin contact link).
 * Verified Merchant Tag: A visual badge slot on user profiles indicating the user's physical shop/ID has been vetted.
 * MoMo/Orange Webhook Stub: A placeholder controller directory (/api/v1/webhooks/payments/) so integrating mobile money APIs later does not require rewriting the core listing lifecycle.
What specific framework or open-source codebase is your developer running (e.g., Sharetribe, WordPress/HivePress, Laravel, or Node/React)?

