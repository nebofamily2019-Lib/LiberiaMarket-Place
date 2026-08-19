# 🏗️ Security Architecture & Workflow Review

**Application:** Liberia Marketplace E-commerce Platform
**Review Date:** 2025-12-05
**Focus:** System Architecture, Security Workflows, Data Flow

---

## 📊 Executive Summary

### Architecture Security Posture: **STRONG** ✅

The application follows a secure **defense-in-depth** architecture with multiple security layers. The separation of frontend/backend, stateless authentication, and role-based access control provide a solid foundation.

### Key Findings:
- ✅ **Secure Architecture**: Multi-layer defense, proper separation of concerns
- ✅ **Authentication Flow**: JWT + httpOnly cookies, account lockout mechanism
- ⚠️ **Session Management**: Dual token storage (cookies + localStorage) creates confusion
- ⚠️ **Authorization Workflow**: Strong RBAC but ownership checks could be more granular
- ⚠️ **Data Flow**: Generally secure but some sensitive data exposure in responses
- ✅ **API Architecture**: RESTful design with proper authentication gates

---

## 🏛️ System Architecture

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React SPA)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │  (UI Layer)  │  │  (Reusable)  │  │  (API Calls) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                │                   │            │
│           └────────────────┴───────────────────┘            │
│                            │                                │
│                    ┌───────▼────────┐                       │
│                    │  axios (api.ts) │                      │
│                    │  + CSRF Token   │                      │
│                    └───────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │ HTTPS
                             │ Cookie: token (httpOnly)
                             │ Header: X-CSRF-Token
                             │
┌────────────────────────────▼──────────────────────────────┐
│                   BACKEND (Node.js/Express)                │
│  ┌────────────────────────────────────────────────────┐   │
│  │          Security Middleware Layer                 │   │
│  │  ├─ Helmet (Security Headers)                      │   │
│  │  ├─ CORS (Cross-Origin Protection)                 │   │
│  │  ├─ Rate Limiting (Brute Force Prevention)         │   │
│  │  ├─ CSRF Protection                                │   │
│  │  ├─ XSS Clean                                      │   │
│  │  └─ Request Validation                             │   │
│  └────────────────────────────────────────────────────┘   │
│                            │                               │
│  ┌────────────────────────▼────────────────────────────┐  │
│  │          Authentication Middleware                  │  │
│  │  ├─ JWT Verification                                │  │
│  │  ├─ Cookie Extraction                               │  │
│  │  └─ User Loading                                    │  │
│  └────────────────────────────────────────────────────┘   │
│                            │                               │
│  ┌────────────────────────▼────────────────────────────┐  │
│  │          Authorization Middleware                   │  │
│  │  ├─ Role Validation (RBAC)                          │  │
│  │  └─ Resource Ownership Check                        │  │
│  └────────────────────────────────────────────────────┘   │
│                            │                               │
│  ┌────────────────────────▼────────────────────────────┐  │
│  │          Controllers (Business Logic)               │  │
│  │  ├─ Auth Controller                                 │  │
│  │  ├─ Product Controller                              │  │
│  │  ├─ Offer Controller                                │  │
│  │  ├─ Message Controller                              │  │
│  │  └─ ...                                             │  │
│  └────────────────────────────────────────────────────┘   │
│                            │                               │
│  ┌────────────────────────▼────────────────────────────┐  │
│  │          Models (Data Layer - Sequelize ORM)        │  │
│  │  ├─ User Model (Password Hashing)                   │  │
│  │  ├─ Product Model                                   │  │
│  │  ├─ Offer Model                                     │  │
│  │  └─ ...                                             │  │
│  └────────────────────────────────────────────────────┘   │
│                            │                               │
└────────────────────────────┼──────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   SQLite/       │
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

### Architecture Strengths ✅

1. **Layered Security**: Multiple security checks at different layers (middleware, auth, authorization)
2. **Separation of Concerns**: Clear separation between frontend, backend, and data layers
3. **Stateless Design**: JWT-based auth allows horizontal scaling
4. **Defense in Depth**: Multiple overlapping security controls
5. **ORM Layer**: Sequelize provides protection against SQL injection

