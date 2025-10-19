-- Migration: Add slug, color, and sortOrder to Categories table
-- Date: 2025-10-18
-- Description: Enhances the Categories table with slug for SEO-friendly URLs, color for UI theming, and sortOrder for custom ordering

-- Step 1: Add new columns
ALTER TABLE "Categories"
ADD COLUMN IF NOT EXISTS slug VARCHAR(50),
ADD COLUMN IF NOT EXISTS color VARCHAR(7),
ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;

-- Step 2: Generate slugs for existing categories
UPDATE "Categories"
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- Step 3: Assign colors to existing categories
UPDATE "Categories" SET color = '#3B82F6' WHERE name = 'Electronics' AND color IS NULL;
UPDATE "Categories" SET color = '#EC4899' WHERE name = 'Fashion' AND color IS NULL;
UPDATE "Categories" SET color = '#10B981' WHERE name LIKE '%Home%' AND color IS NULL;
UPDATE "Categories" SET color = '#F59E0B' WHERE name = 'Sports' AND color IS NULL;
UPDATE "Categories" SET color = '#8B5CF6' WHERE name = 'Books' AND color IS NULL;
UPDATE "Categories" SET color = '#EF4444' WHERE name = 'Vehicles' AND color IS NULL;
UPDATE "Categories" SET color = '#06B6D4' WHERE name = 'Services' AND color IS NULL;
UPDATE "Categories" SET color = '#6B7280' WHERE name = 'Other' AND color IS NULL;

-- Step 4: Update icons to use emoji
UPDATE "Categories" SET icon = '📱' WHERE name = 'Electronics' AND icon = 'electronics';
UPDATE "Categories" SET icon = '👗' WHERE name = 'Fashion' AND icon = 'fashion';
UPDATE "Categories" SET icon = '🏡' WHERE name LIKE '%Home%' AND icon = 'home';
UPDATE "Categories" SET icon = '⚽' WHERE name = 'Sports' AND icon = 'sports';
UPDATE "Categories" SET icon = '📚' WHERE name = 'Books' AND icon = 'books';
UPDATE "Categories" SET icon = '🚗' WHERE name = 'Vehicles' AND icon = 'vehicles';
UPDATE "Categories" SET icon = '🔧' WHERE name = 'Services' AND icon = 'services';
UPDATE "Categories" SET icon = '📦' WHERE name = 'Other' AND icon = 'other';

-- Step 5: Assign sortOrder to existing categories
UPDATE "Categories" SET "sortOrder" = 1 WHERE name = 'Electronics';
UPDATE "Categories" SET "sortOrder" = 2 WHERE name = 'Fashion';
UPDATE "Categories" SET "sortOrder" = 3 WHERE name LIKE '%Home%';
UPDATE "Categories" SET "sortOrder" = 4 WHERE name = 'Sports';
UPDATE "Categories" SET "sortOrder" = 5 WHERE name = 'Books';
UPDATE "Categories" SET "sortOrder" = 6 WHERE name = 'Vehicles';
UPDATE "Categories" SET "sortOrder" = 7 WHERE name = 'Services';
UPDATE "Categories" SET "sortOrder" = 8 WHERE name = 'Other';

-- Step 6: Make slug NOT NULL and UNIQUE after populating
ALTER TABLE "Categories"
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE "Categories"
ADD CONSTRAINT "Categories_slug_key" UNIQUE (slug);

-- Step 7: Add check constraint for color format
ALTER TABLE "Categories"
ADD CONSTRAINT "Categories_color_check"
CHECK (color IS NULL OR color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$');

-- Step 8: Make sortOrder NOT NULL
ALTER TABLE "Categories"
ALTER COLUMN "sortOrder" SET NOT NULL;

-- Verification
SELECT id, name, slug, icon, color, "sortOrder", "isActive"
FROM "Categories"
ORDER BY "sortOrder";
