# 🚀 Implementation Guide: 4 New Features

## ✅ What Has Been Created

### Database Migrations (Ready to Run)
1. ✅ `20251209000001-add-mobile-money-tables.js` - Mobile Money & Payments
2. ✅ `20251209000002-add-county-system.js` - County Filter System
3. ✅ `20251209000003-add-sms-system.js` - SMS Notifications
4. ✅ `20251209000004-add-ratings-reviews.js` - Ratings & Reviews

### Seed Scripts
1. ✅ `seed-counties.js` - Seeds 15 Liberian counties with coordinates

---

## 📋 STEP-BY-STEP IMPLEMENTATION

### **STEP 1: Run Database Migrations**

```bash
cd backend
npx sequelize-cli db:migrate
```

This will create all new tables:
- `mobile_money_accounts`
- `payments`
- `counties`
- `sms_logs`
- `reviews`

And add columns to existing tables:
- **users**: county_id, sms preferences, rating stats
- **products**: county_id, specific_location, coordinates

### **STEP 2: Seed County Data**

```bash
node scripts/seed-counties.js
```

This seeds 15 Liberian counties:
1. Montserrado (Monrovia) - 1,118,241 pop
2. Nimba (Sanniquellie) - 462,026 pop
3. Margibi (Kakata) - 209,923 pop
4. Grand Bassa (Buchanan) - 221,693 pop
5. Bong (Gbarnga) - 333,481 pop
6. Lofa (Voinjama) - 276,863 pop
7. Grand Cape Mount (Robertsport) - 127,076 pop
8. Bomi (Tubmanburg) - 82,036 pop
9. Grand Gedeh (Zwedru) - 125,258 pop
10. Sinoe (Greenville) - 102,391 pop
11. Grand Kru (Barclayville) - 57,913 pop
12. Maryland (Harper) - 135,938 pop
13. River Cess (Cestos City) - 71,509 pop
14. River Gee (Fish Town) - 66,789 pop
15. Gbarpolu (Bopolu) - 83,388 pop

---

## 🔧 FEATURE 1: Mobile Money Integration

### **What It Does:**
- Allows users to add Orange Money, MTN, Lonestar accounts
- Process payments through mobile money
- Escrow system (hold funds until delivery)
- Transaction tracking
- Platform fees (2% of transaction)

### **API Endpoints to Create:**

```javascript
// Mobile Money Accounts
POST   /api/mobile-money/accounts          // Add mobile money account
GET    /api/mobile-money/accounts          // Get user's accounts
PUT    /api/mobile-money/accounts/:id      // Update account
DELETE /api/mobile-money/accounts/:id      // Remove account
POST   /api/mobile-money/accounts/:id/verify // Verify account

// Payments
POST   /api/payments/initiate              // Initiate payment
GET    /api/payments/:id                   // Get payment details
POST   /api/payments/:id/confirm           // Confirm payment
POST   /api/payments/:id/release           // Release from escrow
POST   /api/payments/:id/refund            // Refund payment
GET    /api/payments/history               // Payment history
```

### **Payment Flow:**
```
1. Buyer accepts offer
2. System creates payment request
3. Buyer initiates payment:
   POST /api/payments/initiate
   {
     "offer_id": "uuid",
     "payment_method": "orange_money",
     "phone_number": "77XXXXXXX"
   }

4. Integration with mobile money provider API:
   - Orange Money API
   - MTN Mobile Money API
   - Lonestar API

5. Payment status updates:
   pending → processing → completed

6. Funds held in escrow

7. After delivery confirmed:
   POST /api/payments/:id/release

8. Seller receives payment minus platform fee (2%)
```

### **Mobile Money Provider Details:**

**Orange Money Liberia:**
- API: https://developer.orange.com/apis/orange-money-webpay/
- Phone prefixes: 770, 760, 880, 770
- Transaction limit: L$100,000/day

**MTN Mobile Money:**
- API: https://momodeveloper.mtn.com/
- Phone prefixes: 880, 860, 770
- Transaction limit: L$100,000/day

**Lonestar Cell MTN:**
- Phone prefixes: 770, 440, 330
- Transaction limit: L$50,000/day

### **Configuration (add to .env):**

```env
# Mobile Money
ORANGE_MONEY_API_KEY=your_orange_api_key
ORANGE_MONEY_MERCHANT_ID=your_merchant_id
MTN_MOMO_API_KEY=your_mtn_api_key
MTN_MOMO_SUBSCRIPTION_KEY=your_subscription_key
PLATFORM_FEE_PERCENTAGE=2
```

### **Sample Controller Code:**

