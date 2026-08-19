# 🔴 LIVE TESTING SESSION

**Status**: ✅ Backend Running | ✅ Frontend Running | ✅ Ready to Test

---

## 🎯 Start Here

### Step 1: Open Frontend
👉 **http://localhost:5173**

### Step 2: Follow This Sequence

---

## TEST 1: Browse Products (1 minute) 🛍️

**Actions:**
1. Look at the home page
2. Click "Browse as Guest"
3. Scroll through products

**What to Check:**
- [ ] See 11 products
- [ ] Each product shows **TWO prices** (USD and LRD)
- [ ] Example: "$250 USD" and "L$47,500 LRD"
- [ ] Product images load
- [ ] Categories show with colored badges

**✅ If you see dual prices → PASS**
**❌ If only one currency → Tell me immediately**

---

## TEST 2: Register Account (2 minutes) 📝

**Actions:**
1. Click "Start Selling Now" or find Register button
2. Fill in form with these **exact values**:

```
Name: Jane Seller
Phone: 776234567
Email: seller@test.com
Password: MySecure#Pass123
Confirm Password: MySecure#Pass123
Roles: ✅ Check both "Buyer" and "Seller"
```

3. Click Register

**What to Check:**
- [ ] Phone field accepts 776234567 (9 digits)
- [ ] Password strength indicator appears
- [ ] Registration succeeds
- [ ] Redirected to Dashboard
- [ ] See "Welcome, Jane Seller! 👋"

**⚠️ If Registration Fails:**
- Tell me the error message
- I'll check the backend logs

**💡 Backend Should Log:**
```
✅ User registered successfully
✅ POST /api/auth/register
```

---

## TEST 3: Create Product (3 minutes) 📦

**Actions:**
1. From Dashboard, click "Add Product" or "➕"
2. Fill in:

```
Title: iPhone 13 Pro - 256GB
Description: Excellent condition, original box and charger included.
Price: 500
Category: Electronics (select from dropdown)
Condition: Used - Like New (select from dropdown)
Location: Monrovia
```

3. **Optional but recommended**: Upload an image
4. Click "Create Product"

**What to Check:**
- [ ] Form validates (all fields required)
- [ ] Category dropdown has 9 options
- [ ] Condition dropdown works
- [ ] Price preview shows:
  - **$500 USD**
  - **L$95,000 LRD**
- [ ] Product created successfully
- [ ] Redirected to product page or My Products

**💡 Backend Should Log:**
```
✅ Product created successfully
✅ POST /api/products
```

---

## TEST 4: View Your Product (1 minute) 👁️

**Actions:**
1. Go to "My Products" (from menu or Dashboard)
2. Find your iPhone product
3. Click on it to view details

**What to Check:**
- [ ] Product title shows: "iPhone 13 Pro - 256GB"
- [ ] Price section shows **BOTH**:
  - $500 USD (big and bold)
  - L$95,000 LRD (below or next to USD)
- [ ] Description is there
- [ ] Location shows 📍 Monrovia
- [ ] Category badge: "📱 Electronics"
- [ ] You see "✏️ Edit" and "🗑️ Delete" buttons (you own it)

**✅ If dual currency displays → PASS**

---

## TEST 5: Register Buyer (2 minutes) 👤

**Important:** Open a **NEW INCOGNITO/PRIVATE WINDOW**

**Actions:**
1. Go to http://localhost:5173 (in incognito)
2. Click Register
3. Fill in:

```
Name: John Buyer
Phone: 886123456
Email: buyer@test.com
Password: MySecure#Buyer123
Confirm Password: MySecure#Buyer123
Roles: ✅ Check "Buyer" only
```

4. Click Register

**What to Check:**
- [ ] Different phone number works (886123456)
- [ ] Registration succeeds
- [ ] Logged in as John Buyer

**💡 Backend Should Log:**
```
✅ User registered successfully
✅ POST /api/auth/register
```

---

## TEST 6: Make Offer (3 minutes) 💰

