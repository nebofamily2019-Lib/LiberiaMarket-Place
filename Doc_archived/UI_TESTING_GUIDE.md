# 🎯 Interactive UI Testing Guide

## 🌐 Step-by-Step Testing Instructions

**Frontend URL:** http://localhost:5173
**Backend URL:** http://localhost:5000

---

## TEST 1: Browse Products (Guest User) 🛍️

### Steps:
1. Open http://localhost:5173 in your browser
2. You should see the **Home page** with:
   - Liberian flag emoji 🇱🇷
   - "Liberia Marketplace" title
   - "Buy & Sell Anything, Anywhere in Liberia"
   - Featured products carousel
3. Click **"Browse as Guest"** button

### ✅ What to Verify:
- [ ] Home page loads without errors
- [ ] Featured products display (should see 6 products)
- [ ] Products show **both USD and LRD prices**
- [ ] Navigation buttons work
- [ ] Design uses Liberian colors (Red, White, Blue)

### Expected Result:
```
Product Example:
Title: 2008 Toyota Corolla
Price: $6,052.63 USD
       L$1,150,000 LRD
Location: 📍 Monrovia
```

---

## TEST 2: Search & Filter Products 🔍

### Steps:
1. On the Products page, look for the **search bar**
2. Type: **"phone"** or **"Samsung"**
3. Press Enter or click search
4. Try filtering by **category** (e.g., "Electronics")

### ✅ What to Verify:
- [ ] Search returns relevant results
- [ ] Category filter works
- [ ] All products show **dual currency** (USD/LRD)
- [ ] Product cards display:
  - Product image (or placeholder)
  - Title
  - Price in both currencies
  - Location
  - Category badge with color

---

## TEST 3: View Product Details 📱

### Steps:
1. Click on any product card
2. View the full product details page

### ✅ What to Verify:
- [ ] Product title and description
- [ ] **Price in both USD and LRD** (prominent display)
- [ ] Product condition (New/Used/Refurbished)
- [ ] Location with 📍 icon
- [ ] Category badge with color
- [ ] Seller information (name, phone)
- [ ] Product images (if uploaded)
- [ ] Action buttons:
  - "Make Offer" button
  - "Contact Seller" button
- [ ] Back button works

---

## TEST 4: User Registration 📝

### Steps:
1. Click **"Start Selling Now"** or navigate to Register
2. Fill in the registration form:
   ```
   Name: John Doe
   Phone: 886123456
   Email: john@example.com
   Password: MySecure#Pass123
   Confirm Password: MySecure#Pass123
   Roles: ✅ Buyer  ✅ Seller
   ```
3. Click **"Register"**

### ✅ What to Verify:
- [ ] Phone validation works:
  - Must be exactly 9 digits
  - Must start with valid prefix (77, 76, 88, 86, 87, 55, 44, 33, 22)
  - Format shows as +231 XXX XXX XXX
- [ ] Password strength indicator appears
- [ ] Password validation rejects weak passwords:
  - ❌ Sequential characters (abc, 123)
  - ❌ Too short
  - ✅ Strong: Mix of upper, lower, numbers, symbols
- [ ] Registration succeeds
- [ ] Redirected to Dashboard
- [ ] Welcome message: "Welcome, John Doe! 👋"

### Test Cases:
```
✅ Valid Phones:
- 886123456 (Lonestar)
- 776234567 (Orange)
- 880000000 (MTN)

❌ Invalid Phones:
- 123456789 (wrong prefix)
- 88612345 (too short)
- 88612345678 (too long)
```

---

## TEST 5: User Login 🔐

### Steps:
1. If logged in, click **Logout** first
2. Click **"Login to Account"**
3. Enter credentials:
   ```
   Phone: 886123456
   Password: MySecure#Pass123
   ```
4. Click **"Login"**

### ✅ What to Verify:
- [ ] Login succeeds
- [ ] Redirected to Dashboard
- [ ] User name displays in header/dashboard
- [ ] Session persists (refresh page → still logged in)
- [ ] Error handling for wrong credentials

---

## TEST 6: Dashboard Features 📊

### For Sellers:
1. Login as a user with "seller" role
2. View Dashboard

### ✅ What to Verify:
- [ ] Stats display:
  - My Products count
  - Active Listings
  - Pending Products
  - Total Views