### Architecture Concerns ⚠️

1. **Dual Token Storage**: Backend uses httpOnly cookies (secure), but frontend also stores in localStorage (vulnerable to XSS)
2. **No API Gateway**: Direct frontend-to-backend communication (consider API Gateway for production)
3. **Centralized Session Management**: No distributed session store (Redis) for multi-server deployments
4. **File Upload Architecture**: Files stored on local filesystem (not scalable, consider cloud storage)
5. **No CDN Integration**: Static assets served directly from backend

---

## 🔐 Authentication Workflow Security

### Current Authentication Flow

```
┌──────────────┐                                    ┌──────────────┐
│   Frontend   │                                    │   Backend    │
│  (Browser)   │                                    │   (Server)   │
└──────┬───────┘                                    └──────┬───────┘
       │                                                   │
       │  1. POST /api/auth/register                      │
       │    { name, phone, password, role }               │
       ├──────────────────────────────────────────────────>│
       │                                                   │
       │                            2. Validate Input     │
       │                            - Phone normalization │
       │                            - Password strength   │
       │                            - Duplicate check     │
       │                                                   │
       │                            3. Hash Password      │
       │                            - bcrypt (10 rounds)  │
       │                                                   │
       │                            4. Create User        │
       │                            - Store in database   │
       │                                                   │
       │                            5. Generate JWT       │
       │                            - Sign with secret    │
       │                            - 7-day expiration    │
       │                                                   │
       │  6. Response + Set-Cookie                        │
       │    Set-Cookie: token=JWT; HttpOnly; Secure       │
       │    { user: {...}, token: JWT }                   │
       │<──────────────────────────────────────────────────┤
       │                                                   │
       │  7. Store token in localStorage ⚠️               │
       │     localStorage.setItem('token', JWT)           │
       │                                                   │
       │  8. All Subsequent Requests                      │
       │    Cookie: token=JWT (automatic)                 │
       │    Authorization: Bearer JWT (from localStorage) │
       ├──────────────────────────────────────────────────>│
       │                                                   │
       │                            9. Verify JWT         │
       │                            - Check signature     │
       │                            - Check expiration    │
       │                            - Load user           │
       │                                                   │
       │  10. Response                                    │
       │<──────────────────────────────────────────────────┤
       │                                                   │
```

### Authentication Strengths ✅

1. **Strong Password Requirements**:
   - Minimum 8 characters
   - Must include uppercase, lowercase, number, special character
   - Prevents common passwords (blacklist)
   - Prevents patterns (keyboard patterns, sequences)

2. **Account Protection**:
   - Account lockout after 5 failed attempts
   - 15-minute lockout duration
   - Login attempts tracked per user

3. **Token Security**:
   - JWT signed with secret key
   - 7-day expiration (reasonable balance)
   - HttpOnly cookies prevent JavaScript access

4. **Phone Number Validation**:
   - Liberian phone number format validation
   - Carrier prefix validation
   - Normalization for consistency

### Authentication Concerns ⚠️

1. **CRITICAL: POC Password Reset Endpoint**
   ```
   POST /api/auth/poc-reset-password
   { phone, newPassword }
   → Resets password WITHOUT verification ❌
   ```
   - **Risk**: Complete account takeover
   - **Recommendation**: REMOVE before production, use proper verification flow

2. **Dual Token Storage Pattern**:
   ```
   Backend: Stores JWT in httpOnly cookie ✅
   Frontend: Also stores JWT in localStorage ❌
   ```
   - **Issue**: localStorage vulnerable to XSS attacks
   - **Recommendation**: Remove localStorage storage, rely only on cookies

3. **Token Exposure in Development**:
   ```javascript
   // Returns verification codes/reset tokens in API response (dev only)
   {
     verificationCode: "123456", // ⚠️ Exposed
     resetToken: "abc123"        // ⚠️ Exposed
   }
   ```
   - **Risk**: If accidentally deployed to production
   - **Recommendation**: Remove entirely, don't rely on environment check

