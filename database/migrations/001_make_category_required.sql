-- Migration: Make category_id required for products
-- Date: 2025-10-18
-- Description: Updates the Products table to make category_id NOT NULL and changes ON DELETE behavior to RESTRICT

-- Step 1: First, assign a default category to any products that don't have one
-- Get the 'Other' category ID and assign it to products without a category
DO $$
DECLARE
    other_category_id UUID;
BEGIN
    -- Get the 'Other' category ID
    SELECT id INTO other_category_id FROM "Categories" WHERE name = 'Other' LIMIT 1;

    -- If 'Other' category doesn't exist, create it
    IF other_category_id IS NULL THEN
        INSERT INTO "Categories" (name, description, icon, "isActive")
        VALUES ('Other', 'Miscellaneous items', 'other', true)
        RETURNING id INTO other_category_id;
    END IF;

    -- Update products without a category
    UPDATE "Products"
    SET category_id = other_category_id
    WHERE category_id IS NULL;

    RAISE NOTICE 'Updated % products to use Other category', (SELECT COUNT(*) FROM "Products" WHERE category_id = other_category_id);
END $$;

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE "Products"
DROP CONSTRAINT IF EXISTS "Products_category_id_fkey";

-- Step 3: Make category_id NOT NULL
ALTER TABLE "Products"
ALTER COLUMN category_id SET NOT NULL;

-- Step 4: Add the foreign key constraint back with ON DELETE RESTRICT
ALTER TABLE "Products"
ADD CONSTRAINT "Products_category_id_fkey"
FOREIGN KEY (category_id)
REFERENCES "Categories"(id)
ON DELETE RESTRICT;

-- Verification
SELECT
    COUNT(*) as total_products,
    COUNT(category_id) as products_with_category,
    COUNT(*) - COUNT(category_id) as products_without_category
FROM "Products";