- [ ] Quick navigation buttons:
  - 🛍️ Products
  - 💬 Messages
  - 📦 My Products
  - ➕ Add Product
- [ ] Recent products list
- [ ] Received offers section
- [ ] All monetary values show **dual currency**

### For Buyers:
1. Login as a user with "buyer" role
2. View Dashboard

### ✅ What to Verify:
- [ ] Stats display:
  - Products Available
  - Categories
  - New This Week
- [ ] Quick navigation buttons
- [ ] Sent offers section
- [ ] All prices in **dual currency**

---

## TEST 7: Create Product Listing 📦

### Steps:
1. Login as **seller**
2. Navigate to **"Add Product"**
3. Fill in the form:
   ```
   Title: iPhone 13 Pro - 256GB
   Description: Excellent condition, barely used. Comes with original box and charger.
   Price: 500
   Category: Electronics
   Condition: Used - Like New
   Location: Monrovia
   ```
4. Upload images (optional but recommended)
5. Click **"Create Product"**

### ✅ What to Verify:
- [ ] All form fields work
- [ ] Category dropdown populated
- [ ] Condition dropdown works
- [ ] Image upload works (multiple images)
- [ ] Price preview shows **both USD and LRD**:
  - Example: $500 USD = L$95,000 LRD
- [ ] Product created successfully
- [ ] Redirected to product details or My Products
- [ ] Product appears in listings

---

## TEST 8: Edit & Delete Products ✏️

### Steps:
1. Go to **"My Products"**
2. Find a product you own
3. Click **"Edit"** button
4. Modify the title or price
5. Save changes

### Test Delete:
6. Click **"Delete"** button
7. Confirm deletion

### ✅ What to Verify:
- [ ] Only product owner sees Edit/Delete buttons
- [ ] Edit form pre-fills with current data
- [ ] Changes save successfully
- [ ] **Dual currency** updates after price change
- [ ] Delete requires confirmation
- [ ] Product removed after deletion
- [ ] Cannot edit/delete others' products

---

## TEST 9: Messaging System 💬

### Steps:
1. Login as **Buyer**
2. View a product (not your own)
3. Click **"Contact Seller"** button
4. Type message: "Hi, is this item still available?"
5. Click Send

### Switch to Seller:
6. Logout and login as the **Seller**
7. Go to **"Messages"** page
8. You should see the new conversation
9. Click on it to open
10. Reply: "Yes, it's available!"

### Back to Buyer:
11. Logout and login as **Buyer**
12. Check Messages for seller's reply

### ✅ What to Verify:
- [ ] Conversation created successfully
- [ ] Message appears in conversation
- [ ] Both users can see messages
- [ ] Unread count updates (badge on Messages icon)
- [ ] Messages show timestamp
- [ ] Real-time updates (if socket.io working)
- [ ] Conversation shows product details
- [ ] Cannot message yourself

---

## TEST 10: Make & Manage Offers 💰

### As Buyer:
1. Login as **Buyer**
2. View a product
3. Click **"Make Offer"** button
4. Fill in offer details:
   ```
   Offer Amount: 450 (if product is $500)
   Message: Would you accept $450 for this iPhone?
   ```
5. Submit offer

### ✅ What to Verify - Offer Creation:
- [ ] Offer modal opens
- [ ] Can enter amount and message
- [ ] Shows **dual currency** preview:
  - $450 USD = L$85,500 LRD
- [ ] Offer created successfully
- [ ] Success message appears

### View Sent Offers:
6. Go to **Dashboard**
7. Scroll to **"My Offers"** section

### ✅ What to Verify - Sent Offers:
- [ ] Offer appears in list
- [ ] Shows product details
- [ ] Shows **offer amount in USD and LRD**
- [ ] Shows offer message
- [ ] Shows status: "Pending"
- [ ] Offer card displays nicely

---

### As Seller:
8. Logout and login as **Seller**
9. Go to **Dashboard**
10. Scroll to **"Received Offers"** section

### ✅ What to Verify - Received Offers:
- [ ] Offer appears in list
- [ ] Shows buyer information
- [ ] Shows product details
- [ ] Shows **offer amount in USD and LRD**
- [ ] Shows offer message
- [ ] Shows action buttons:
  - ✅ Accept
  - ❌ Reject
  - 💬 Counter Offer (if implemented)

