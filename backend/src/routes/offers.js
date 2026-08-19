const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateOffer, validatePagination, sanitizeBody } = require('../middleware/inputValidation');
const {
  placeBid,
  buyNow,
  getReceivedOffers,
  getSentOffers,
  getMyOfferForProduct,
  createOffer,
  acceptOffer,
  rejectOffer,
  counterOffer,
  setDeliveryMethod,
  sellerConfirmDelivery,
  buyerConfirmReceipt
} = require('../controllers/offerController');

// Apply sanitization to all routes
router.use(sanitizeBody);

router.post('/', protect, createOffer); // Legacy endpoint for bidding
router.post('/bid', protect, placeBid); // New endpoint
router.post('/buy-now', protect, buyNow); // New endpoint

router.get('/received', protect, validatePagination, getReceivedOffers);
router.get('/sent', protect, validatePagination, getSentOffers);
router.get('/my-offer/:productId', protect, getMyOfferForProduct);

router.patch('/:id/accept', protect, acceptOffer);
router.patch('/:id/reject', protect, rejectOffer);
router.patch('/:id/counter', protect, counterOffer);

// Delivery confirmation flow (triggered after offer is accepted)
router.patch('/:id/delivery-method', protect, setDeliveryMethod);
router.patch('/:id/seller-confirm', protect, sellerConfirmDelivery);
router.patch('/:id/buyer-confirm', protect, buyerConfirmReceipt);

module.exports = router;