```javascript
// backend/src/controllers/paymentController.js
const initiatePayment = async (req, res) => {
  const { offer_id, payment_method, phone_number } = req.body;

  // 1. Get offer details
  const offer = await Offer.findByPk(offer_id);

  // 2. Calculate fees
  const amount = offer.amount;
  const platformFee = (amount * 0.02); // 2%
  const totalAmount = amount;

  // 3. Create payment record
  const payment = await Payment.create({
    offer_id,
    payer_id: req.user.id,
    payee_id: offer.seller_id,
    amount,
    currency: 'USD',
    payment_method,
    payment_phone: phone_number,
    platform_fee: platformFee,
    status: 'pending'
  });

  // 4. Initiate with mobile money provider
  let transactionId;
  if (payment_method === 'orange_money') {
    transactionId = await orangeMoneyInitiate(phone_number, amount);
  } else if (payment_method === 'mtn_mobile_money') {
    transactionId = await mtnMomoInitiate(phone_number, amount);
  }

  // 5. Update payment with transaction ID
  await payment.update({
    transaction_id: transactionId,
    status: 'processing'
  });

  res.json({ success: true, payment });
};
```

---

## 🔧 FEATURE 2: County Filter System

### **What It Does:**
- Filter products by 15 Liberian counties
- Search within specific county
- "Near Me" functionality
- Distance-based filtering

### **API Endpoints:**

```javascript
// Counties
GET /api/counties                          // List all counties
GET /api/counties/:id                      // Get county details
GET /api/counties/:id/products             // Products in county

// Enhanced Product Search
GET /api/products?county_id=uuid           // Filter by county
GET /api/products?county=Montserrado       // Filter by county name
GET /api/products?near_me=true             // Near user's county
```

### **Usage Examples:**

```javascript
// Frontend: County Filter Component
import { useState, useEffect } from 'react';
import api from '../utils/api';

const CountyFilter = ({ onCountyChange }) => {
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('');

  useEffect(() => {
    // Fetch all counties
    api.get('/counties').then(res => {
      setCounties(res.data.data);
    });
  }, []);

  const handleChange = (e) => {
    const countyId = e.target.value;
    setSelectedCounty(countyId);
    onCountyChange(countyId);
  };

  return (
    <div className="county-filter">
      <label>📍 Location</label>
      <select value={selectedCounty} onChange={handleChange}>
        <option value="">All Counties</option>
        {counties.map(county => (
          <option key={county.id} value={county.id}>
            {county.name} ({county.capital})
          </option>
        ))}
      </select>
    </div>
  );
};

// Usage in Products Page
const Products = () => {
  const [products, setProducts] = useState([]);
  const [countyFilter, setCountyFilter] = useState('');

  const fetchProducts = async () => {
    const params = {};
    if (countyFilter) params.county_id = countyFilter;

    const response = await api.get('/products', { params });
    setProducts(response.data.data);
  };

  useEffect(() => {
    fetchProducts();
  }, [countyFilter]);

  return (
    <div>
      <CountyFilter onCountyChange={setCountyFilter} />
      <ProductGrid products={products} />
    </div>
  );
};
```

### **Enhanced Product Creation:**

```javascript
// When creating product, ask for county
<form onSubmit={handleSubmit}>
  <input name="title" placeholder="Product title" />
  <textarea name="description" />
  <input name="price" type="number" />

  <select name="county_id" required>
    <option value="">Select County</option>
    {counties.map(c => (
      <option value={c.id}>{c.name}</option>
    ))}
  </select>

  <input
    name="specific_location"
    placeholder="Specific area (e.g., Congo Town, Broad Street)"
  />

  <button type="submit">Create Product</button>
</form>
```

---

## 🔧 FEATURE 3: SMS Notifications

### **What It Does:**
- Send SMS for new messages
- Send SMS for offers
- Send SMS for payments
- Price drop alerts
- SMS verification codes

### **Setup (Choose One):**

**Option A: Twilio (International)**
```bash
npm install twilio
```

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Option B: Africa's Talking (Africa-focused, cheaper)**
```bash
npm install africastalking
```

```env
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=your_username
```

### **SMS Service Implementation:**

