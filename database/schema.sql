-- Community E-commerce SPA for Liberia - PostgreSQL Database Schema
-- This file contains the database schema for the LibMarket application

-- Create database (run this separately as superuser)
-- CREATE DATABASE libmarket_db;

-- Connect to the database
-- \c libmarket_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS "Ratings" CASCADE;
DROP TABLE IF EXISTS "Products" CASCADE;
DROP TABLE IF EXISTS "Categories" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Users table
CREATE TABLE "Users" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP,
    "resetPasswordToken" VARCHAR(255),
    "resetPasswordExpire" TIMESTAMP,
    "emailVerificationToken" VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE "Categories" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7) CHECK (color IS NULL OR color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE "Products" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category_id UUID NOT NULL REFERENCES "Categories"(id) ON DELETE RESTRICT,
    seller_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    location VARCHAR(100),
    condition VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
    images TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive', 'pending')),
    views INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table
CREATE TABLE "Ratings" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rater_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buying', 'selling')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rating_per_transaction UNIQUE (rater_id, rated_user_id, transaction_type)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_role ON "Users"(role);
CREATE INDEX idx_products_seller ON "Products"(seller_id);
CREATE INDEX idx_products_category ON "Products"(category_id);
CREATE INDEX idx_products_status ON "Products"(status);
CREATE INDEX idx_products_price ON "Products"(price);
CREATE INDEX idx_products_created ON "Products"(created_at DESC);
CREATE INDEX idx_ratings_rater ON "Ratings"(rater_id);
CREATE INDEX idx_ratings_rated_user ON "Ratings"(rated_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "Categories"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "Products"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON "Ratings"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO "Categories" (name, slug, description, icon, color, "sortOrder") VALUES
    ('Electronics', 'electronics', 'Electronic devices and gadgets', '📱', '#3B82F6', 1),
    ('Fashion', 'fashion', 'Clothing, shoes, and accessories', '👗', '#EC4899', 2),
    ('Home & Garden', 'home-garden', 'Furniture, appliances, and home decor', '🏡', '#10B981', 3),
    ('Sports', 'sports', 'Sports equipment and accessories', '⚽', '#F59E0B', 4),
    ('Books', 'books', 'Books, magazines, and educational materials', '📚', '#8B5CF6', 5),
    ('Vehicles', 'vehicles', 'Cars, motorcycles, and vehicle parts', '🚗', '#EF4444', 6),
    ('Services', 'services', 'Professional and personal services', '🔧', '#06B6D4', 7),
    ('Other', 'other', 'Miscellaneous items', '📦', '#6B7280', 8);

-- Create a default admin user (password: admin123)
-- Password hash generated with bcrypt for 'admin123'
INSERT INTO "Users" (name, email, phone, password, role, "emailVerified") VALUES
    ('Admin User', 'admin@libmarket.com', '+2311234567890', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYITr3U8AaG', 'admin', true);

COMMENT ON TABLE "Users" IS 'Stores user account information';
COMMENT ON TABLE "Categories" IS 'Product categories for organizing listings';
COMMENT ON TABLE "Products" IS 'Product listings created by sellers';
COMMENT ON TABLE "Ratings" IS 'User ratings and reviews for completed transactions';