4. **No Refresh Token Mechanism**:
   - JWT expires after 7 days, user must re-login
   - **Recommendation**: Implement refresh token for better UX

5. **Session Invalidation**:
   - No server-side session revocation mechanism
   - Logout only clears client-side data
   - **Recommendation**: Implement token blacklist or session store

---

## 🛡️ Authorization Workflow Security

### Role-Based Access Control (RBAC)

```
┌────────────────────────────────────────────────────────────┐
│                    User Roles & Permissions                 │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 BUYER                                                   │
│  ├─ Browse products (public + authenticated)               │
│  ├─ Make offers on products                                │
│  ├─ Send messages to sellers                               │
│  ├─ Favorite products                                      │
│  ├─ Follow sellers                                         │
│  └─ View own sent offers                                   │
│                                                             │
│  🏪 SELLER                                                  │
│  ├─ All buyer permissions                                  │
│  ├─ Create products                                        │
│  ├─ Update own products                                    │
│  ├─ Delete own products                                    │
│  ├─ Receive offers on products                             │
│  ├─ Accept/reject/counter offers                           │
│  ├─ View financial dashboard                               │
│  └─ Track sales analytics                                  │
│                                                             │
│  👑 ADMIN                                                   │
│  ├─ All seller permissions                                 │
│  ├─ Manage any product                                     │
│  ├─ Manage users                                           │
│  ├─ View all offers                                        │
│  ├─ Access system health endpoints                         │
│  └─ Bypass ownership restrictions                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Authorization Flow

```
Request → Authentication → Authorization → Resource Access
   │             │                │               │
   │             │                │               │
   ▼             ▼                ▼               ▼
[API Call] → [JWT Valid?] → [Has Role?] → [Owns Resource?]
                │                │               │
               No               No              No
                │                │               │
               401              403             403
           Unauthorized     Forbidden       Forbidden
```

### Authorization Strengths ✅

1. **Multi-Role Support**: Users can have multiple roles ([buyer, seller])
2. **Middleware-Based**: Centralized authorization logic
3. **Resource Ownership**: Checks if user owns the resource they're modifying
4. **Admin Bypass**: Admins can manage any resource
5. **Route-Level Protection**: Authorization middleware on protected routes

### Authorization Concerns ⚠️

1. **Inconsistent Ownership Checks**:
   ```javascript
   // Checks both seller_id AND userId without validation
   if (resource.seller_id !== req.user.id && resource.userId !== req.user.id)
   ```
   - Different models use different field names
   - **Recommendation**: Standardize to `user_id` or `seller_id` consistently

2. **No Fine-Grained Permissions**:
   - Role-based only (RBAC)
   - No permission-based control (PBAC)
   - **Example**: All sellers can create unlimited products
   - **Recommendation**: Consider permission system for scaling

3. **Missing Authorization Checks**:
   - Some endpoints rely solely on authentication
   - No explicit authorization for viewing other users' data
   - **Recommendation**: Audit all endpoints for authorization

4. **Frontend Authorization**:
   - UI hides buttons based on role (client-side only)
   - Backend enforces authorization (good ✅)
   - **Note**: This is correct - backend is source of truth

---

## 📤 Data Flow Security

### Sensitive Data Handling

```
┌──────────────────────────────────────────────────────────┐
│            Sensitive Data Categories                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  🔴 CRITICAL (Never Expose)                               │
│  ├─ Password hashes                                      │
│  ├─ JWT secrets                                          │
│  ├─ Database credentials                                 │
│  └─ API keys                                             │
│                                                           │
│  🟠 SENSITIVE (Expose Only to Owner)                      │
│  ├─ Full phone numbers                                   │
│  ├─ Email addresses                                      │
│  ├─ Verification codes                                   │
│  ├─ Reset tokens                                         │
│  └─ Financial details                                    │
│                                                           │
│  🟡 PROTECTED (Authenticated Users)                       │
│  ├─ User profiles                                        │
│  ├─ Messages                                             │
│  ├─ Offers                                               │
│  └─ Order history                                        │
│                                                           │
│  🟢 PUBLIC (Anyone)                                       │
│  ├─ Product listings                                     │
│  ├─ Categories                                           │
│  ├─ Public seller profiles                               │
│  └─ Product reviews                                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Data Flow - User Registration

