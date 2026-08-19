-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (createdAt);
CREATE INDEX IF NOT EXISTS idx_products_category_status_created ON products (category_id, status, createdAt);

-- Offers indexes
CREATE INDEX IF NOT EXISTS idx_offers_seller_status_created ON offers (seller_id, status, created_at);
