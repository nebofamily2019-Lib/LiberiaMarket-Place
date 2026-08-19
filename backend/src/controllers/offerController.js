const { sequelize, Offer, Product, User, Notification, UserActivity } = require('../models');
const { Op } = require('sequelize');

// Finalise a transaction once both parties have confirmed
const completeTransaction = async (offer) => {
  const product = await Product.findByPk(offer.product_id);
  if (!product) return;

  // Use counter_amount if a counter was made, otherwise the original offer_amount
  const acceptedAmount = offer.counter_amount || offer.offer_amount;

  await product.update({
    status: 'sold',
    sold_price: acceptedAmount,
    sold_at: new Date()
  });

  await offer.update({ status: 'completed' });

  try {
    await UserActivity.create({
      user_id: offer.seller_id,
      activity_type: 'sold_product',
      entity_id: offer.product_id,
      details: { sold_price: acceptedAmount, via: 'offer_delivery_confirmed' }
    });
  } catch (logErr) {
    console.warn('Failed to log sold_product activity:', logErr.message);
  }
};

// Helper to calculate expiry
const getExpiryDate = () => {
  const date = new Date();
  date.setHours(date.getHours() + 24);
  return date;
};

// @desc    Create a new offer (negotiation)
// @route   POST /api/offers
// @access  Private (Buyer)
const createOffer = async (req, res, next) => {
  try {
    const { product_id, offer_amount, message, currency } = req.body;
    const buyer_id = req.user.id;

    if (!product_id || !offer_amount) {
      return res.status(400).json({ success: false, error: 'Product ID and offer amount are required' });
    }

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ success: false, error: 'Product is not active' });
    if (product.seller_id === buyer_id) return res.status(400).json({ success: false, error: 'Cannot make offer on your own product' });

    // CAP: Check if buyer already has an active offer (pending or countered)
    const existingOffer = await Offer.findOne({
      where: {
        product_id,
        buyer_id,
        status: { [Op.in]: ['pending', 'countered'] }
      }
    });

    if (existingOffer) {
      return res.status(400).json({ 
        success: false, 
        error: 'You already have an active offer for this item. Please wait for the seller to respond.' 
      });
    }

    // Create Offer
    const offer = await Offer.create({
      product_id,
      buyer_id,
      seller_id: product.seller_id,
      offer_amount,
      currency: currency || 'USD',
      product_price_snapshot: product.price,
      message,
      status: 'pending',
      expires_at: getExpiryDate()
    });

    // Notify Seller (Placeholder)
    // await Notification.create(...)

    res.status(201).json({ success: true, data: offer });

  } catch (error) {
    console.error('Error creating offer:', error);
    next(error);
  }
};

// @desc    Counter an offer
// @route   PATCH /api/offers/:id/counter
// @access  Private (Seller)
const counterOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { counter_amount, counter_message, counter_currency } = req.body;
    const seller_id = req.user.id;

    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    if (offer.seller_id !== seller_id) {
      return res.status(403).json({ success: false, error: 'Not authorized to counter this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only counter pending offers' });
    }

    // CAP: Check if already countered
    if (offer.counter_amount) {
      return res.status(400).json({ success: false, error: 'You have already submitted a counteroffer.' });
    }

    // Update Offer
    offer.counter_amount = counter_amount;
    offer.counter_currency = counter_currency || offer.currency;
    offer.counter_message = counter_message;
    offer.status = 'countered';
    offer.expires_at = getExpiryDate(); // Reset expiry
    offer.responded_by = seller_id;
    
    await offer.save();

    res.status(200).json({ success: true, data: offer });

  } catch (error) {
    console.error('Error countering offer:', error);
    next(error);
  }
};

// @desc    Accept an offer
// @route   PATCH /api/offers/:id/accept
// @access  Private (Seller or Buyer)
const acceptOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const offer = await Offer.findByPk(id, { include: ['offerProduct'] });
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    // Determine role and validate
    const isSeller = offer.seller_id === userId;
    const isBuyer = offer.buyer_id === userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (isSeller && offer.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Can only accept pending offers' });
    }

    if (isBuyer && offer.status !== 'countered') {
      return res.status(400).json({ success: false, error: 'Can only accept countered offers' });
    }

    // Update Offer
    offer.status = 'accepted';
    offer.responded_by = userId;
    await offer.save();

    // Reserve the product (pending delivery confirmation — will become 'sold' when both parties confirm)
    const product = await Product.findByPk(offer.product_id);
    if (product) {
      product.status = 'pending';
      await product.save();
    }

    // Reject all other pending offers for this product
    await Offer.update(
      { status: 'rejected' },
      { 
        where: { 
          product_id: offer.product_id, 
          status: 'pending',
          id: { [Op.ne]: offer.id }
        } 
      }
    );

    res.status(200).json({ success: true, data: offer });

  } catch (error) {
    console.error('Error accepting offer:', error);
    next(error);
  }
};

// @desc    Reject an offer
// @route   PATCH /api/offers/:id/reject
// @access  Private (Seller or Buyer)
const rejectOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });

    const isSeller = offer.seller_id === userId;
    const isBuyer = offer.buyer_id === userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (offer.status === 'accepted' || offer.status === 'rejected' || offer.status === 'expired') {
      return res.status(400).json({ success: false, error: 'Cannot reject this offer' });
    }

    offer.status = 'rejected';
    offer.responded_by = userId;
    await offer.save();

    res.status(200).json({ success: true, data: offer });

  } catch (error) {
    console.error('Error rejecting offer:', error);
    next(error);
  }
};