**Actions (as John Buyer):**
1. Click "Browse Products" or "Products"
2. Find the iPhone you created (as Jane Seller)
3. Click on it
4. Click "💰 Make Offer" button
5. Fill in:

```
Offer Amount: 450
Message: Would you accept $450 for this iPhone?
```

6. Submit offer

**What to Check:**
- [ ] Offer modal opens
- [ ] Shows conversion preview:
  - **$450 USD**
  - **L$85,500 LRD**
- [ ] Offer submitted successfully
- [ ] Success toast/message appears

**Then Check Dashboard:**
7. Go to Dashboard
8. Scroll to "💰 My Offers" section

**What to Check:**
- [ ] Offer appears in list
- [ ] Shows iPhone product
- [ ] Shows **$450 USD / L$85,500 LRD**
- [ ] Shows status: "Pending"
- [ ] Shows your message

**💡 Backend Should Log:**
```
✅ Offer created successfully
✅ POST /api/offers
```

---

## TEST 7: Accept Offer (2 minutes) ✅

**Actions (switch back to Jane Seller):**
1. Go to your original window (or login as seller@test.com)
2. Go to Dashboard
3. Scroll to "💼 Received Offers" section

**What to Check:**
- [ ] See offer from John Buyer
- [ ] Shows iPhone product
- [ ] Shows **$450 USD / L$85,500 LRD**
- [ ] Shows John's message
- [ ] See "✅ Accept" and "❌ Reject" buttons

**Actions:**
4. Click "✅ Accept"
5. Confirm

**What to Check:**
- [ ] Status changes to "Accepted"
- [ ] Color changes (probably green)
- [ ] Success message appears

**💡 Backend Should Log:**
```
✅ Offer accepted
✅ PUT /api/offers/:id/accept
```

---

## TEST 8: Messaging (3 minutes) 💬

**Actions (as John Buyer):**
1. Go back to the iPhone product page
2. Click "📞 Contact Seller" button
3. Type: "Hi Jane! Is this still available?"
4. Click Send

**What to Check:**
- [ ] Message sent successfully
- [ ] Opens conversation view
- [ ] Message appears in chat

**Actions (as Jane Seller):**
5. Switch to seller account
6. Click "Messages" in menu
7. Should see conversation with John

**What to Check:**
- [ ] Conversation appears in list
- [ ] Shows unread badge/count
- [ ] Click on it to open
8. Reply: "Yes John, it's available!"

**Back to John:**
9. Refresh or check Messages
10. Should see Jane's reply

**What to Check:**
- [ ] Messages appear for both users
- [ ] Timestamps show
- [ ] Conversation thread works

**💡 Backend Should Log:**
```
✅ Conversation created
✅ Message sent
✅ POST /api/messages/conversations
✅ POST /api/messages/:id
```

---

## 🎯 Final Verification Checklist

After completing all tests:

- [ ] ✅ Dual currency displays on ALL pages
- [ ] ✅ Liberian phone validation works (9 digits, valid prefix)
- [ ] ✅ Products can be created
- [ ] ✅ Offers can be made and accepted
- [ ] ✅ Messaging works
- [ ] ✅ Dashboard shows correct stats
- [ ] ✅ No console errors (press F12 → Console tab)
- [ ] ✅ Mobile view works (Ctrl+Shift+M)

---

## 📊 What I'm Monitoring

I'm watching the backend logs for:
- ✅ Successful API calls
- ❌ Errors or failures
- 📥 User registrations
- 📦 Product creations
- 💰 Offers made/accepted
- 💬 Messages sent

**Just tell me after each test:**
- "Test 1 passed" or "Test 1 failed - [error]"
- I'll check the logs and help debug!

---

## 🐛 If Something Fails

**Tell me:**
1. Which test failed
2. What error message you see
3. What you expected to happen

**I'll:**
1. Check the backend logs
2. Tell you exactly what went wrong
3. Help you fix it

---

## 🚀 Ready? Let's Go!

👉 **Open http://localhost:5173 and start with TEST 1!**

I'm monitoring the logs in real-time. Just let me know as you progress through each test! 🎯
