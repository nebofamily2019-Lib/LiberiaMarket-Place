# Listing Expiration & Renewal Implementation

## Overview
Implemented a 30-day expiration cycle for product listings with a renewal feature, aligning with industry standards (Facebook Marketplace, Craigslist) and adapted for the Liberian context.

## Changes Implemented

### Database
1.  **Schema Update**: Added `expiresAt` (DATETIME) column to the `Products` table.
2.  **Migration**: Created and ran `backend/scripts/add-product-expiration.js` to:
    - Add the column.
    - Set a default expiration date (30 days from now) for all existing active products.

### Backend
1.  **Product Creation**: Updated `createProduct` in `productController.js` to automatically set `expiresAt` to 30 days in the future.
2.  **Renewal Endpoint**: Added `POST /api/products/:id/renew` endpoint:
    - Extends `expiresAt` by 30 days from the current time.
    - Sets status to `active` (reactivating expired items).
    - Updates `updatedAt` to bump the product to the top of feeds.
    - Restricted to the product owner (seller).

### Frontend
1.  **Seller Dashboard**:
    - Added logic to fetch user's products and identify those expiring within 5 days.
    - Added an "⚠️ Action Needed" alert section at the top of the dashboard.
    - Implemented a "Renew Now" button that calls the renewal API.

## How it Works
1.  **Listing**: When a seller posts an item, it is valid for 30 days.
2.  **Warning**: When 5 days remain, the item appears in the "Expiring Soon" list on the Seller Dashboard.
3.  **Renewal**: Clicking "Renew Now" extends the life by another 30 days and bumps it to the top.

## Next Steps
- **Automated Expiration**: Implement a daily cron job to automatically set `status = 'expired'` for products where `expiresAt < NOW`.
- **Notifications**: Send SMS/WhatsApp alerts to sellers when items are about to expire.