// @desc    Get received offers
// @route   GET /api/offers/received
// @access  Private (Seller)
const getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await Offer.findAll({
      where: { seller_id: req.user.id },
      include: [
        { model: Product, as: 'offerProduct', attributes: ['id', 'title', 'price', 'images', 'status'] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });
    // Remap offerProduct → product so the frontend receives a consistent key
    const data = offers.map(o => {
      const plain = o.toJSON();
      plain.product = plain.offerProduct;
      delete plain.offerProduct;
      return plain;
    });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent offers
// @route   GET /api/offers/sent
// @access  Private (Buyer)
const getSentOffers = async (req, res, next) => {
  try {
    const offers = await Offer.findAll({
      where: { buyer_id: req.user.id },
      include: [
        { model: Product, as: 'offerProduct', attributes: ['id', 'title', 'price', 'images', 'status'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['created_at', 'DESC']]
    });
    // Remap offerProduct → product so the frontend receives a consistent key
    const data = offers.map(o => {
      const plain = o.toJSON();
      plain.product = plain.offerProduct;
      delete plain.offerProduct;
      return plain;
    });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Buy Now (Legacy support or direct purchase)
const buyNow = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    const buyer_id = req.user.id;

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    if (product.status !== 'active') return res.status(400).json({ success: false, error: 'Product not available' });
    if (product.seller_id === buyer_id) return res.status(400).json({ success: false, error: 'Cannot buy your own product' });

    product.status = 'sold';
    await product.save();

    const offer = await Offer.create({
      product_id,
      buyer_id,
      seller_id: product.seller_id,
      offer_amount: product.price,
      status: 'accepted',
      expires_at: getExpiryDate()
    });

    res.status(200).json({ success: true, message: 'Product purchased successfully' });

  } catch (error) {
    next(error);
  }
};

// @desc    Get my offer for a specific product
// @route   GET /api/offers/my-offer/:productId
// @access  Private
const getMyOfferForProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const buyer_id = req.user.id;

    const offer = await Offer.findOne({
      where: {
        product_id: productId,
        buyer_id
      },
      order: [['created_at', 'DESC']] // Get the most recent one
    });

    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller sets delivery method (delivery or pickup)
// @route   PATCH /api/offers/:id/delivery-method
// @access  Private (Seller)
const setDeliveryMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { delivery_method } = req.body;
    const userId = req.user.id;

    if (!['delivery', 'pickup'].includes(delivery_method)) {
      return res.status(400).json({ success: false, error: 'delivery_method must be "delivery" or "pickup"' });
    }

    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.seller_id !== userId) return res.status(403).json({ success: false, error: 'Only the seller can set the delivery method' });
    if (offer.status !== 'accepted') return res.status(400).json({ success: false, error: 'Offer must be accepted before setting delivery method' });

    await offer.update({ delivery_method });
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Seller confirms they have delivered / handed over the item
// @route   PATCH /api/offers/:id/seller-confirm
// @access  Private (Seller)
const sellerConfirmDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.seller_id !== userId) return res.status(403).json({ success: false, error: 'Not authorized' });
    if (offer.status !== 'accepted') return res.status(400).json({ success: false, error: 'Offer must be accepted first' });
    if (!offer.delivery_method) return res.status(400).json({ success: false, error: 'Please choose a delivery method before confirming' });
    if (offer.seller_confirmed) return res.status(400).json({ success: false, error: 'You have already confirmed delivery' });

    await offer.update({ seller_confirmed: true, seller_confirmed_at: new Date() });

    // Complete the transaction if the buyer has already confirmed
    if (offer.buyer_confirmed) {
      await completeTransaction(offer);
      const updated = await Offer.findByPk(id);
      return res.status(200).json({ success: true, data: updated, completed: true });
    }

    const updated = await Offer.findByPk(id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Buyer confirms they have received the item
// @route   PATCH /api/offers/:id/buyer-confirm
// @access  Private (Buyer)
const buyerConfirmReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const offer = await Offer.findByPk(id);
    if (!offer) return res.status(404).json({ success: false, error: 'Offer not found' });
    if (offer.buyer_id !== userId) return res.status(403).json({ success: false, error: 'Not authorized' });
    if (offer.status !== 'accepted') return res.status(400).json({ success: false, error: 'Offer must be accepted first' });
    if (offer.buyer_confirmed) return res.status(400).json({ success: false, error: 'You have already confirmed receipt' });

    await offer.update({ buyer_confirmed: true, buyer_confirmed_at: new Date() });

    // Complete the transaction if the seller has already confirmed
    if (offer.seller_confirmed) {
      await completeTransaction(offer);
      const updated = await Offer.findByPk(id);
      return res.status(200).json({ success: true, data: updated, completed: true });
    }

    const updated = await Offer.findByPk(id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOffer,
  placeBid: createOffer,
  buyNow,
  getReceivedOffers,
  getSentOffers,
  getMyOfferForProduct,
  counterOffer,
  acceptOffer,
  rejectOffer,
  setDeliveryMethod,
  sellerConfirmDelivery,
  buyerConfirmReceipt
};
