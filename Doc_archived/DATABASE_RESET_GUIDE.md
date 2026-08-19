# Database Reset Guide

To clear all users and related data (products, offers, messages, etc.) from the database, a script has been created.

## How to Run

1. Open a terminal.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Run the reset script:
   ```bash
   node scripts/reset-users.js
   ```

## What it Deletes
The script deletes data in the following order to respect foreign key constraints:
1. Messages
2. Conversations
3. Payments
4. Offers
5. Mobile Money Accounts
6. Reviews
7. Saved Items
8. Notifications
9. Reports
10. User Activity
11. Products
12. Users

**Note:** This action is irreversible. All user accounts and their generated content will be lost. Categories and Counties are preserved.