```
Frontend Input               Backend Processing               Database Storage
─────────────────           ──────────────────               ────────────────

{ name: "John Doe",         1. Sanitize name:                name: "John Doe"
  email: "john@ex.com",        - validator.escape()
  phone: "0770123456",      2. Normalize phone:              phone: "770123456"
  password: "Pass123!",        - Remove country code            (8-9 digits)
  role: "buyer" }              - Remove leading 0
                            3. Validate email:               email: "john@ex.com"
                               - validator.isEmail()            (optional)
                            4. Validate password:            password: "$2a$10$..."
                               - Strength requirements          (bcrypt hash)
                               - Hash with bcrypt
                            5. Default role:                 role: "buyer"
                               - "buyer" if not specified    roles: ["buyer"]
                               - Validate against allowed       (JSON array)
```

### Data Flow Strengths ✅

1. **Password Never Stored Plain**: Always hashed with bcrypt before storage
2. **Password Excluded from Responses**: `attributes: { exclude: ['password'] }`
3. **Input Sanitization**: Name sanitized with `validator.escape()`
4. **Phone Normalization**: Consistent phone number format
5. **Selective Field Return**: Only necessary fields returned to frontend

### Data Flow Concerns ⚠️

1. **Development Mode Data Exposure**:
   ```javascript
   // ⚠️ Exposes verification codes in dev mode
   {
     verificationCode: process.env.NODE_ENV === 'development' ? code : undefined
   }
   ```
   - **Risk**: May accidentally go to production
   - **Impact**: Account takeover
   - **Recommendation**: Remove entirely, use proper testing infrastructure

2. **Sensitive Data in Logs**:
   ```javascript
   console.log('User data:', { name, email, phone, role });
   console.log('Login attempt:', phone, normalizedPhone);
   ```
   - **Risk**: PII in log files (GDPR violation)
   - **Recommendation**: Use structured logging with PII redaction

3. **Error Messages Leak Info**:
   ```javascript
   error: 'Phone number already registered'
   ```
   - **Risk**: User enumeration attack
   - **Recommendation**: Generic error: "Registration failed. If this phone is registered, check your email."

4. **No Data Classification Policy**:
   - No clear guidelines on what data is sensitive
   - **Recommendation**: Create data classification document

---

## 🔄 Message & Offer Workflow Security

### Messaging Workflow

```
Buyer                    Backend                    Seller
─────                    ───────                    ──────

1. View Product
   │
   ├─> Click "Contact Seller"
   │
   ├─> POST /api/messages/conversations
   │   { listing_id: "123" }
   │                         │
   │                         ├─> Create Conversation
   │                         │   - buyer_id: current user
   │                         │   - seller_id: product seller
   │                         │   - listing_id: product
   │                         │
   │                         ├─> Validate:
   │                         │   - User authenticated?
   │                         │   - Not messaging self?
   │                         │
   │                         ├─> Create Notification
   │                         │                    │
   │                         │                    ├─> Email/SMS to seller
   │                         │                    │
   │<────── Conversation ID ─┘                    │
   │                                              │
2. Send Message                                   │
   │                                              │
   ├─> POST /api/messages/conversations/:id/messages
   │   { content: "Hello!" }                      │
   │                         │                    │
   │                         ├─> Validate:        │
   │                         │   - User in conversation?
   │                         │   - Content not empty?
   │                         │                    │
   │                         ├─> Save Message     │
   │                         │                    │
   │                         ├─> Socket.io Emit ─>│
   │                         │                    │
   │<────── Message ─────────┘         Receives Real-time
```

