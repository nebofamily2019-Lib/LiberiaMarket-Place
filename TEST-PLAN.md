# LibMarket - Comprehensive Test Plan (MVP Focus)

**Project:** Community E-commerce SPA for Liberia
**Version:** 1.0.0 (MVP)
**Date:** October 2025
**Test Environment:** Development & Staging

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Test Strategy](#2-test-strategy)
3. [Scope & Objectives](#3-scope--objectives)
4. [Test Environment](#4-test-environment)
5. [Unit Testing](#5-unit-testing)
6. [Integration Testing](#6-integration-testing)
7. [End-to-End (E2E) Testing](#7-end-to-end-e2e-testing)
8. [Security Testing](#8-security-testing)
9. [Performance Testing](#9-performance-testing)
10. [Mobile & Responsiveness Testing](#10-mobile--responsiveness-testing)
11. [User Acceptance Testing (UAT)](#11-user-acceptance-testing-uat)
12. [Test Data & Fixtures](#12-test-data--fixtures)
13. [Defect Management](#13-defect-management)
14. [Test Deliverables](#14-test-deliverables)
15. [Test Schedule](#15-test-schedule)
16. [Appendix](#16-appendix)

---

## 1. Introduction

### 1.1 Purpose
This document outlines the complete testing strategy for LibMarket, a mobile-first e-commerce platform designed for the Liberian market. The test plan focuses on MVP features to ensure product quality, security, and reliability before launch.

### 1.2 Project Overview
- **Type:** Single-page application (SPA)
- **Tech Stack:** React + TypeScript (frontend), Node.js + Express (backend), PostgreSQL (database)
- **Primary Users:** Liberian buyers, sellers, and admins
- **Key Differentiator:** Mobile-first design with Liberian phone-based authentication

### 1.3 Document Scope
This test plan covers all MVP features including:
- User registration, authentication, and profile management
- Product listing, search, filtering, and management
- Category management
- Rating and review system
- Authorization and access control

---

## 2. Test Strategy

### 2.1 Testing Levels

| Level | Coverage | Tools | Priority |
|-------|----------|-------|----------|
| **Unit Testing** | Individual functions, components | Jest, React Testing Library | P0 |
| **Integration Testing** | API endpoints, database operations | Jest + Supertest | P0 |
| **E2E Testing** | Complete user workflows | Playwright/Cypress | P1 |
| **Security Testing** | Authentication, authorization, vulnerabilities | OWASP ZAP, manual | P0 |
| **Performance Testing** | Load, stress, API response times | Artillery, k6 | P1 |
| **UAT** | Real user scenarios | Manual | P0 |

### 2.2 Test Approach
- **Test-Driven Development (TDD):** Write tests before implementation for new features
- **Continuous Integration:** Run automated tests on every commit
- **Risk-Based Testing:** Prioritize critical paths (auth, payments, data integrity)
- **Regression Testing:** Re-run full suite after bug fixes or new features

### 2.3 Entry & Exit Criteria

**Entry Criteria:**
- All MVP features implemented
- Development environment stable
- Test environment configured
- Test data prepared

**Exit Criteria:**
- 90%+ code coverage on backend
- 80%+ code coverage on frontend
- All P0 and P1 bugs resolved
- All security vulnerabilities fixed
- UAT sign-off received

---

## 3. Scope & Objectives

### 3.1 In Scope (MVP Features)

#### 3.1.1 User Management
- ✅ Phone-based registration (Liberian format: 9-digit)
- ✅ Login with JWT authentication
- ✅ Profile viewing and editing
- ✅ Password change and reset
- ✅ Avatar upload
- ✅ Payment method preferences

#### 3.1.2 Product Management
- ✅ Create product with images
- ✅ View products (grid, detail)
- ✅ Edit/delete own products
- ✅ Search products by keyword
- ✅ Filter by category, price, condition, location
- ✅ Pagination (12 products per page)
- ✅ View counter increment
- ✅ Mark product as sold

#### 3.1.3 Category System
- ✅ View all categories
- ✅ Admin: Create, edit, delete categories
- ✅ Pre-seeded 8 categories

#### 3.1.4 Rating & Review System
- ✅ Rate users (1-5 stars)
- ✅ Write reviews
- ✅ View user ratings
- ✅ Calculate average rating
- ✅ Anonymous rating option
- ✅ Prevent self-rating and duplicates

#### 3.1.5 Authorization
- ✅ Role-based access (user, seller, admin)
- ✅ Owner-only operations (edit/delete product)
- ✅ Admin-only operations (manage categories, users)

### 3.2 Out of Scope (Phase 2)
- ❌ Messaging system (schema ready, not implemented)
- ❌ Payment gateway integration
- ❌ Email notifications
- ❌ Push notifications
- ❌ Social media sharing
- ❌ Advanced analytics

### 3.3 Test Objectives
1. Verify all MVP features work as expected
2. Ensure data integrity across all operations
3. Validate security measures (auth, authorization, input validation)
4. Confirm mobile responsiveness on common Liberian devices
5. Achieve 90%+ backend test coverage
6. Identify and resolve critical bugs before launch

---

## 4. Test Environment

### 4.1 Backend Testing
```yaml
Database: SQLite (test), PostgreSQL (staging)
Node Version: 18.x or higher
Test Framework: Jest
HTTP Testing: Supertest
Test Scripts:
  - npm test (all tests)
  - npm run test:watch (watch mode)
  - npm run test:coverage (coverage report)
```

### 4.2 Frontend Testing
```yaml
React Version: 19.1.1
Test Framework: Jest + React Testing Library (to be set up)
Browser Testing: Chrome, Firefox, Safari, Mobile browsers
Test Scripts:
  - npm run test (to be configured)
  - npm run test:e2e (Playwright/Cypress)
```

### 4.3 Environment Variables
```bash
# Backend
NODE_ENV=test
DATABASE_URL=sqlite::memory:
JWT_SECRET=test_secret_key_12345
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000/api
```

### 4.4 Test Data Setup
- **Users:** 3 roles (user, seller, admin)
- **Products:** 50+ sample products across all categories
- **Categories:** 8 pre-seeded categories
- **Ratings:** 20+ ratings for various users
- **Images:** Mock image uploads

---

## 5. Unit Testing

### 5.1 Backend Unit Tests (Target: 150+ test cases)

#### 5.1.1 Authentication Controller (25 tests)

**File:** `backend/src/tests/auth.test.js`

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| AUTH-001 | Register user with valid phone and password | P0 | ✅ Pass |
| AUTH-002 | Register fails with invalid phone format | P0 | ✅ Pass |
| AUTH-003 | Register fails with duplicate phone | P0 | ✅ Pass |
| AUTH-004 | Register fails without required fields | P0 | ✅ Pass |
| AUTH-005 | Password is hashed before storage | P0 | ✅ Pass |
| AUTH-006 | Login with valid credentials returns JWT | P0 | ✅ Pass |
| AUTH-007 | Login fails with invalid password | P0 | ✅ Pass |
| AUTH-008 | Login fails with non-existent phone | P0 | ✅ Pass |
| AUTH-009 | Login updates lastLogin timestamp | P1 | ✅ Pass |
| AUTH-010 | Get current user with valid token | P0 | ✅ Pass |
| AUTH-011 | Get current user fails without token | P0 | ✅ Pass |
| AUTH-012 | Get current user fails with invalid token | P0 | ✅ Pass |
| AUTH-013 | Get current user fails with expired token | P0 | ⏳ Pending |
| AUTH-014 | Password change requires current password | P0 | ⏳ Pending |
| AUTH-015 | Password change validates new password length | P0 | ⏳ Pending |
| AUTH-016 | Password change updates password hash | P0 | ⏳ Pending |
| AUTH-017 | Forgot password generates reset token | P1 | ⏳ Pending |
| AUTH-018 | Reset token expires after 10 minutes | P1 | ⏳ Pending |
| AUTH-019 | Reset password with valid token succeeds | P1 | ⏳ Pending |
| AUTH-020 | Reset password with invalid token fails | P1 | ⏳ Pending |
| AUTH-021 | Reset password with expired token fails | P1 | ⏳ Pending |
| AUTH-022 | Phone normalization works for various formats | P0 | ⏳ Pending |
| AUTH-023 | Register with optional email works | P1 | ⏳ Pending |
| AUTH-024 | Register assigns default role 'user' | P0 | ✅ Pass |
| AUTH-025 | Logout clears token (frontend test) | P1 | ⏳ Pending |

#### 5.1.2 Product Controller (60 tests)

**File:** `backend/src/tests/products.test.js`

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| PROD-001 | Create product with all required fields | P0 | ✅ Pass |
| PROD-002 | Create product requires authentication | P0 | ✅ Pass |
| PROD-003 | Create product fails without title | P0 | ✅ Pass |
| PROD-004 | Create product fails without description | P0 | ✅ Pass |
| PROD-005 | Create product fails without price | P0 | ✅ Pass |
| PROD-006 | Create product fails without category | P0 | ✅ Pass |
| PROD-007 | Create product fails with negative price | P0 | ✅ Pass |
| PROD-008 | Create product fails with invalid category ID | P0 | ✅ Pass |
| PROD-009 | Create product fails with invalid condition | P0 | ✅ Pass |
| PROD-010 | Create product assigns seller_id from auth | P0 | ✅ Pass |
| PROD-011 | Create product generates unique slug | P1 | ⏳ Pending |
| PROD-012 | Create product sets default status 'active' | P0 | ✅ Pass |
| PROD-013 | Get all products returns paginated list | P0 | ✅ Pass |
| PROD-014 | Get all products default limit is 12 | P0 | ✅ Pass |
| PROD-015 | Get all products respects custom limit | P1 | ✅ Pass |
| PROD-016 | Get all products respects page parameter | P1 | ✅ Pass |
| PROD-017 | Filter products by category | P0 | ✅ Pass |
| PROD-018 | Filter products by price range (min) | P0 | ✅ Pass |
| PROD-019 | Filter products by price range (max) | P0 | ✅ Pass |
| PROD-020 | Filter products by price range (min-max) | P0 | ✅ Pass |
| PROD-021 | Filter products by condition | P0 | ✅ Pass |
| PROD-022 | Filter products by location | P1 | ✅ Pass |
| PROD-023 | Filter products by negotiable flag | P1 | ✅ Pass |
| PROD-024 | Sort products by price ascending | P0 | ✅ Pass |
| PROD-025 | Sort products by price descending | P0 | ✅ Pass |
| PROD-026 | Sort products by created_at (newest first) | P0 | ✅ Pass |
| PROD-027 | Sort products by views (most viewed) | P1 | ✅ Pass |
| PROD-028 | Combine multiple filters and sorting | P0 | ✅ Pass |
| PROD-029 | Get single product by ID returns product | P0 | ✅ Pass |
| PROD-030 | Get single product includes seller info | P0 | ✅ Pass |
| PROD-031 | Get single product includes category info | P0 | ✅ Pass |
| PROD-032 | Get single product increments view count | P1 | ✅ Pass |
| PROD-033 | Get own product does not increment views | P1 | ✅ Pass |
| PROD-034 | Get non-existent product returns 404 | P0 | ✅ Pass |
| PROD-035 | Update product requires authentication | P0 | ✅ Pass |
| PROD-036 | Update product requires ownership or admin | P0 | ✅ Pass |
| PROD-037 | Update product title succeeds | P0 | ✅ Pass |
| PROD-038 | Update product price succeeds | P0 | ✅ Pass |
| PROD-039 | Update product description succeeds | P0 | ✅ Pass |
| PROD-040 | Update product condition succeeds | P0 | ✅ Pass |
| PROD-041 | Update product fails with negative price | P0 | ✅ Pass |
| PROD-042 | Update product fails with invalid condition | P0 | ✅ Pass |
| PROD-043 | Non-owner cannot update product | P0 | ✅ Pass |
| PROD-044 | Admin can update any product | P0 | ✅ Pass |
| PROD-045 | Delete product requires authentication | P0 | ✅ Pass |
| PROD-046 | Delete product requires ownership or admin | P0 | ✅ Pass |
| PROD-047 | Non-owner cannot delete product | P0 | ✅ Pass |
| PROD-048 | Admin can delete any product | P0 | ✅ Pass |
| PROD-049 | Search products by title keyword | P0 | ✅ Pass |
| PROD-050 | Search products by description keyword | P0 | ✅ Pass |
| PROD-051 | Search products by location keyword | P1 | ✅ Pass |
| PROD-052 | Search is case-insensitive | P0 | ✅ Pass |
| PROD-053 | Search returns paginated results | P1 | ✅ Pass |
| PROD-054 | Get products by category slug | P0 | ✅ Pass |
| PROD-055 | Get products by category ID | P0 | ✅ Pass |
| PROD-056 | Get user's products (own products) | P0 | ✅ Pass |
| PROD-057 | Update product status to 'sold' | P0 | ✅ Pass |
| PROD-058 | Update product status to 'inactive' | P0 | ✅ Pass |
| PROD-059 | Update product status validates enum values | P0 | ✅ Pass |
| PROD-060 | Create product with image upload | P1 | ⏳ Pending |

#### 5.1.3 Category Controller (20 tests)

**File:** `backend/src/tests/categories.test.js`

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| CAT-001 | Get all categories returns list | P0 | ✅ Pass |
| CAT-002 | Get all categories includes inactive | P1 | ✅ Pass |
| CAT-003 | Get active categories only | P0 | ✅ Pass |
| CAT-004 | Get category by ID | P0 | ✅ Pass |
| CAT-005 | Get category by slug | P0 | ✅ Pass |
| CAT-006 | Get non-existent category returns 404 | P0 | ✅ Pass |
| CAT-007 | Create category requires admin role | P0 | ✅ Pass |
| CAT-008 | Create category with valid data | P0 | ✅ Pass |
| CAT-009 | Create category fails without name | P0 | ✅ Pass |
| CAT-010 | Create category generates slug from name | P1 | ✅ Pass |
| CAT-011 | Create category fails with duplicate name | P0 | ✅ Pass |
| CAT-012 | Create category fails with duplicate slug | P0 | ✅ Pass |
| CAT-013 | Update category requires admin role | P0 | ✅ Pass |
| CAT-014 | Update category name succeeds | P0 | ✅ Pass |
| CAT-015 | Update category isActive flag | P0 | ✅ Pass |
| CAT-016 | Update category sortOrder | P1 | ✅ Pass |
| CAT-017 | Delete category requires admin role | P0 | ✅ Pass |
| CAT-018 | Delete category succeeds if no products | P0 | ✅ Pass |
| CAT-019 | Delete category fails if has products | P0 | ⏳ Pending |
| CAT-020 | Non-admin cannot create/update/delete | P0 | ✅ Pass |

#### 5.1.4 Rating Controller (20 tests)

**File:** `backend/src/tests/ratings.test.js` (To be created)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| RATE-001 | Create rating with valid data | P0 | ⏳ Pending |
| RATE-002 | Create rating requires authentication | P0 | ⏳ Pending |
| RATE-003 | Create rating fails without rated_user_id | P0 | ⏳ Pending |
| RATE-004 | Create rating fails without rating (1-5) | P0 | ⏳ Pending |
| RATE-005 | Create rating fails with rating < 1 | P0 | ⏳ Pending |
| RATE-006 | Create rating fails with rating > 5 | P0 | ⏳ Pending |
| RATE-007 | Create rating prevents self-rating | P0 | ⏳ Pending |
| RATE-008 | Create rating prevents duplicate ratings | P0 | ⏳ Pending |
| RATE-009 | Create rating with anonymous flag | P1 | ⏳ Pending |
| RATE-010 | Get user's received ratings | P0 | ⏳ Pending |
| RATE-011 | Calculate average rating correctly | P0 | ⏳ Pending |
| RATE-012 | Get ratings includes rater info (if not anonymous) | P1 | ⏳ Pending |
| RATE-013 | Get ratings hides rater info if anonymous | P1 | ⏳ Pending |
| RATE-014 | Update rating requires ownership or admin | P0 | ⏳ Pending |
| RATE-015 | Update rating changes rating value | P0 | ⏳ Pending |
| RATE-016 | Update rating changes review text | P0 | ⏳ Pending |
| RATE-017 | Delete rating requires ownership or admin | P0 | ⏳ Pending |
| RATE-018 | Non-owner cannot update/delete rating | P0 | ⏳ Pending |
| RATE-019 | Admin can update/delete any rating | P0 | ⏳ Pending |
| RATE-020 | Get ratings paginated | P1 | ⏳ Pending |

#### 5.1.5 User Controller (15 tests)

**File:** `backend/src/tests/users.test.js` (To be created)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| USER-001 | Get user profile requires authentication | P0 | ⏳ Pending |
| USER-002 | Get user profile returns current user data | P0 | ⏳ Pending |
| USER-003 | Update profile requires authentication | P0 | ⏳ Pending |
| USER-004 | Update profile name succeeds | P0 | ⏳ Pending |
| USER-005 | Update profile email succeeds | P1 | ⏳ Pending |
| USER-006 | Update profile location succeeds | P1 | ⏳ Pending |
| USER-007 | Update profile phone requires unique phone | P0 | ⏳ Pending |
| USER-008 | Update profile cannot change role (user) | P0 | ⏳ Pending |
| USER-009 | Upload avatar succeeds with valid image | P1 | ⏳ Pending |
| USER-010 | Upload avatar fails with invalid file type | P1 | ⏳ Pending |
| USER-011 | Upload avatar fails with file too large | P1 | ⏳ Pending |
| USER-012 | Update payment preferences succeeds | P1 | ⏳ Pending |
| USER-013 | Admin can get all users | P0 | ⏳ Pending |
| USER-014 | Admin can update user role | P0 | ⏳ Pending |
| USER-015 | Non-admin cannot access admin endpoints | P0 | ⏳ Pending |

### 5.2 Frontend Unit Tests (Target: 80+ test cases)

**Status:** Not yet implemented. Requires setup of Jest + React Testing Library.

#### 5.2.1 Component Tests (40 tests)

| Test Case ID | Component | Description | Priority | Status |
|--------------|-----------|-------------|----------|--------|
| COMP-001 | Navbar | Renders navigation links | P0 | ⏳ Pending |
| COMP-002 | Navbar | Shows login/register for unauthenticated | P0 | ⏳ Pending |
| COMP-003 | Navbar | Shows profile/logout for authenticated | P0 | ⏳ Pending |
| COMP-004 | ProductCard | Displays product title, price, image | P0 | ⏳ Pending |
| COMP-005 | ProductCard | Shows condition badge | P1 | ⏳ Pending |
| COMP-006 | ProductCard | Shows negotiable badge | P1 | ⏳ Pending |
| COMP-007 | ProductCard | Click navigates to product detail | P0 | ⏳ Pending |
| COMP-008 | ProductGrid | Renders grid of products | P0 | ⏳ Pending |
| COMP-009 | ProductGrid | Shows empty state if no products | P1 | ⏳ Pending |
| COMP-010 | SearchHeader | Renders search input | P0 | ⏳ Pending |
| COMP-011 | SearchHeader | Calls onSearch on submit | P0 | ⏳ Pending |
| COMP-012 | CategoryFilter | Displays all categories | P0 | ⏳ Pending |
| COMP-013 | CategoryFilter | Calls onChange on selection | P0 | ⏳ Pending |
| COMP-014 | PhoneInput | Validates Liberian phone format | P0 | ⏳ Pending |
| COMP-015 | PhoneInput | Shows error for invalid format | P0 | ⏳ Pending |
| COMP-016 | PhoneInput | Normalizes phone to 9-digit format | P0 | ⏳ Pending |
| COMP-017 | PaymentMethodSelector | Renders checkboxes | P1 | ⏳ Pending |
| COMP-018 | PaymentMethodSelector | Handles multiple selections | P1 | ⏳ Pending |
| COMP-019 | ProductMetaBadges | Displays condition badge | P1 | ⏳ Pending |
| COMP-020 | ProductMetaBadges | Displays location | P1 | ⏳ Pending |
| COMP-021 | ProtectedRoute | Redirects to login if not authenticated | P0 | ⏳ Pending |
| COMP-022 | ProtectedRoute | Renders children if authenticated | P0 | ⏳ Pending |
| COMP-023 | BottomNav | Renders on mobile only | P1 | ⏳ Pending |
| COMP-024 | BottomNav | Highlights active route | P1 | ⏳ Pending |
| ... | ... | (Additional component tests) | ... | ⏳ Pending |

#### 5.2.2 Service Tests (20 tests)

| Test Case ID | Service | Description | Priority | Status |
|--------------|---------|-------------|----------|--------|
| SVC-001 | authService | login() calls API with phone/password | P0 | ⏳ Pending |
| SVC-002 | authService | login() stores token in localStorage | P0 | ⏳ Pending |
| SVC-003 | authService | register() calls API with user data | P0 | ⏳ Pending |
| SVC-004 | authService | logout() clears localStorage | P0 | ⏳ Pending |
| SVC-005 | productService | getProducts() fetches paginated list | P0 | ⏳ Pending |
| SVC-006 | productService | getProducts() handles filters | P0 | ⏳ Pending |
| SVC-007 | productService | createProduct() sends FormData | P0 | ⏳ Pending |
| SVC-008 | productService | updateProduct() sends updated data | P0 | ⏳ Pending |
| SVC-009 | categoryService | getCategories() fetches list | P0 | ⏳ Pending |
| SVC-010 | ratingService | createRating() sends rating data | P0 | ⏳ Pending |
| ... | ... | (Additional service tests) | ... | ⏳ Pending |

#### 5.2.3 Context Tests (10 tests)

| Test Case ID | Context | Description | Priority | Status |
|--------------|---------|-------------|----------|--------|
| CTX-001 | AuthContext | Initializes with user from localStorage | P0 | ⏳ Pending |
| CTX-002 | AuthContext | login() updates user state | P0 | ⏳ Pending |
| CTX-003 | AuthContext | logout() clears user state | P0 | ⏳ Pending |
| CTX-004 | AuthContext | Sets isAuthenticated correctly | P0 | ⏳ Pending |
| ... | ... | (Additional context tests) | ... | ⏳ Pending |

#### 5.2.4 Page Tests (10 tests)

| Test Case ID | Page | Description | Priority | Status |
|--------------|------|-------------|----------|--------|
| PAGE-001 | Login | Renders login form | P0 | ⏳ Pending |
| PAGE-002 | Login | Validates required fields | P0 | ⏳ Pending |
| PAGE-003 | Login | Calls authService.login on submit | P0 | ⏳ Pending |
| PAGE-004 | Register | Renders registration form | P0 | ⏳ Pending |
| PAGE-005 | Register | Validates phone format | P0 | ⏳ Pending |
| PAGE-006 | Products | Fetches and displays products | P0 | ⏳ Pending |
| PAGE-007 | ProductDetail | Fetches product on mount | P0 | ⏳ Pending |
| PAGE-008 | AddProduct | Requires authentication | P0 | ⏳ Pending |
| ... | ... | (Additional page tests) | ... | ⏳ Pending |

---

## 6. Integration Testing

### 6.1 API Integration Tests (40 tests)

**Objective:** Test interactions between controllers, models, and database.

#### 6.1.1 User Registration → Product Creation Flow (5 tests)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| INT-001 | Register user → Create product → Verify seller_id | P0 | ⏳ Pending |
| INT-002 | Register user → Login → Create product with token | P0 | ⏳ Pending |
| INT-003 | Create product → Verify category relationship | P0 | ⏳ Pending |
| INT-004 | Create product → Upload image → Verify file storage | P1 | ⏳ Pending |
| INT-005 | Create product → Verify auto-slug generation | P1 | ⏳ Pending |

#### 6.1.2 Product Search & Filter Flow (10 tests)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| INT-006 | Filter by category → Verify correct products returned | P0 | ⏳ Pending |
| INT-007 | Filter by price range → Verify min/max applied | P0 | ⏳ Pending |
| INT-008 | Search keyword → Filter category → Sort by price | P0 | ⏳ Pending |
| INT-009 | Pagination → Page 2 → Verify offset applied | P0 | ⏳ Pending |
| INT-010 | Filter condition → Sort by newest → Paginate | P1 | ⏳ Pending |
| INT-011 | Search empty keyword → Returns all products | P1 | ⏳ Pending |
| INT-012 | Filter by non-existent category → Returns empty | P1 | ⏳ Pending |
| INT-013 | Combine all filters → Verify correct results | P0 | ⏳ Pending |
| INT-014 | Get product by category slug → Verify products | P0 | ⏳ Pending |
| INT-015 | Get user's products → Verify only seller's products | P0 | ⏳ Pending |

#### 6.1.3 Rating & Review Flow (8 tests)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| INT-016 | Create rating → Verify rater relationship | P0 | ⏳ Pending |
| INT-017 | Create rating → Verify rated_user relationship | P0 | ⏳ Pending |
| INT-018 | Create rating → Calculate average rating | P0 | ⏳ Pending |
| INT-019 | Create multiple ratings → Verify average updates | P0 | ⏳ Pending |
| INT-020 | Get user ratings → Include rater info (not anonymous) | P1 | ⏳ Pending |
| INT-021 | Get user ratings → Hide rater info (anonymous) | P1 | ⏳ Pending |
| INT-022 | Update rating → Recalculate average | P1 | ⏳ Pending |
| INT-023 | Delete rating → Recalculate average | P1 | ⏳ Pending |

#### 6.1.4 Authorization Flow (10 tests)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| INT-024 | User A creates product → User B tries to update → 403 | P0 | ⏳ Pending |
| INT-025 | User A creates product → Admin updates → Success | P0 | ⏳ Pending |
| INT-026 | User tries to create category → 403 | P0 | ⏳ Pending |
| INT-027 | Admin creates category → Success | P0 | ⏳ Pending |
| INT-028 | User A rates User B → Success | P0 | ⏳ Pending |
| INT-029 | User A tries to rate self → 400 | P0 | ⏳ Pending |
| INT-030 | User A rates User B twice → 400 (duplicate) | P0 | ⏳ Pending |
| INT-031 | User A updates own rating → Success | P0 | ⏳ Pending |
| INT-032 | User A tries to update User B's rating → 403 | P0 | ⏳ Pending |
| INT-033 | Admin updates any rating → Success | P0 | ⏳ Pending |

#### 6.1.5 Data Integrity Tests (7 tests)

| Test Case ID | Description | Priority | Status |
|--------------|-------------|----------|--------|
| INT-034 | Delete category with products → Should fail | P0 | ⏳ Pending |
| INT-035 | Delete user → Cascade delete products | P1 | ⏳ Pending |
| INT-036 | Delete user → Cascade delete ratings | P1 | ⏳ Pending |
| INT-037 | Update product category to non-existent → Fail | P0 | ⏳ Pending |
| INT-038 | Create product with inactive category → Fail | P1 | ⏳ Pending |
| INT-039 | Phone uniqueness enforced across users | P0 | ⏳ Pending |
| INT-040 | Email uniqueness enforced (if provided) | P1 | ⏳ Pending |

---

## 7. End-to-End (E2E) Testing

### 7.1 E2E Test Setup

**Tool:** Playwright or Cypress
**Target:** 40+ end-to-end scenarios
**Browsers:** Chrome, Firefox, Safari, Mobile (iOS/Android simulators)

### 7.2 Critical User Journeys (40 tests)

#### 7.2.1 Buyer Journey (15 tests)

| Test Case ID | User Story | Steps | Priority | Status |
|--------------|------------|-------|----------|--------|
| E2E-001 | Browse products as guest | 1. Visit homepage<br>2. View product grid<br>3. Click product<br>4. View product detail | P0 | ⏳ Pending |
| E2E-002 | Search for product | 1. Enter search keyword<br>2. Click search<br>3. Verify results<br>4. Click result | P0 | ⏳ Pending |
| E2E-003 | Filter products by category | 1. Select category dropdown<br>2. Choose category<br>3. Verify filtered results | P0 | ⏳ Pending |
| E2E-004 | Filter products by price range | 1. Set min price<br>2. Set max price<br>3. Verify results in range | P0 | ⏳ Pending |
| E2E-005 | Filter by condition | 1. Select condition filter<br>2. Choose "new"<br>3. Verify only new products | P1 | ⏳ Pending |
| E2E-006 | Sort products by price | 1. Select sort dropdown<br>2. Choose "Price: Low to High"<br>3. Verify order | P0 | ⏳ Pending |
| E2E-007 | Combine filters | 1. Select category<br>2. Set price range<br>3. Sort by newest<br>4. Verify results | P0 | ⏳ Pending |
| E2E-008 | Pagination | 1. Scroll to bottom<br>2. Click page 2<br>3. Verify new products loaded | P0 | ⏳ Pending |
| E2E-009 | View seller profile from product | 1. Click product<br>2. Click seller name<br>3. View seller ratings | P1 | ⏳ Pending |
| E2E-010 | Register new account | 1. Click "Sign Up"<br>2. Fill form<br>3. Submit<br>4. Verify redirect to home | P0 | ⏳ Pending |
| E2E-011 | Login with valid credentials | 1. Click "Login"<br>2. Enter phone + password<br>3. Submit<br>4. Verify redirect | P0 | ⏳ Pending |
| E2E-012 | Login with invalid credentials | 1. Enter wrong password<br>2. Submit<br>3. Verify error message | P0 | ⏳ Pending |
| E2E-013 | View own profile | 1. Login<br>2. Click profile<br>3. Verify user data displayed | P0 | ⏳ Pending |
| E2E-014 | Update profile | 1. Login<br>2. Go to profile<br>3. Edit name<br>4. Save<br>5. Verify update | P0 | ⏳ Pending |
| E2E-015 | Logout | 1. Login<br>2. Click logout<br>3. Verify redirect to home | P0 | ⏳ Pending |

#### 7.2.2 Seller Journey (15 tests)

| Test Case ID | User Story | Steps | Priority | Status |
|--------------|------------|-------|----------|--------|
| E2E-016 | Create product | 1. Login<br>2. Click "Add Product"<br>3. Fill form<br>4. Submit<br>5. Verify product created | P0 | ⏳ Pending |
| E2E-017 | Create product with image | 1. Login<br>2. Add product<br>3. Upload image<br>4. Submit<br>5. Verify image displayed | P1 | ⏳ Pending |
| E2E-018 | Create product validation | 1. Add product<br>2. Submit empty form<br>3. Verify error messages | P0 | ⏳ Pending |
| E2E-019 | View own products | 1. Login<br>2. Go to "My Products"<br>3. Verify only own products | P0 | ⏳ Pending |
| E2E-020 | Edit own product | 1. Login<br>2. View product<br>3. Click edit<br>4. Update title<br>5. Save<br>6. Verify update | P0 | ⏳ Pending |
| E2E-021 | Delete own product | 1. Login<br>2. View product<br>3. Click delete<br>4. Confirm<br>5. Verify deleted | P0 | ⏳ Pending |
| E2E-022 | Mark product as sold | 1. Login<br>2. View product<br>3. Click "Mark as Sold"<br>4. Verify status | P0 | ⏳ Pending |
| E2E-023 | Cannot edit other's product | 1. Login as User A<br>2. View User B's product<br>3. Verify no edit button | P0 | ⏳ Pending |
| E2E-024 | View seller dashboard | 1. Login<br>2. Go to dashboard<br>3. View products, ratings | P1 | ⏳ Pending |
| E2E-025 | Upload avatar | 1. Login<br>2. Go to profile<br>3. Upload avatar<br>4. Verify displayed | P1 | ⏳ Pending |
| E2E-026 | Change password | 1. Login<br>2. Go to settings<br>3. Enter current + new password<br>4. Save<br>5. Login with new | P0 | ⏳ Pending |
| E2E-027 | Set payment preferences | 1. Login<br>2. Go to settings<br>3. Select payment methods<br>4. Save | P1 | ⏳ Pending |
| E2E-028 | View received ratings | 1. Login<br>2. View profile<br>3. See ratings from buyers | P0 | ⏳ Pending |
| E2E-029 | Rate a buyer | 1. Login as seller<br>2. Find buyer<br>3. Rate buyer<br>4. Submit<br>5. Verify rating | P0 | ⏳ Pending |
| E2E-030 | Cannot rate self | 1. Login<br>2. Try to rate own profile<br>3. Verify disabled | P0 | ⏳ Pending |

#### 7.2.3 Admin Journey (10 tests)

| Test Case ID | User Story | Steps | Priority | Status |
|--------------|------------|-------|----------|--------|
| E2E-031 | Admin login | 1. Login with admin credentials<br>2. Verify admin dashboard | P0 | ⏳ Pending |
| E2E-032 | Create category | 1. Login as admin<br>2. Go to categories<br>3. Create new<br>4. Verify created | P0 | ⏳ Pending |
| E2E-033 | Edit category | 1. Login as admin<br>2. Edit category<br>3. Save<br>4. Verify updated | P0 | ⏳ Pending |
| E2E-034 | Delete category | 1. Login as admin<br>2. Delete category (no products)<br>3. Verify deleted | P0 | ⏳ Pending |
| E2E-035 | Cannot delete category with products | 1. Login as admin<br>2. Try to delete category with products<br>3. Verify error | P0 | ⏳ Pending |
| E2E-036 | View all users | 1. Login as admin<br>2. Go to users<br>3. View user list | P1 | ⏳ Pending |
| E2E-037 | Update user role | 1. Login as admin<br>2. Edit user<br>3. Change role<br>4. Save | P1 | ⏳ Pending |
| E2E-038 | Delete any product | 1. Login as admin<br>2. View any product<br>3. Delete<br>4. Verify deleted | P0 | ⏳ Pending |
| E2E-039 | Update any product | 1. Login as admin<br>2. Edit any product<br>3. Save<br>4. Verify updated | P0 | ⏳ Pending |
| E2E-040 | Manage ratings | 1. Login as admin<br>2. View ratings<br>3. Verify/hide ratings | P1 | ⏳ Pending |

---

## 8. Security Testing

### 8.1 Authentication & Authorization (15 tests)

| Test Case ID | Threat | Test Steps | Priority | Status |
|--------------|--------|------------|----------|--------|
| SEC-001 | Unauthorized access | Try accessing /api/products (POST) without token → 401 | P0 | ✅ Pass |
| SEC-002 | Invalid token | Use invalid JWT → 401 | P0 | ⏳ Pending |
| SEC-003 | Expired token | Use expired JWT → 401 | P0 | ⏳ Pending |
| SEC-004 | Token manipulation | Modify JWT payload → 401 | P0 | ⏳ Pending |
| SEC-005 | Privilege escalation | User tries to access admin endpoint → 403 | P0 | ⏳ Pending |
| SEC-006 | IDOR (Insecure Direct Object Reference) | User A tries to update User B's product → 403 | P0 | ⏳ Pending |
| SEC-007 | Password exposure | Verify password not returned in API responses | P0 | ⏳ Pending |
| SEC-008 | Weak password | Try registering with password < 6 chars → 400 | P0 | ⏳ Pending |
| SEC-009 | Password hashing | Verify bcrypt with 12 rounds | P0 | ✅ Pass |
| SEC-010 | Reset token expiry | Verify reset token expires in 10 minutes | P0 | ⏳ Pending |
| SEC-011 | Reset token uniqueness | Verify token is unique (SHA256 hash) | P0 | ⏳ Pending |
| SEC-012 | Brute force protection | Rate limiting: 100 req/15min per IP | P1 | ⏳ Pending |
| SEC-013 | Session fixation | Verify token changes on password reset | P1 | ⏳ Pending |
| SEC-014 | CSRF protection | Verify CORS configuration allows only frontend | P1 | ⏳ Pending |
| SEC-015 | XSS protection | Verify Helmet.js CSP headers | P1 | ⏳ Pending |

### 8.2 Input Validation (15 tests)

| Test Case ID | Attack Vector | Test Steps | Priority | Status |
|--------------|---------------|------------|----------|--------|
| SEC-016 | SQL Injection | Submit product with title: `'; DROP TABLE users--` → No SQL error | P0 | ⏳ Pending |
| SEC-017 | NoSQL Injection | Submit query: `{"$gt": ""}` → Rejected | P0 | ⏳ Pending |
| SEC-018 | XSS in product title | Submit: `<script>alert('XSS')</script>` → Escaped | P0 | ⏳ Pending |
| SEC-019 | XSS in description | Submit HTML tags → Escaped or sanitized | P0 | ⏳ Pending |
| SEC-020 | Path traversal | Upload file: `../../etc/passwd` → Rejected | P0 | ⏳ Pending |
| SEC-021 | File upload - executable | Upload .exe file → Rejected | P0 | ⏳ Pending |
| SEC-022 | File upload - oversized | Upload 100MB file → Rejected (max 10MB) | P1 | ⏳ Pending |
| SEC-023 | Email injection | Register with email: `foo@bar.com\nBCC:attacker@evil.com` → Rejected | P1 | ⏳ Pending |
| SEC-024 | Phone injection | Register with phone: `123456789; DROP TABLE users` → Sanitized | P0 | ⏳ Pending |
| SEC-025 | Negative price | Submit product with price: -100 → Rejected | P0 | ✅ Pass |
| SEC-026 | Invalid enum | Submit product with condition: "hacked" → Rejected | P0 | ✅ Pass |
| SEC-027 | Mass assignment | Try to set role: admin on register → Rejected | P0 | ⏳ Pending |
| SEC-028 | Integer overflow | Submit product with price: 999999999999999 → Handled | P1 | ⏳ Pending |
| SEC-029 | JSON payload too large | Submit 10MB JSON → Rejected | P1 | ⏳ Pending |
| SEC-030 | Null byte injection | Submit title with `\0` → Sanitized | P1 | ⏳ Pending |

### 8.3 OWASP Top 10 Checklist

| OWASP Risk | Status | Notes |
|------------|--------|-------|
| A01: Broken Access Control | ⏳ Test | Verify owner-only, admin-only operations |
| A02: Cryptographic Failures | ⏳ Test | Verify bcrypt hashing, JWT signing |
| A03: Injection | ⏳ Test | SQL injection, XSS, command injection |
| A04: Insecure Design | ⏳ Review | Review architecture for security flaws |
| A05: Security Misconfiguration | ⏳ Test | Helmet.js, CORS, environment variables |
| A06: Vulnerable Components | ⏳ Audit | Run `npm audit` for dependencies |
| A07: Authentication Failures | ⏳ Test | Password policies, token expiry |
| A08: Data Integrity Failures | ⏳ Test | Verify file upload validation |
| A09: Logging & Monitoring | ❌ TODO | Implement error logging (Winston/Sentry) |
| A10: SSRF | ⏳ Test | Verify no user-controlled URLs |

---

## 9. Performance Testing

### 9.1 Load Testing (10 scenarios)

**Tool:** Artillery or k6
**Target:** 1000 concurrent users, 95th percentile response time < 2 seconds

| Test Case ID | Scenario | Virtual Users | Duration | Success Criteria | Status |
|--------------|----------|---------------|----------|------------------|--------|
| PERF-001 | Browse products (GET /products) | 100 | 5 min | p95 < 500ms | ⏳ Pending |
| PERF-002 | Search products | 100 | 5 min | p95 < 1s | ⏳ Pending |
| PERF-003 | View product detail | 100 | 5 min | p95 < 500ms | ⏳ Pending |
| PERF-004 | Create product | 50 | 5 min | p95 < 1.5s | ⏳ Pending |
| PERF-005 | Login | 100 | 5 min | p95 < 1s | ⏳ Pending |
| PERF-006 | Register | 50 | 5 min | p95 < 1.5s | ⏳ Pending |
| PERF-007 | Filter + sort products | 100 | 5 min | p95 < 1s | ⏳ Pending |
| PERF-008 | Concurrent product creation | 100 | 5 min | No DB deadlocks | ⏳ Pending |
| PERF-009 | Image upload | 20 | 5 min | p95 < 3s | ⏳ Pending |
| PERF-010 | Mixed load (realistic traffic) | 500 | 10 min | p95 < 2s | ⏳ Pending |

### 9.2 Database Performance (5 scenarios)

| Test Case ID | Scenario | Query | Target | Status |
|--------------|----------|-------|--------|
| PERF-011 | Products query with 10k records | GET /products?limit=12 | < 200ms | ⏳ Pending |
| PERF-012 | Search with 10k records | GET /products/search?q=phone | < 500ms | ⏳ Pending |
| PERF-013 | Filter by category with 10k records | GET /products?category=electronics | < 300ms | ⏳ Pending |
| PERF-014 | User ratings aggregation (1000 ratings) | Calculate average rating | < 100ms | ⏳ Pending |
| PERF-015 | Concurrent writes (100 products created) | INSERT products | No locks | ⏳ Pending |

### 9.3 Frontend Performance (5 scenarios)

| Test Case ID | Metric | Tool | Target | Status |
|--------------|--------|------|--------|--------|
| PERF-016 | First Contentful Paint (FCP) | Lighthouse | < 1.8s | ⏳ Pending |
| PERF-017 | Largest Contentful Paint (LCP) | Lighthouse | < 2.5s | ⏳ Pending |
| PERF-018 | Time to Interactive (TTI) | Lighthouse | < 3.8s | ⏳ Pending |
| PERF-019 | Cumulative Layout Shift (CLS) | Lighthouse | < 0.1 | ⏳ Pending |
| PERF-020 | Total Bundle Size | Webpack Bundle Analyzer | < 500KB (gzipped) | ⏳ Pending |

---

## 10. Mobile & Responsiveness Testing

### 10.1 Device Testing Matrix

| Device Type | OS | Browser | Screen Size | Priority | Status |
|-------------|----|---------| ------------|----------|--------|
| iPhone 12 | iOS 16 | Safari | 390x844 | P0 | ⏳ Pending |
| Samsung Galaxy S21 | Android 12 | Chrome | 360x800 | P0 | ⏳ Pending |
| iPad Air | iOS 16 | Safari | 820x1180 | P1 | ⏳ Pending |
| Desktop | Windows 11 | Chrome | 1920x1080 | P0 | ⏳ Pending |
| Desktop | macOS | Safari | 1440x900 | P1 | ⏳ Pending |
| Budget Android | Android 10 | Chrome | 360x640 | P1 | ⏳ Pending |

### 10.2 Responsive Design Tests (15 tests)

| Test Case ID | Feature | Test | Priority | Status |
|--------------|---------|------|----------|--------|
| RESP-001 | Navbar | Desktop: horizontal, Mobile: bottom nav | P0 | ⏳ Pending |
| RESP-002 | Product Grid | Desktop: 4 cols, Tablet: 3 cols, Mobile: 2 cols | P0 | ⏳ Pending |
| RESP-003 | Product Detail | Images stack vertically on mobile | P0 | ⏳ Pending |
| RESP-004 | Forms | Full width on mobile, centered on desktop | P0 | ⏳ Pending |
| RESP-005 | Search Bar | Expands on mobile when focused | P1 | ⏳ Pending |
| RESP-006 | Filters | Slide-out drawer on mobile, sidebar on desktop | P0 | ⏳ Pending |
| RESP-007 | Pagination | Desktop: numbers, Mobile: prev/next | P1 | ⏳ Pending |
| RESP-008 | Touch Targets | All buttons > 44px for mobile | P0 | ⏳ Pending |
| RESP-009 | Typography | Font sizes scale appropriately | P1 | ⏳ Pending |
| RESP-010 | Images | Responsive images load correct sizes | P1 | ⏳ Pending |
| RESP-011 | Landscape Mode | Layout adapts to landscape | P1 | ⏳ Pending |
| RESP-012 | Accessibility | Color contrast > 4.5:1 | P1 | ⏳ Pending |
| RESP-013 | Zoom | Page usable at 200% zoom | P1 | ⏳ Pending |
| RESP-014 | Offline | Show offline message | P2 | ⏳ Pending |
| RESP-015 | Slow Network | Show loading states | P1 | ⏳ Pending |

---

## 11. User Acceptance Testing (UAT)

### 11.1 UAT Objectives
- Validate system meets business requirements
- Verify user workflows are intuitive
- Gather feedback from real Liberian users
- Identify usability issues

### 11.2 UAT Participants
- **Buyers:** 5 users from different demographics
- **Sellers:** 5 small business owners
- **Admins:** 2 platform administrators

### 11.3 UAT Test Cases (20 scenarios)

| Test Case ID | Persona | Scenario | Success Criteria | Status |
|--------------|---------|----------|------------------|--------|
| UAT-001 | Buyer | Find and view a phone for sale | Completes in < 2 minutes | ⏳ Pending |
| UAT-002 | Buyer | Filter electronics by price range | Finds relevant products | ⏳ Pending |
| UAT-003 | Buyer | Register new account with phone number | Completes without confusion | ⏳ Pending |
| UAT-004 | Buyer | Rate a seller after purchase | Rating submitted successfully | ⏳ Pending |
| UAT-005 | Seller | List a product for sale with photo | Product appears in listings | ⏳ Pending |
| UAT-006 | Seller | Edit product price | Price updates correctly | ⏳ Pending |
| UAT-007 | Seller | Mark product as sold | Product status changes | ⏳ Pending |
| UAT-008 | Seller | View ratings from buyers | Sees all ratings | ⏳ Pending |
| UAT-009 | Seller | Upload avatar photo | Avatar displays in profile | ⏳ Pending |
| UAT-010 | Seller | Change password | New password works | ⏳ Pending |
| UAT-011 | Admin | Create new category | Category appears in dropdown | ⏳ Pending |
| UAT-012 | Admin | Deactivate inappropriate product | Product hidden from listings | ⏳ Pending |
| UAT-013 | Admin | View platform statistics | Dashboard shows data | ⏳ Pending |
| UAT-014 | All | Navigate on mobile device | UI is usable and clear | ⏳ Pending |
| UAT-015 | All | Recover forgotten password | Receives reset link (when implemented) | ⏳ Pending |
| UAT-016 | Buyer | Search for "laptop" | Relevant results appear | ⏳ Pending |
| UAT-017 | Seller | Select payment methods | Preferences saved | ⏳ Pending |
| UAT-018 | Buyer | View seller's other products | Sees seller's product list | ⏳ Pending |
| UAT-019 | All | Use app on slow 3G network | Graceful loading states | ⏳ Pending |
| UAT-020 | All | Provide feedback on experience | Feedback collected | ⏳ Pending |

### 11.4 UAT Feedback Template
```markdown
**Participant ID:** UAT-USER-001
**Role:** Buyer
**Date:** 2025-10-XX
**Device:** Samsung Galaxy A12

**Tasks Completed:**
- [x] Task 1: Find product
- [x] Task 2: Register
- [ ] Task 3: Rate seller (confusion on where to find rating button)

**Observations:**
- User struggled with phone input format
- Expected categories on homepage
- Loved the mobile-first design

**Bugs Found:**
- BUG-001: Phone validation error message unclear

**Suggestions:**
- Add examples for phone format (e.g., "88123456789")
- Make categories more prominent
```

---

## 12. Test Data & Fixtures

### 12.1 Test Users

```json
[
  {
    "name": "John Doe",
    "phone": "881234567",
    "email": "john@test.com",
    "password": "password123",
    "role": "user"
  },
  {
    "name": "Jane Seller",
    "phone": "771234567",
    "email": "jane@test.com",
    "password": "password123",
    "role": "seller"
  },
  {
    "name": "Admin User",
    "phone": "881111111",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }
]
```

### 12.2 Test Products

```json
[
  {
    "title": "Samsung Galaxy S21",
    "description": "Like new condition, 128GB, unlocked",
    "price": 350.00,
    "category": "Electronics",
    "condition": "like-new",
    "location": "Monrovia",
    "seller_id": "seller-uuid",
    "isNegotiable": true
  },
  {
    "title": "Vintage Leather Jacket",
    "description": "Genuine leather, size M",
    "price": 75.00,
    "category": "Fashion",
    "condition": "good",
    "location": "Paynesville",
    "seller_id": "seller-uuid",
    "isNegotiable": false
  }
]
```

### 12.3 Test Categories

```sql
-- Already seeded in database
Electronics, Fashion, Home & Garden, Sports, Books, Vehicles, Services, Other
```

### 12.4 Test Ratings

```json
[
  {
    "rater_id": "user-uuid",
    "rated_user_id": "seller-uuid",
    "rating": 5,
    "review": "Great seller, fast response!",
    "transaction_type": "buying"
  }
]
```

### 12.5 Test Images

- Mock images: Use placeholder service (e.g., Unsplash, Lorem Picsum)
- Test uploads: Prepare 5MB, 10MB, 15MB files (test limits)
- Test formats: .jpg, .png, .gif, .webp, .exe (invalid)

---

## 13. Defect Management

### 13.1 Bug Reporting Template

```markdown
**Bug ID:** BUG-XXX
**Title:** [Short description]
**Severity:** P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)
**Priority:** P0 | P1 | P2 | P3
**Status:** Open | In Progress | Fixed | Closed | Wontfix

**Environment:**
- OS: Windows 11
- Browser: Chrome 120
- Device: Desktop

**Steps to Reproduce:**
1. Navigate to /products
2. Click "Add Product"
3. Submit form without filling fields

**Expected Result:**
Validation errors should appear under each field

**Actual Result:**
500 Internal Server Error

**Screenshots/Logs:**
[Attach screenshots or error logs]

**Assigned To:** [Developer name]
**Found By:** [Tester name]
**Date:** 2025-10-XX
```

### 13.2 Severity Definitions

| Severity | Description | Example | SLA |
|----------|-------------|---------|-----|
| **P0 - Critical** | Blocks core functionality, data loss, security breach | Cannot login, payment fails | Fix within 24 hours |
| **P1 - High** | Major feature broken, workaround exists | Product images not uploading | Fix within 3 days |
| **P2 - Medium** | Minor feature broken, cosmetic issue | Pagination buttons misaligned | Fix within 1 week |
| **P3 - Low** | Enhancement, suggestion | Add dark mode | Fix in next sprint |

### 13.3 Bug Tracking

**Tool:** GitHub Issues, Jira, or Trello

**Labels:**
- `bug`, `feature`, `enhancement`, `documentation`
- `P0`, `P1`, `P2`, `P3`
- `frontend`, `backend`, `database`, `security`

---

## 14. Test Deliverables

### 14.1 Test Reports

1. **Unit Test Coverage Report**
   - File: `backend/coverage/index.html`
   - Tool: Jest Coverage
   - Target: 90%+ backend, 80%+ frontend

2. **Integration Test Report**
   - File: `test-reports/integration-report.html`
   - Format: HTML or JSON

3. **E2E Test Report**
   - File: `playwright-report/index.html` or `cypress/reports`
   - Screenshots/videos of failures

4. **Security Test Report**
   - File: `security-audit.md`
   - OWASP ZAP scan results
   - Dependency audit (`npm audit`)

5. **Performance Test Report**
   - File: `performance-report.html`
   - Metrics: response times, throughput, errors

6. **UAT Summary**
   - File: `uat-summary.md`
   - Feedback from all participants
   - List of identified issues

### 14.2 Test Metrics

| Metric | Target | Formula |
|--------|--------|---------|
| **Test Coverage** | 90% backend, 80% frontend | (Lines covered / Total lines) × 100 |
| **Pass Rate** | 95%+ | (Passed tests / Total tests) × 100 |
| **Defect Density** | < 10 bugs per 1000 LOC | (Total bugs / KLOC) |
| **Defect Removal Efficiency** | 90%+ | (Bugs found in testing / Total bugs) × 100 |
| **Test Execution Rate** | 100% by launch | (Executed tests / Total tests) × 100 |

---

## 15. Test Schedule

### 15.1 Timeline (4 weeks)

| Week | Phase | Activities | Deliverables |
|------|-------|------------|--------------|
| **Week 1** | Unit Testing | - Set up frontend testing<br>- Write missing backend tests<br>- Achieve 90% backend coverage | - Unit test reports<br>- Coverage report |
| **Week 2** | Integration & E2E | - Write integration tests<br>- Set up Playwright/Cypress<br>- Write critical E2E flows | - Integration test report<br>- E2E test suite |
| **Week 3** | Security & Performance | - Run OWASP ZAP scan<br>- Perform load testing<br>- Fix security vulnerabilities | - Security audit report<br>- Performance report |
| **Week 4** | UAT & Bug Fixing | - Conduct UAT sessions<br>- Fix P0/P1 bugs<br>- Regression testing | - UAT summary<br>- Final test report<br>- Go/No-Go decision |

### 15.2 Daily Testing Routine

```yaml
Daily (During Development):
  - Run unit tests on every commit (CI/CD)
  - Code review includes test review
  - Update test cases for new features

Weekly:
  - Run full integration test suite
  - Run E2E tests on staging
  - Review test coverage reports
  - Triage new bugs

Before Release:
  - Run all test suites (unit, integration, E2E)
  - Perform security scan
  - Execute UAT
  - Regression testing of all critical flows
  - Sign-off from QA and Product Owner
```

---

## 16. Appendix

### 16.1 Test Tools & Setup

#### Backend Testing
```bash
# Install dependencies
cd backend
npm install --save-dev jest supertest

# Run tests
npm test

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Frontend Testing (To be set up)
```bash
# Install dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# Configure jest.config.js
# Run tests
npm test
```

#### E2E Testing (To be set up)
```bash
# Playwright
npm install --save-dev @playwright/test
npx playwright test

# Or Cypress
npm install --save-dev cypress
npx cypress open
```

#### Performance Testing
```bash
# Artillery
npm install -g artillery
artillery run load-test.yml

# k6
k6 run load-test.js
```

#### Security Testing
```bash
# Dependency audit
npm audit
npm audit fix

# OWASP ZAP
# Download and run ZAP, configure proxy to http://localhost:5173
# Run automated scan
```

### 16.2 CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      - name: Run backend tests
        run: cd backend && npm test
      - name: Run frontend tests
        run: cd frontend && npm test
      - name: Run E2E tests
        run: npx playwright test
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 16.3 Test Data Scripts

**Seed Script: `backend/src/scripts/seed-test-data.js`**
```javascript
// Create test users, products, categories, ratings
// Run: node backend/src/scripts/seed-test-data.js
```

### 16.4 Reference Documents

- **API Documentation:** `/docs/API.md` (if exists)
- **Database Schema:** `/database/schema.sql`
- **Existing Tests:** `/backend/src/tests/*.test.js`
- **Project README:** `/README.md`

---

## Approval Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **QA Lead** | ________________ | ________________ | ______ |
| **Tech Lead** | ________________ | ________________ | ______ |
| **Product Owner** | ________________ | ________________ | ______ |
| **Project Manager** | ________________ | ________________ | ______ |

---

**Document Version:** 1.0
**Last Updated:** October 19, 2025
**Next Review:** After UAT completion

---

## Quick Reference: Test Counts Summary

| Test Type | Total Tests | Completed | Pending | Pass Rate |
|-----------|-------------|-----------|---------|-----------|
| **Backend Unit** | 150 | 112 | 38 | 100% |
| **Frontend Unit** | 80 | 0 | 80 | N/A |
| **Integration** | 40 | 0 | 40 | N/A |
| **E2E** | 40 | 0 | 40 | N/A |
| **Security** | 30 | 2 | 28 | 100% |
| **Performance** | 20 | 0 | 20 | N/A |
| **Responsive** | 15 | 0 | 15 | N/A |
| **UAT** | 20 | 0 | 20 | N/A |
| **TOTAL** | **395** | **114** | **281** | **TBD** |

**Target for MVP Launch:** 95% of tests passing, all P0 bugs resolved.

---

## Accessibility & AI-first Testing (Illiterate-first focus)

Purpose: Validate the app is usable by low-literacy users and that AI/voice helpers reliably assist tasks.

Acceptance criteria (high level)
- Core tasks (register, add product, search, contact seller) can be completed via voice or icon-driven UI within 3 steps.
- Audio prompts and confirmations exist for key flows and are correct for both English and Pidgin English.
- UI elements meet WCAG size/contrast rules and all interactive elements have audio labels.
- AI features (auto-description, price suggestion) provide useful, editable suggestions > 85% of the time in manual spot-checks.

Suggested test cases (integration / E2E)

1. Voice Registration (P0)
- Steps: open app → choose "Voice register" → respond to audio prompts → confirm account created.
- Verify: account created, token returned, brief audio confirmation.

2. Voice Add Product (P0)
- Steps: Login → "Add Product" → use voice to state title, category, price → AI suggests description and tags → confirm and post.
- Verify: product created with AI description (editable), audio success message, product visible in listings.

3. Audio-only Navigation (P1)
- Steps: From homepage, use voice commands to open categories, search, and view product details.
- Verify: spoken feedback for each step, no mandatory text input.

4. Price Suggestion Quality (P1)
- Steps: Add product, accept AI price suggestion vs manual input across 30 samples.
- Verify: suggestions within reasonable local range (manual spot-check).

5. TTS Error Handling (P0)
- Steps: Submit invalid product (missing price) via voice flow.
- Verify: short spoken error explaining missing field and how to fix (audio + visual highlight).

6. Low-bandwidth Mode (P1)
- Steps: Enable data-saving → browse product grid.
- Verify: thumbnails only load, audio and text work, form uploads use compressed images.

7. Localization & Pidgin Testing (P1)
- Steps: Switch to Pidgin → run registration and product publish flows.
- Verify: audio + UI copy are clear and culturally appropriate.

8. Accessibility Checks (P0)
- Automated and manual:
  - Color contrast >= WCAG AA
  - Focus order logical, ARIA labels present
  - Touch targets >=44px
  - Keyboard navigation and screen reader behavior

9. AI Safety & Privacy (P0)
- Ensure AI suggestions do not leak sensitive data and user edits are saved only after explicit confirmation.

Test data & environment
- Use a small set of test users representing low-literacy profiles.
- Use device emulators for low-end Android phones and 2G/3G throttled networks.
- Run manual UAT sessions with at least 3 non-technical local users if possible.

Notes for implementation team
- Prioritize voice-first flows for Register, Login, Add Product, and Search.
- Use short audio clips and TTS; avoid long paragraphs.
- Provide visible fallbacks (simple large buttons) so users can opt-out of voice.
- Include analytics for voice success/failure to iterate quickly.
