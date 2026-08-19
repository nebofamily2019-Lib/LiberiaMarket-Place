# Registration Process Review & Update

## Overview
The registration process has been reviewed to ensure a smooth experience for both Buyers and Sellers. The system supports a unified registration form with role selection, allowing users to sign up as a Buyer, Seller, or both.

## Key Features
- **Unified Form**: Single page (`/register`) for all user types.
- **Role Selection**: Users can select "Buy Products", "Sell Products", or both via checkboxes.
- **Dynamic UI**: The interface adapts based on the selected role (e.g., showing "Start Selling" vs "Join Marketplace").
- **Validation**: 
  - Phone number formatting (Liberian format).
  - Password strength and matching checks.
  - Required fields (Name, Gender, Phone, Password).
  - **Simplified**: Email field removed from registration to reduce friction. Users can add it later in their profile.

## Recent Improvements
1.  **Password Consistency**: 
    - Updated the frontend UI to explicitly state "At least 6 characters" to match the backend validation logic.
    - Fixed the HTML `minLength` attribute from 8 to 6.
2.  **Smart Redirection (Registration & Login)**:
    - **Sellers**: Upon successful registration or login, users with the 'seller' role are now automatically redirected to the **Seller Dashboard** (`/seller-dashboard`) to immediately start listing products.
    - **Buyers**: Users with only the 'buyer' role are redirected to the standard **Dashboard** (`/dashboard`) to view their activity and browse products.
3.  **Simplified Registration**:
    - Removed the optional Email field to streamline the sign-up process.
    - Converted Gender selection to user-friendly card/radio buttons.

## User Flow
1.  **Landing**: User clicks "Register" or "Start Selling".
2.  **Role Selection**: 
    - If "Start Selling" was clicked, the "Sell Products" checkbox is pre-selected.
    - Users can toggle roles.
3.  **Data Entry**: User enters Name, Gender, Phone, (Optional) Email, and Password.
4.  **Submission**: 
    - Backend validates data.
    - User account is created.
    - JWT token is issued via httpOnly cookie.
5.  **Onboarding**:
    - **Seller** -> Redirects to `/seller-dashboard`.
    - **Buyer** -> Redirects to `/dashboard`.

## Verification
- [x] Password length validation matches backend (6 chars).
- [x] Sellers are redirected to the correct dashboard.
- [x] Buyers are redirected to the correct dashboard.
- [x] Dual-role users are treated as sellers for the initial redirect (prioritizing the selling workflow).