### Messaging Security Strengths ✅

1. **Conversation Isolation**: Users can only see their own conversations
2. **Participant Validation**: Messages validated against conversation participants
3. **Real-time with Fallback**: Socket.io for real-time, HTTP API as fallback
4. **Self-Messaging Prevention**: Cannot message yourself
5. **Product Context**: Messages tied to specific product listing

### Messaging Security Concerns ⚠️

1. **No Message Encryption**: Messages stored in plaintext
   - **Recommendation**: Encrypt sensitive messages at rest

2. **No Rate Limiting on Messages**: Users can spam unlimited messages
   - **Recommendation**: Rate limit messages per conversation

3. **No Profanity/Spam Filtering**: No content moderation
   - **Recommendation**: Implement content filtering

4. **Message Deletion**: No soft delete mechanism
   - **Recommendation**: Implement soft deletes for audit trail

---

### Offer Workflow Security

```
Buyer Makes Offer          Backend Processing          Seller Receives
─────────────────          ──────────────────          ───────────────

1. POST /api/offers
   { product_id,    ────>  Validate:
     offer_amount,          - Authenticated?
     message }              - Product exists?
                            - Not own product?
                            - Amount > 0?

                            Create Offer:
                            - status: "pending"
                            - buyer_id: current user
                            - seller_id: product owner

                            Notify Seller:
                            - Create notification
                            - Send email/SMS     ────> Notification

                            Socket.io Emit      ────> Real-time update

2. Seller Reviews Offer                        Seller Actions:
                                               - Accept
                            Accept/Reject/     - Reject
                            Counter Offer  <──── - Counter

                            Update Offer:
                            - Change status
                            - Update amount

                            Notify Buyer   ────────> Notification
```

### Offer Security Strengths ✅

1. **Ownership Validation**: Buyers can't make offers on own products
2. **Status Workflow**: Clear state machine (pending → accepted/rejected/countered)
3. **Notification System**: Both parties notified of changes
4. **Amount Validation**: Prevents negative or zero offers
5. **Soft Delete**: Offers can be marked deleted without losing history

### Offer Security Concerns ⚠️

1. **No Offer Expiration**: Offers remain open indefinitely
   - **Recommendation**: Auto-expire offers after X days

2. **Unlimited Offers**: User can make unlimited offers on same product
   - **Recommendation**: Limit to X active offers per product

3. **No Counter-Offer Limit**: Infinite counter-offer loops possible
   - **Recommendation**: Limit counter-offers to 3 rounds

4. **Price Manipulation**: No validation that offer is reasonable
   - **Recommendation**: Validate offer is within X% of listing price

---

## 🌐 API Architecture Security

### API Design Patterns

```
RESTful API Structure:

Authentication:
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user
PUT    /api/auth/update-password   - Change password
POST   /api/auth/forgot-password   - Request reset
POST   /api/auth/reset-password    - Complete reset

Products:
GET    /api/products               - List products (public)
GET    /api/products/:id           - Get product (public)
POST   /api/products               - Create product (seller only)
PUT    /api/products/:id           - Update product (owner only)
DELETE /api/products/:id           - Delete product (owner only)

Offers:
GET    /api/offers                 - List offers (filtered by user)
POST   /api/offers                 - Make offer (buyer)
PATCH  /api/offers/:id/accept      - Accept offer (seller)
PATCH  /api/offers/:id/reject      - Reject offer (seller)
PATCH  /api/offers/:id/counter     - Counter offer (seller)

Messages:
GET    /api/messages               - List conversations
POST   /api/messages/conversations - Create conversation
GET    /api/messages/:id           - Get conversation messages
POST   /api/messages/:id/messages  - Send message
```

### API Security Strengths ✅

1. **RESTful Design**: Clear, predictable resource structure
2. **Consistent Response Format**: All responses follow `{ success, data/error }` pattern
3. **HTTP Status Codes**: Proper use of 200, 201, 400, 401, 403, 404, 500
4. **Versioning Ready**: Can add `/api/v2` in future
5. **Documentation**: Routes clearly organized and documented

