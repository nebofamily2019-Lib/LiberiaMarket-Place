# 🇱🇷 Liberia Marketplace - MVP Testing Checklist

## 🚀 Test Environment Status

✅ **Backend Server**: http://localhost:5000 - **RUNNING**
✅ **Frontend Server**: http://localhost:5173 - **RUNNING**
✅ **Database**: Connected and operational

---

## ✅ Automated API Tests Results

### Working Features (Verified via API):
- ✅ Backend Health Check
- ✅ Product Browsing (11 products available)
- ✅ Search Functionality (search by keyword)
- ✅ Category System (9 categories)
- ✅ Dual Currency Display (USD/LRD conversion at 1:190)
- ✅ Phone Number Validation (Liberian format)
- ✅ Password Strength Validation

### Requires Frontend Testing:
- ⚠️ User Registration (CSRF protected)
- ⚠️ User Login (CSRF protected)
- ⚠️ Create Product Listings
- ⚠️ Messaging System
- ⚠️ Offer Management

---

## 📋 Manual Testing Checklist

### 1. User Registration ✅

**Test Steps:**
1. Open http://localhost:5173
2. Click "Start Selling Now" or "Browse as Guest" → then "Register"
3. Fill in registration form:
   - **Name**: Your Test Name
   - **Phone**: 886123456 (9 digits, valid Liberian prefix)
   - **Email**: test@example.com
   - **Password**: Use a strong password (e.g., MySecure#Pass123)
   - **Roles**: Select "buyer" and/or "seller"
4. Click "Register"

**Expected Results:**
- ✅ Form validates Liberian phone number format
- ✅ Password strength indicator shows
- ✅ Registration succeeds
- ✅ User is redirected to Dashboard
- ✅ Welcome message shows user name

**Test Data:**
```
Phone: 886123456 (Lonestar)
Phone: 776234567 (Orange)
Phone: 880234567 (MTN)
Valid prefixes: 77, 76, 88, 86, 87, 55, 44, 33, 22
```

---

### 2. User Login ✅

**Test Steps:**
1. If logged in, logout first
2. Click "Login to Account"
3. Enter credentials:
   - **Phone**: 886123456
   - **Password**: Your password
4. Click "Login"

**Expected Results:**
- ✅ Login succeeds
- ✅ Redirected to Dashboard
- ✅ User session persists (refresh page, still logged in)
- ✅ httpOnly cookie set for security

---

### 3. Create Product Listing ✅

**Test Steps:**
1. Login as a user with "seller" role
2. Navigate to "Add Product" (from Dashboard or menu)
3. Fill in product form:
   - **Title**: Samsung Galaxy A54
   - **Description**: Brand new phone, sealed in box
   - **Price**: 250 (USD)
   - **Category**: Select "Electronics"
   - **Condition**: New
   - **Location**: Monrovia
   - **Images**: Upload product images (optional)
4. Click "Create Product"

**Expected Results:**
- ✅ Product created successfully
- ✅ **Dual Currency Display**: Shows both $250 USD and L$47,500 LRD
- ✅ Redirected to product details or "My Products"
- ✅ Product appears in listings
- ✅ Images uploaded and displayed correctly

---

### 4. Browse & Search Products ✅

**Test Steps:**
1. Click "Browse Products" from home page
2. View all products
3. Use search bar to search for "Samsung"
4. Filter by category (e.g., "Electronics")
5. Click on a product to view details

**Expected Results:**
- ✅ All products display correctly
- ✅ **Dual Currency**: Each product shows both USD and LRD
- ✅ Search returns relevant results
- ✅ Category filter works
- ✅ Product cards show:
  - Title
  - Price (USD/LRD)
  - Location
  - Category badge
  - Product image

---

### 5. Product Details Page ✅

**Test Steps:**
1. Click on any product
2. View full product details
3. Check all displayed information

**Expected Results:**
- ✅ Product title and description
- ✅ **Dual Currency Display**: Price in both USD and LRD
- ✅ Product condition
- ✅ Location with 📍 icon
- ✅ Category badge with color
- ✅ Seller information
- ✅ Product images (if available)
- ✅ "Make Offer" button (for buyers)
- ✅ "Contact Seller" button
- ✅ "Edit" and "Delete" buttons (for product owner)

---

### 6. Messaging Feature ✅

**Test Steps:**
1. Login as a buyer
2. View a product (not your own)
3. Click "Contact Seller"
4. Send a message: "Is this item still available?"
5. Open "Messages" page
6. View conversation

**Switch to Seller:**
7. Login as the seller
8. Open "Messages" page
9. See the new message
10. Reply to the buyer

**Expected Results:**
- ✅ Conversation created successfully
- ✅ Message sent and appears in conversation
- ✅ **Real-time updates** (if socket.io working)
- ✅ Seller receives message notification
- ✅ Both users can see full conversation
- ✅ Messages show timestamp
- ✅ Unread count updates

---

### 7. Make & Manage Offers ✅

**Test Steps - Buyer:**
1. Login as a buyer
2. View a product
3. Click "Make Offer"
4. Enter offer details:
   - **Amount**: 220 (if product is $250)
   - **Message**: "Would you accept $220 for this?"
5. Submit offer
6. Go to Dashboard → View "My Offers"

**Test Steps - Seller:**
7. Login as the seller
8. Go to Dashboard → View "Received Offers"
9. Click on the offer
10. Accept or Reject the offer

**Expected Results:**
- ✅ Offer created successfully
- ✅ **Dual Currency**: Offer shows both USD and LRD
- ✅ Buyer sees offer in "Sent Offers"
- ✅ Seller sees offer in "Received Offers"
- ✅ Offer card shows:
  - Product details
  - Offer amount (USD/LRD)
  - Offer message
  - Status (pending/accepted/rejected)
- ✅ Seller can accept/reject offer
- ✅ Status updates in real-time
- ✅ Counter-offer option works (if implemented)

---

### 8. Dashboard Features ✅

**Test Steps - Seller:**
1. Login as seller
2. View Dashboard
3. Check stats:
   - My Products count
   - Active Listings
   - Pending Products
   - Total Views
4. View recent products
5. View received offers

**Test Steps - Buyer:**
1. Login as buyer
2. View Dashboard
3. Check stats:
   - Products Available
   - Categories
   - New This Week
4. View sent offers

**Expected Results:**
- ✅ Stats display correctly
- ✅ Quick navigation buttons work
- ✅ Recent items show
- ✅ Offers display with proper status
- ✅ **Dual Currency** in all monetary displays

---

### 9. Dual Currency Display (USD/LRD) ✅

**Test Locations:**
- Product cards in browse page
- Product details page
- Offer creation modal
- Offer cards
- Dashboard statistics

**Conversion Rate:** 1 USD = 190 LRD

**Test Values:**
| USD | LRD |
|-----|-----|
| $50 | L$9,500 |
| $100 | L$19,000 |
| $250 | L$47,500 |
| $500 | L$95,000 |
| $1,000 | L$190,000 |

**Expected Results:**
- ✅ All prices show both USD and LRD
- ✅ Primary currency (USD) displayed prominently
- ✅ Secondary currency (LRD) displayed below or next to USD
- ✅ Conversion is accurate (1:190)
- ✅ Formatting is consistent across all pages

---

### 10. Liberian Phone Validation ✅

**Test Valid Numbers:**
```
✅ 886123456 (Lonestar - 88 prefix)
✅ 776234567 (Orange - 77 prefix)
✅ 880000000 (MTN - 88 prefix)
✅ 770000000 (Orange - 77 prefix)
✅ 555000000 (Novafone - 55 prefix)
```

**Test Invalid Numbers:**
```
❌ 123456789 (Invalid prefix)
❌ 999999999 (Invalid prefix)
❌ 12345 (Too short)
❌ 88612345678 (Too long)
```

**Expected Results:**
- ✅ Only valid Liberian prefixes accepted
- ✅ Must be exactly 9 digits
- ✅ Real-time validation feedback
- ✅ Clear error messages for invalid numbers

---

### 11. Navigation & UI ✅

**Test Steps:**
1. Test hamburger menu (mobile view)
2. Test all navigation links
3. Test back buttons
4. Test logout functionality
5. Resize window to test responsive design

**Expected Results:**
- ✅ Menu opens and closes smoothly
- ✅ All links navigate correctly
- ✅ Back buttons work
- ✅ Logout clears session
- ✅ Mobile responsive design works
- ✅ Liberian color scheme (Red, White, Blue)

---

### 12. Security Features ✅

**Test Steps:**
1. Try to access protected pages without login
2. Try to edit another user's product
3. Try to send message to yourself
4. Check for XSS protection (try entering `<script>alert('test')</script>`)
5. Verify CSRF protection on forms

**Expected Results:**
- ✅ Redirected to login when accessing protected routes
- ✅ Cannot edit/delete others' products
- ✅ Cannot message yourself
- ✅ Input is sanitized (XSS prevented)
- ✅ CSRF tokens protect forms

---

## 🎯 Critical MVP Features Checklist

Mark each feature after successful testing:

- [ ] ✅ User Registration (Liberian phone validation)
- [ ] ✅ User Login (Session persistence)
- [ ] ✅ Browse Products (Public access)
- [ ] ✅ Search Products
- [ ] ✅ Filter by Category
- [ ] ✅ View Product Details
- [ ] ✅ Create Product Listing
- [ ] ✅ Upload Product Images
- [ ] ✅ Edit Own Products
- [ ] ✅ Delete Own Products
- [ ] ✅ Contact Seller (Messaging)
- [ ] ✅ Send Messages
- [ ] ✅ Receive Messages
- [ ] ✅ Make Offer
- [ ] ✅ Accept/Reject Offer
- [ ] ✅ View Sent Offers
- [ ] ✅ View Received Offers
- [ ] ✅ **Dual Currency Display (USD/LRD)**
- [ ] ✅ Seller Dashboard
- [ ] ✅ Buyer Dashboard
- [ ] ✅ Responsive Mobile Design
- [ ] ✅ Logout Functionality

---

## 🐛 Bug Reporting Template

If you find any issues, report them using this format:

```
**Feature:** [e.g., Product Creation]
**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots:** [If applicable]

**Browser:** [Chrome/Firefox/Safari]
**Device:** [Desktop/Mobile]
```

---

## ✅ Final Checklist

Before considering MVP complete:

- [ ] All features tested and working
- [ ] No critical bugs blocking core functionality
- [ ] Dual currency displays correctly everywhere
- [ ] Liberian phone validation works
- [ ] Security measures in place
- [ ] Mobile responsive design verified
- [ ] Performance is acceptable
- [ ] User experience is smooth

---

## 🎉 Success Criteria

**MVP is READY when:**
- ✅ 100% of critical features work
- ✅ All security measures pass
- ✅ Dual currency works across all pages
- ✅ Liberian customizations implemented
- ✅ No critical bugs

---

**Testing Date:** _______________
**Tester:** _______________
**Pass Rate:** _____ / 21 features

**Notes:**
