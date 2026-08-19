# 🇱🇷 LibMarket - Liberia Community Marketplace (MVP)

> A Facebook Marketplace-inspired e-commerce platform designed specifically for the Liberian market, featuring dual currency support (LRD/USD), mobile-first design, and accessibility features for low-literacy users.

**Version:** 2.0.0-mvp
**Status:** MVP - Facebook Marketplace Feature Parity
**Target Market:** Liberia 🇱🇷

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Liberian Market Customizations](#-liberian-market-customizations)
- [User Flows](#-user-flows)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### Core MVP Features (Facebook Marketplace Aligned)

#### 1. User Authentication & Profiles
- ✅ Register with phone number or email
- ✅ Liberian phone number validation (+231 format)
- ✅ Secure password with strength validation
- ✅ Login/logout with JWT authentication
- ✅ Basic user profiles (name, phone, location)
- ✅ Role system (buyer, seller, or both)

#### 2. Product Listings
- ✅ Create product listings with 2-3 images
- ✅ Edit and delete own products
- ✅ Product fields: title, description, price, category, location, condition
- ✅ Product status management (active, sold, inactive)
- ✅ Image upload with security validation
- ✅ Dual currency display (Liberian Dollar & USD)

#### 3. Search & Discovery
- ✅ Search products by keyword (title/description)
- ✅ Filter by category (19 predefined categories)
- ✅ Filter by location (Liberia-specific)
- ✅ Sort by newest/oldest
- ✅ Browse all active listings
- ✅ View product details

#### 4. Categories
- ✅ 19 predefined categories:
  - Electronics & Gadgets
  - Fashion & Apparel
  - Home & Furniture
  - Vehicles & Parts
  - Real Estate
  - Food & Agriculture
  - Health & Beauty
  - Sports & Fitness
  - Books & Education
  - Baby & Kids
  - Tools & Equipment
  - Pets & Animals
  - Arts & Crafts
  - Music & Instruments
  - Services
  - Jobs & Employment
  - Events & Tickets
  - Mobile Phones
  - Computers & Laptops

#### 5. Buyer-Seller Messaging
- ✅ Direct messaging between buyers and sellers
- ✅ Real-time chat powered by Socket.io
- ✅ Conversation threads per product
- ✅ Message history
- ✅ Create conversation from product page

#### 6. Simple Offers & Negotiation
- ✅ Buyers can make price offers on products
- ✅ Sellers can accept or reject offers
- ✅ View sent offers (buyer dashboard)
- ✅ View received offers (seller dashboard)
- ✅ Offer status tracking (pending, accepted, rejected)

#### 7. User Dashboard
- ✅ Seller dashboard: my products, received offers, messages
- ✅ Buyer dashboard: sent offers, messages
- ✅ Quick stats: total products, active products

---

## 🇱🇷 Liberian Market Customizations

### Dual Currency System
```javascript
// Primary: Liberian Dollar (LRD)
// Secondary: United States Dollar (USD)
// Exchange Rate: 1 USD = 190 LRD

formatDualPrice(5700)
// Output: "L$5,700 (~$30.00)"

formatLRD(5700)
// Output: "L$5,700"

formatUSD(30)
// Output: "$30.00"
```

### Liberian Flag Color Scheme
- **Primary Blue:** `#1e40af` (from flag)
- **Primary Red:** `#dc2626` (from flag)
- **Accent Gold:** `#f59e0b` (from flag stripes)
- **White:** `#FFFFFF`

### Phone Number Validation
```javascript
// Accepts Liberian mobile formats:
+231886123456  // International format
886123456      // Local 9-digit format
231886123456   // Without + prefix
```

### Mobile-First Design
- Bottom navigation for mobile users
- Large touch targets
- Optimized for low-bandwidth connections
- Responsive across all screen sizes

### Accessibility Features
- Voice search capability
- Large action buttons
- Visual-first interface
- Simple, clear navigation
- Low-literacy support

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Router:** React Router v7
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **Security:** DOMPurify (XSS protection)
- **Testing:** Vitest + React Testing Library

### Backend
- **Framework:** Express.js 4.21
- **Database:** PostgreSQL (primary) / MySQL (supported)
- **ORM:** Sequelize 6.37
- **Authentication:** JWT + bcryptjs
- **Real-time:** Socket.io 4.8
- **Security:** Helmet, CSRF, Rate Limiting, XSS Protection
- **File Upload:** Multer + Sharp
- **Logging:** Winston with daily rotation

### Security Features
- ✅ JWT authentication with httpOnly cookies
- ✅ CSRF protection
- ✅ XSS protection (helmet + DOMPurify)
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Rate limiting (auth: 5/15min, API: 100/15min)
- ✅ Input validation and sanitization
- ✅ Secure image upload with magic byte validation
- ✅ Password hashing with bcrypt

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ (or MySQL 8+)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/libmarket.git
cd libmarket
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Backend (.env)
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend (.env)
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
cd backend

# Create database (PostgreSQL)
createdb libmarket_dev

# Run migrations
npm run migrate
# Or: npx sequelize-cli db:migrate

# Seed categories
node scripts/seed-categories.js
```

5. **Start development servers**
```bash
# Terminal 1 - Backend (runs on port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (runs on port 5173)
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+231886123456",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "roles": ["buyer", "seller"]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+231886123456",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### List All Products
```http
GET /api/products?page=1&limit=20&category=electronics&location=Monrovia
```

#### Get Product Details
```http
GET /api/products/:id
```

#### Create Product (Authenticated)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "iPhone 13 Pro",
  "description": "Like new, 256GB",
  "price": 950000,
  "category_id": 1,
  "location": "Monrovia",
  "condition": "good",
  "images": [File, File]
}
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <token>
```

#### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Category Endpoints

#### List Categories
```http
GET /api/categories
```

### Messaging Endpoints

#### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

#### Create Conversation
```http
POST /api/messages/conversations
Authorization: Bearer <token>

{
  "listing_id": 123,
  "seller_id": 456
}
```

#### Get Messages
```http
GET /api/messages/conversations/:id/messages
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages/conversations/:id/messages
Authorization: Bearer <token>

{
  "content": "Is this still available?"
}
```

### Offer Endpoints

#### Create Offer
```http
POST /api/offers
Authorization: Bearer <token>

{
  "product_id": 123,
  "offer_amount": 850000,
  "message": "Can you accept this price?"
}
```

#### Get Received Offers (Seller)
```http
GET /api/offers/received
Authorization: Bearer <token>
```

#### Get Sent Offers (Buyer)
```http
GET /api/offers/sent
Authorization: Bearer <token>
```

#### Accept Offer
```http
PATCH /api/offers/:id/accept
Authorization: Bearer <token>
```

#### Reject Offer
```http
PATCH /api/offers/:id/reject
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Stats
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

---

## 👥 User Flows

### Buyer Journey

1. **Discover Products**
   - Visit home page → Browse latest listings
   - Use search bar → Find specific items
   - Filter by category/location → Narrow results
   - Click product card → View details

2. **Contact Seller**
   - On product page → Click "Message Seller"
   - Start conversation → Ask questions
   - Or → Click "Make Offer" → Submit price offer

3. **Negotiate**
   - Chat with seller in real-time
   - Seller accepts/rejects offer
   - Agree on price and meeting location

4. **Complete Transaction**
   - Coordinate pickup/delivery via messages
   - Meet in person
   - Exchange item and payment
   - (Optional: Seller marks product as sold)

### Seller Journey

1. **List Product**
   - Register/Login → Go to Dashboard
   - Click "Add Product" → Fill in details
   - Upload 2-3 photos → Select category
   - Set price in LRD → Publish listing

2. **Manage Listings**
   - Dashboard → View "My Products"
   - Edit listing → Update price/details
   - Mark as sold → Update status
   - Delete listing → Remove from marketplace

3. **Respond to Buyers**
   - Dashboard → Check "Messages"
   - Dashboard → View "Received Offers"
   - Accept/Reject offers
   - Answer buyer questions
   - Coordinate transaction

4. **Complete Sale**
   - Meet buyer at agreed location
   - Complete transaction
   - Mark product as sold in dashboard

---

## 📂 Project Structure

```
libmarket/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── messageController.js
│   │   │   └── offerController.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Conversation.js
│   │   │   ├── Message.js
│   │   │   ├── Offer.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── offers.js
│   │   │   ├── dashboard.js
│   │   │   └── health.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── inputValidation.js
│   │   │   └── secureImageUpload.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── utils/
│   │   │   └── logger.js
│   │   └── server.js
│   ├── migrations/
│   ├── scripts/
│   │   └── seed-categories.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetails.tsx
│   │   │   ├── AddProduct.tsx
│   │   │   ├── MyProducts.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── SellerProfile.tsx
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── SearchHeader.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── EnhancedSearch.tsx
│   │   │   ├── MakeOfferModal.tsx
│   │   │   ├── OfferCard.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── HamburgerMenu.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── productService.ts
│   │   │   ├── messageService.ts
│   │   │   └── offerService.ts
│   │   ├── utils/
│   │   │   └── currency.ts (Liberian LRD/USD)
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── design-tokens.css (Liberian colors)
│   │   └── App.tsx
│   └── package.json
│
├── README_MVP.md (this file)
├── MVP_REORGANIZATION_PLAN.md
├── MVP_CLEANUP_SUMMARY.md
└── package.json
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=libmarket_dev
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DIALECT=postgres

# JWT
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRE=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_CURRENCY_EXCHANGE_RATE=190
```

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing Checklist
- [ ] User can register with Liberian phone number
- [ ] User can login
- [ ] User can create product listing with images
- [ ] Products display with dual currency (LRD/USD)
- [ ] Search and category filtering works
- [ ] User can send messages to seller
- [ ] Real-time messaging works (Socket.io)
- [ ] User can make offer on product
- [ ] Seller can accept/reject offer
- [ ] Dashboard shows correct stats

---

## 🚢 Deployment

### Database Migration on Production
```bash
# Before deploying new code
cd backend
NODE_ENV=production npx sequelize-cli db:migrate
```

### Build Frontend
```bash
cd frontend
npm run build
# Output in dist/ folder
```

### Environment Setup
- Set `NODE_ENV=production` in backend
- Configure production database credentials
- Set secure `JWT_SECRET`
- Update `CLIENT_URL` to production frontend URL
- Enable HTTPS in production

---

## 🗺️ Roadmap (Post-MVP)

Features to add after market validation:

### Phase 2 (User Engagement)
- [ ] Reviews and ratings
- [ ] Favorites/wishlist
- [ ] Following sellers
- [ ] In-app notifications
- [ ] Phone number verification (OTP)

### Phase 3 (Seller Tools)
- [ ] Sales analytics dashboard
- [ ] Financial tracking
- [ ] Seller verification badges
- [ ] Multi-image support (up to 5)
- [ ] Promoted listings

### Phase 4 (Transactions)
- [ ] Mobile money integration (Lonestar MTN, Orange)
- [ ] Payment tracking
- [ ] Delivery coordination
- [ ] Transaction history

### Phase 5 (Community)
- [ ] User profiles with reputation
- [ ] Community guidelines
- [ ] Report system with moderation
- [ ] Safety tips and resources

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For support, email support@libmarket.lr or join our community chat.

---

## 🙏 Acknowledgments

- Inspired by Facebook Marketplace
- Built for the Liberian market
- Designed with accessibility and low-literacy users in mind
- Powered by modern web technologies

---

**Made with ❤️ for Liberia 🇱🇷**

