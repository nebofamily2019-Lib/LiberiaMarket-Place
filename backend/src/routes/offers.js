const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  createOffer, 
  getReceivedOffers,
  getSentOffers,
  acceptOffer, 
  rejectOffer 
} = require('../controllers/offerController');

router.post('/', protect, createOffer);
router.get('/received', protect, getReceivedOffers);
router.get('/sent', protect, getSentOffers);
router.patch('/:id/accept', protect, acceptOffer);
router.patch('/:id/reject', protect, rejectOffer);

module.exports = router;