### API Security Concerns ⚠️

1. **No API Versioning**: Direct `/api/*` without version
   - **Impact**: Breaking changes require all clients to update
   - **Recommendation**: Start with `/api/v1`

2. **No Request ID Tracking**: Can't trace requests across services
   - **Recommendation**: Add `X-Request-ID` header

3. **No API Documentation**: No Swagger/OpenAPI spec
   - **Recommendation**: Add OpenAPI documentation

4. **Rate Limiting Not Granular**: Same limit for all endpoints
   - **Recommendation**: Different limits for read vs write operations

5. **No API Keys for Third-Party**: Only supports user authentication
   - **Recommendation**: Add API key system for future integrations

---

## 🎯 Architectural Recommendations

### Priority 1: Critical Workflow Fixes

1. **Remove POC Password Reset**
   - Delete the endpoint entirely
   - Implement proper SMS/email verification
   - Document proper reset workflow

2. **Fix Token Storage Architecture**
   - Remove localStorage token storage
   - Rely solely on httpOnly cookies
   - Update frontend to use cookie-based auth

3. **Implement Session Revocation**
   - Add Redis for session management
   - Track active sessions per user
   - Allow users to revoke sessions

### Priority 2: High-Value Improvements

1. **Add Refresh Token Flow**
   ```
   Access Token: 15 minutes (JWT in httpOnly cookie)
   Refresh Token: 7 days (stored in Redis)
   ```

2. **Implement Message Encryption**
   - Encrypt sensitive messages at rest
   - Use AES-256 encryption
   - Store encryption keys separately

3. **Add Rate Limiting Per Resource**
   ```
   - Messages: 10 per minute per conversation
   - Offers: 5 per hour per product
   - Products: 10 per day per seller
   ```

4. **Implement Audit Logging**
   - Log all security events
   - Track user actions
   - Store in separate audit database

### Priority 3: Scalability & Production

1. **Cloud File Storage**
   - Move uploads to S3/Cloud Storage
   - Generate signed URLs for access
   - Implement CDN for images

2. **API Gateway**
   - Add API Gateway (Kong, AWS API Gateway)
   - Centralized auth
   - Rate limiting
   - Request transformation

3. **Distributed Session Management**
   - Use Redis cluster
   - Session replication
   - Failover support

4. **Database Security**
   - Enable encryption at rest
   - Use read replicas
   - Implement connection pooling
   - Add database firewall rules

---

## 📋 Security Architecture Checklist

### Before Production:

**Authentication & Authorization:**
- [ ] Remove POC password reset endpoint
- [ ] Implement proper SMS verification
- [ ] Remove localStorage token storage
- [ ] Add session revocation mechanism
- [ ] Implement refresh token flow

**Data Protection:**
- [ ] Enable database encryption at rest
- [ ] Implement message encryption
- [ ] Add audit logging
- [ ] Create data retention policy

**Infrastructure:**
- [ ] Set up load balancer with SSL/TLS
- [ ] Configure firewall rules
- [ ] Set up Redis for sessions
- [ ] Move uploads to cloud storage
- [ ] Configure CDN

**Monitoring:**
- [ ] Set up application monitoring
- [ ] Configure security alerts
- [ ] Implement error tracking
- [ ] Set up log aggregation

**Documentation:**
- [ ] API documentation (OpenAPI)
- [ ] Security incident response plan
- [ ] Data classification policy
- [ ] User privacy policy

---

## Status: ⚠️ STRONG FOUNDATION, REQUIRES WORKFLOW HARDENING

**Overall:** The architecture is solid with defense-in-depth principles. However, several workflow and architectural improvements are needed before production deployment.

**Estimated Effort:**
- Critical fixes: 3-5 days
- High-value improvements: 1-2 weeks
- Full production hardening: 3-4 weeks

---

*Architecture Review Completed: 2025-12-05*
