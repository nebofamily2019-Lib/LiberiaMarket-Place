# 🚀 Quick Test Reference Card

## 🌐 URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health**: http://localhost:5000/health

---

## 👤 Test User Accounts

### Create These Users:

**Buyer Account:**
```
Name: John Buyer
Phone: 886123456
Email: buyer@test.com
Password: Secure#Buyer123
Roles: ✅ Buyer
```

**Seller Account:**
```
Name: Jane Seller
Phone: 776234567
Email: seller@test.com
Password: Secure#Seller123
Roles: ✅ Seller
```

**Dual Role Account:**
```
Name: Alex Trader
Phone: 880123456
Email: trader@test.com
Password: Secure#Trader123
Roles: ✅ Buyer ✅ Seller
```

---

## 📱 Valid Liberian Phone Numbers

```
✅ 886123456 (Lonestar - 88)
✅ 776234567 (Orange - 77)
✅ 880000000 (MTN - 88)
✅ 770000000 (Orange - 77)
✅ 555123456 (Novafone - 55)

Valid Prefixes: 77, 76, 88, 86, 87, 55, 44, 33, 22
Format: 9 digits (no country code in form)
Display: +231 XXX XXX XXX
```

---

## 💵 Currency Conversion (1 USD = 190 LRD)

```
$50 USD   = L$9,500 LRD
$100 USD  = L$19,000 LRD
$250 USD  = L$47,500 LRD
$500 USD  = L$95,000 LRD
$1,000 USD = L$190,000 LRD
```

---

## 📦 Sample Product Data

**Product 1:**
```
Title: iPhone 13 Pro - 256GB
Description: Excellent condition, barely used. Original box.
Price: 500
Category: Electronics
Condition: Used - Like New
Location: Monrovia
```

**Product 2:**
```
Title: Samsung 55" Smart TV
Description: Brand new 4K Smart TV, sealed in box.
Price: 350
Category: Electronics
Condition: New
Location: Paynesville
```

**Product 3:**
```
Title: Modern Sofa Set
Description: 3-seater sofa with 2 armchairs. Good condition.
Price: 200
Category: Furniture
Condition: Used - Good
Location: Congo Town
```

---

## 💬 Sample Messages

**Buyer to Seller:**
```
1. "Hi, is this item still available?"
2. "Can we meet in Monrovia for inspection?"
3. "What's your best price for this?"
```

**Seller to Buyer:**
```
1. "Yes, it's available! When would you like to see it?"
2. "Sure, we can meet at Broad Street."
3. "The price is firm, but I can throw in the accessories."
```

---

## 💰 Sample Offers

**Product Price: $500**
```
Offer 1: $450 - "Would you accept $450?"
Offer 2: $425 - "My final offer is $425 cash."
Counter: $475 - "I can do $475, that's my lowest."
```

---

## ✅ Quick Test Sequence (15 minutes)

1. **Browse Products** (2 min)
   - Open homepage → Browse as guest
   - Check dual currency on products

2. **Register** (2 min)
   - Create seller account
   - Verify phone validation

3. **Create Product** (3 min)
   - Add new product
   - Upload image
   - Check dual currency display

4. **Register Buyer** (2 min)
   - Create buyer account in new incognito window

5. **Make Offer** (2 min)
   - Buyer makes offer on seller's product
   - Check dual currency in offer

6. **Messaging** (2 min)
   - Buyer messages seller
   - Seller replies

7. **Accept Offer** (2 min)
   - Seller accepts buyer's offer
   - Check status updates

---

## 🎯 Critical Checks

### Everywhere You See Prices:
- [ ] Shows both USD and LRD
- [ ] Conversion is accurate (1:190)
- [ ] Format is consistent

### Every Form With Phone:
- [ ] Validates 9 digits
- [ ] Validates prefixes
- [ ] Shows +231 in display

### Every Protected Page:
- [ ] Requires login
- [ ] Respects ownership
- [ ] Shows appropriate actions

---

## 🐛 Common Issues to Check

1. **Phone Input:**
   - ❌ Accepts invalid prefixes
   - ❌ Accepts wrong length
   - ✅ Should reject 999XXXXXX

2. **Currency:**
   - ❌ Shows only USD
   - ❌ Wrong conversion rate
   - ✅ Should show both currencies

3. **Security:**
   - ❌ Can edit others' products
   - ❌ Can access without login
   - ✅ Should block unauthorized access

4. **Mobile:**
   - ❌ Horizontal scroll
   - ❌ Buttons too small
   - ✅ Should be fully responsive

---

## 📊 Test Coverage

### Must Test:
- [x] Browse products
- [x] Search products
- [x] Register with Liberian phone
- [x] Login
- [x] Create product
- [x] View product details
- [x] Send message
- [x] Make offer
- [x] Accept/reject offer
- [x] Dual currency display
- [x] Mobile responsive

### Backend Status:
✅ Server running on port 5000
✅ Database connected
✅ Socket.io enabled
✅ 11 products in database
✅ 9 categories available

---

## 🎉 Success Criteria

✅ All features work without errors
✅ Dual currency displays everywhere
✅ Liberian phone validation works
✅ Mobile responsive
✅ Security measures active
✅ No critical bugs

**When all checked → MVP is READY! 🚀🇱🇷**
