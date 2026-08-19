# Phone Number Tracking & Verification Update

## Objective
Ensure the user's phone number serves as the primary tracking identifier across the application, particularly for transactions. Address the "Phone number already exists" error during registration and streamline the payment verification process.

## Changes Implemented

### 1. User Model (`backend/src/models/User.js`)
- **Enforced Uniqueness**: Re-enabled the `unique: true` constraint on the `phone` field in the database schema.
- **Validation**: Added a custom error message "Phone number already registered" to provide clear feedback.
- **Impact**: This ensures that no two users can share the same phone number, solidifying it as a unique identifier.

### 2. Registration Logic (`backend/src/controllers/authController.js`)
- **Enhanced Logging**: Added warning logs when a registration attempt fails due to an existing phone number. This helps in debugging false positives or understanding user behavior.
- **Normalization**: Confirmed that phone number normalization (removing non-digits, handling prefixes) is robust.

### 3. Mobile Money Verification (`backend/src/controllers/mobileMoneyController.js`)
- **Auto-Verification**: Implemented logic to automatically verify a mobile money account if the added phone number matches the user's login phone number.
- **Logic**:
  - Normalizes both the input phone number and the user's stored phone number.
  - If they match, `is_verified` is set to `true` immediately.
- **Impact**: Users who pay with their registered phone number (which is already verified via OTP/Login) do not need to go through a secondary verification step. This streamlines the "Payment number matches Login number" flow.

### 4. Payment Processing (`backend/src/controllers/paymentController.js`)
- **Verification Check**: The payment initiation process already requires `is_verified: true` for mobile money accounts.
- **Integration**: With the auto-verification change, users can now immediately use their login phone number for payments without friction.

## Addressing "Phone Number Already Exists"
- If you are encountering this error with "random" numbers, please ensure:
  - The database is cleared between test runs if you are running automated tests.
  - You are not inadvertently generating the same number (e.g., using a fixed seed).
- The backend now logs the specific normalized number that caused the collision, which can be checked in the server logs.

## Next Steps
- **Testing**: Verify that registering with a new number works.
- **Testing**: Verify that adding a mobile money account with the *same* number results in an auto-verified account.
- **Testing**: Verify that adding a *different* number results in an unverified account (requiring manual verification).