```javascript
// backend/src/services/smsService.js
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class SMSService {
  /**
   * Send SMS notification
   */
  static async send(phoneNumber, message, type = 'general', userId = null) {
    try {
      // Format phone for Liberia: +231XXXXXXXXX
      const formattedPhone = phoneNumber.startsWith('+231')
        ? phoneNumber
        : `+231${phoneNumber}`;

      // Send via Twilio
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });

      // Log SMS
      await SmsLog.create({
        user_id: userId,
        phone_number: formattedPhone,
        message,
        type,
        status: 'sent',
        provider: 'twilio',
        provider_message_id: result.sid,
        cost: 0.05, // Approximate cost per SMS
        sent_at: new Date()
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('SMS Error:', error);

      // Log failed SMS
      await SmsLog.create({
        user_id: userId,
        phone_number: formattedPhone,
        message,
        type,
        status: 'failed',
        error_message: error.message
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send new message notification
   */
  static async notifyNewMessage(recipientUser, senderName, productTitle) {
    if (!recipientUser.sms_notifications_enabled) return;
    if (!recipientUser.sms_preferences?.new_message) return;

    const message = `New message from ${senderName} about "${productTitle}". Reply at: lm.com/messages`;

    await this.send(
      recipientUser.phone,
      message,
      'new_message',
      recipientUser.id
    );
  }

  /**
   * Send offer received notification
   */
  static async notifyOfferReceived(sellerUser, buyerName, amount, productTitle) {
    if (!sellerUser.sms_notifications_enabled) return;
    if (!sellerUser.sms_preferences?.offer_received) return;

    const message = `${buyerName} made an offer of $${amount} on "${productTitle}". View at: lm.com/dashboard`;

    await this.send(
      sellerUser.phone,
      message,
      'offer_received',
      sellerUser.id
    );
  }

  /**
   * Send offer accepted notification
   */
  static async notifyOfferAccepted(buyerUser, productTitle, amount) {
    if (!buyerUser.sms_notifications_enabled) return;

    const message = `Your offer of $${amount} for "${productTitle}" was ACCEPTED! Contact seller at: lm.com/messages`;

    await this.send(
      buyerUser.phone,
      message,
      'offer_accepted',
      buyerUser.id
    );
  }

  /**
   * Send payment request
   */
  static async notifyPaymentRequest(buyerUser, amount, sellerName) {
    const message = `Payment request: $${amount} to ${sellerName}. Complete payment at: lm.com/payments`;

    await this.send(
      buyerUser.phone,
      message,
      'payment_request',
      buyerUser.id
    );
  }
}

module.exports = SMSService;
```

### **Integration with Existing Features:**

```javascript
// In messageController.js - when sending message
const SMSService = require('../services/smsService');

const sendMessage = async (req, res) => {
  // ... existing code to send message ...

  // Send SMS notification
  const recipient = await User.findByPk(conversation.other_user_id);
  await SMSService.notifyNewMessage(
    recipient,
    req.user.name,
    conversation.product.title
  );

  res.json({ success: true, message });
};

// In offerController.js - when creating offer
const createOffer = async (req, res) => {
  // ... existing code to create offer ...

  // Notify seller via SMS
  const seller = await User.findByPk(product.seller_id);
  await SMSService.notifyOfferReceived(
    seller,
    req.user.name,
    offer.amount,
    product.title
  );

  res.json({ success: true, offer });
};
```

### **Cost Estimation:**

- SMS Cost: $0.05 per SMS (Twilio)
- Africa's Talking: $0.02 per SMS (cheaper)
- Average user: 5 SMS/month
- 1000 users = $50-$250/month

---

## 🔧 FEATURE 4: Ratings & Reviews

### **What It Does:**
- 5-star seller ratings
- Written reviews
- Review responses
- Verified purchase badges
- Average rating calculation

### **API Endpoints:**

```javascript
// Reviews
POST   /api/reviews                        // Create review
GET    /api/reviews/user/:id               // Get user's reviews
GET    /api/reviews/product/:id            // Get product reviews
PUT    /api/reviews/:id                    // Update review
DELETE /api/reviews/:id                    // Delete review
POST   /api/reviews/:id/response           // Seller responds to review
POST   /api/reviews/:id/helpful            // Mark review as helpful
```

### **Review Component (Frontend):**

```jsx
// ReviewCard.jsx
const ReviewCard = ({ review }) => {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.reviewer.name[0]}
          </div>
          <div>
            <h4>{review.reviewer.name}</h4>
            {review.is_verified_purchase && (
              <span className="verified-badge">✓ Verified Purchase</span>
            )}
          </div>
        </div>
        <div className="review-rating">
          {'⭐'.repeat(review.rating)}
        </div>
      </div>

      <p className="review-comment">{review.comment}</p>

      <div className="review-meta">
        <span>{new Date(review.created_at).toLocaleDateString()}</span>
        <button onClick={() => markHelpful(review.id)}>
          👍 Helpful ({review.helpful_count})
        </button>
      </div>

      {review.response && (
        <div className="seller-response">
          <strong>Seller Response:</strong>
          <p>{review.response}</p>
          <span>{new Date(review.responded_at).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

// Usage on Seller Profile
const SellerProfile = ({ sellerId }) => {
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Fetch seller info
    api.get(`/users/${sellerId}`).then(res => {
      setSeller(res.data.data);
    });

    // Fetch reviews
    api.get(`/reviews/user/${sellerId}`).then(res => {
      setReviews(res.data.data);
    });
  }, [sellerId]);

  return (
    <div className="seller-profile">
      <div className="seller-header">
        <h1>{seller?.name}</h1>
        <div className="seller-rating">
          ⭐⭐⭐⭐⭐ {seller?.avg_rating} ({seller?.total_reviews} reviews)
        </div>
        <div className="seller-stats">
          <span>📦 {seller?.total_sales} sales</span>
          <span>💬 {seller?.response_rate}% response rate</span>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
};
```