### Test Accept Offer:
11. Click **"Accept"** button
12. Confirm acceptance

### ✅ What to Verify - After Accept:
- [ ] Offer status changes to "Accepted"
- [ ] Status updates for both buyer and seller
- [ ] Notification appears (if implemented)
- [ ] Color changes (green for accepted)

---

## TEST 11: Dual Currency Display 💵

### Test on ALL these pages:

#### Products Page:
- [ ] Browse page shows both currencies on each card
- [ ] Format: $XXX USD / L$XX,XXX LRD

#### Product Details:
- [ ] Price section prominently shows both currencies
- [ ] Format clear and readable

#### Offer Creation:
- [ ] Offer modal shows conversion preview
- [ ] Updates as you type the amount

#### Offers List (Dashboard):
- [ ] Sent offers show both currencies
- [ ] Received offers show both currencies

#### My Products:
- [ ] Product list shows both currencies

### ✅ Verify Conversion Rate:
```
1 USD = 190 LRD

Examples:
$50 USD = L$9,500 LRD
$100 USD = L$19,000 LRD
$250 USD = L$47,500 LRD
$500 USD = L$95,000 LRD
$1,000 USD = L$190,000 LRD
```

---

## TEST 12: Mobile Responsiveness 📱

### Steps:
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select different devices:
   - iPhone 12 Pro
   - Samsung Galaxy S20
   - iPad
4. Test all features on mobile view

### ✅ What to Verify:
- [ ] Hamburger menu works on mobile
- [ ] All pages are readable on small screens
- [ ] Buttons are touch-friendly
- [ ] Images scale properly
- [ ] Forms are usable on mobile
- [ ] Navigation is easy
- [ ] No horizontal scrolling issues

---

## TEST 13: Security Features 🔒

### Test Protected Routes:
1. **Logout** completely
2. Try to access these URLs directly:
   - http://localhost:5173/dashboard
   - http://localhost:5173/products/add
   - http://localhost:5173/my-products
   - http://localhost:5173/messages

### ✅ What to Verify:
- [ ] Redirected to Login page
- [ ] Cannot access protected routes without login
- [ ] Session expires after logout

### Test Ownership Protection:
3. Login as User A
4. Note the URL of a product created by User B
5. Try to edit User B's product

### ✅ What to Verify:
- [ ] Cannot edit others' products
- [ ] Edit button not visible on others' products
- [ ] Cannot delete others' products

### Test XSS Protection:
6. Try creating a product with title:
   ```
   <script>alert('XSS')</script>
   ```

### ✅ What to Verify:
- [ ] Script doesn't execute
- [ ] Input is sanitized
- [ ] Displays as text, not code

---

## 🎯 Final Checklist

After completing all tests above:

- [ ] All 11 major tests passed
- [ ] No console errors in browser DevTools
- [ ] Dual currency displays correctly everywhere
- [ ] Liberian phone validation works
- [ ] All features work on mobile
- [ ] Security measures in place
- [ ] User experience is smooth
- [ ] Performance is acceptable

---

## 📸 Take Screenshots

Take screenshots of:
1. Home page with featured products
2. Products browsing page
3. Product details with dual currency
4. Dashboard (buyer and seller views)
5. Messages page with conversation
6. Offers page showing sent/received offers
7. Mobile view of key pages

---

## 🐛 If You Find Issues

Document any bugs using this format:

```
BUG REPORT #X
--------------
Feature: [e.g., Product Creation]
Severity: [High/Medium/Low]

Steps to Reproduce:
1.
2.
3.

Expected: [What should happen]
Actual: [What happened]

Screenshot: [If applicable]
Browser: [Chrome/Firefox/etc]
```

---

## ✅ Success!

When all tests pass, you'll have a fully functional MVP with:
- ✅ User registration & authentication
- ✅ Product listings with images
- ✅ Search and category filtering
- ✅ Messaging between users
- ✅ Offer management system
- ✅ **Dual currency (USD/LRD) throughout**
- ✅ **Liberian phone validation**
- ✅ Mobile responsive design
- ✅ Security measures

**Ready for deployment! 🚀🇱🇷**