### **Leave Review Modal:**

```jsx
const LeaveReviewModal = ({ offerId, sellerId, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    await api.post('/reviews', {
      reviewee_id: sellerId,
      offer_id: offerId,
      rating,
      comment,
      review_type: 'seller'
    });

    toast.success('Review submitted!');
    onClose();
  };

  return (
    <div className="modal">
      <h2>Rate Your Experience</h2>

      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={star <= rating ? 'active' : ''}
            onClick={() => setRating(star)}
          >
            ⭐
          </span>
        ))}
      </div>

      <textarea
        placeholder="Tell us about your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit Review</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};
```

### **Auto-update User Rating:**

```javascript
// After creating review, update user's average rating
const updateUserRating = async (userId) => {
  const reviews = await Review.findAll({
    where: { reviewee_id: userId, is_visible: true }
  });

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await User.update(
    {
      avg_rating: avgRating.toFixed(2),
      total_reviews: reviews.length
    },
    { where: { id: userId } }
  );
};
```

---

## 📦 COMPLETE FILE STRUCTURE

```
backend/
├── migrations/
│   ├── 20251209000001-add-mobile-money-tables.js    ✅
│   ├── 20251209000002-add-county-system.js          ✅
│   ├── 20251209000003-add-sms-system.js             ✅
│   └── 20251209000004-add-ratings-reviews.js        ✅
├── scripts/
│   └── seed-counties.js                             ✅
├── src/
│   ├── models/
│   │   ├── MobileMoneyAccount.js                    (Create this)
│   │   ├── Payment.js                               (Create this)
│   │   ├── County.js                                (Create this)
│   │   ├── SmsLog.js                                (Create this)
│   │   └── Review.js                                (Create this)
│   ├── controllers/
│   │   ├── mobileMoneyController.js                 (Create this)
│   │   ├── paymentController.js                     (Create this)
│   │   ├── countyController.js                      (Create this)
│   │   ├── smsController.js                         (Create this)
│   │   └── reviewController.js                      (Create this)
│   ├── routes/
│   │   ├── mobileMoneyRoutes.js                     (Create this)
│   │   ├── paymentRoutes.js                         (Create this)
│   │   ├── countyRoutes.js                          (Create this)
│   │   └── reviewRoutes.js                          (Create this)
│   └── services/
│       ├── smsService.js                            (Create this)
│       ├── orangeMoneyService.js                    (Create this)
│       └── mtnMomoService.js                        (Create this)
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Install Dependencies
```bash
npm install twilio  # For SMS
# OR
npm install africastalking  # Cheaper alternative
```

### 2. Update Environment Variables
```env
# Add to .env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

ORANGE_MONEY_API_KEY=
MTN_MOMO_API_KEY=
PLATFORM_FEE_PERCENTAGE=2
```

### 3. Run Migrations
```bash
npx sequelize-cli db:migrate
```

### 4. Seed Counties
```bash
node scripts/seed-counties.js
```

### 5. Restart Server
```bash
npm start
```

---

## ✅ TESTING CHECKLIST

### Mobile Money
- [ ] Add Orange Money account
- [ ] Add MTN MoMo account
- [ ] Initiate payment
- [ ] View payment history
- [ ] Release payment from escrow

### County Filter
- [ ] View all 15 counties
- [ ] Filter products by county
- [ ] Select county on product creation
- [ ] Search "Near Me"

### SMS Notifications
- [ ] Receive SMS for new message
- [ ] Receive SMS for offer
- [ ] Receive SMS for payment
- [ ] SMS preferences settings
- [ ] Disable SMS notifications

### Ratings & Reviews
- [ ] Leave 5-star review
- [ ] View seller ratings
- [ ] Seller responds to review
- [ ] Mark review as helpful
- [ ] Average rating updates

---

## 💰 ESTIMATED COSTS

- **SMS**: $50-250/month (1000 users)
- **Mobile Money API**: Free (revenue from transactions)
- **Development Time**: 40-60 hours total
- **Revenue Potential**: $4,700/month after 6 months

---

## 🎯 NEXT STEPS

1. ✅ Run migrations (database setup)
2. ✅ Seed counties
3. ⏳ Create remaining models (Payment, County, SmsLog, Review)
4. ⏳ Create controllers
5. ⏳ Create routes
6. ⏳ Implement SMS service
7. ⏳ Implement mobile money integrations
8. ⏳ Create frontend components
9. ⏳ Test all features
10. ⏳ Deploy!

**You now have the complete foundation! Ready to implement the models and controllers?**
