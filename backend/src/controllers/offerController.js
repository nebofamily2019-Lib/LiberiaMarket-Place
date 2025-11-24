const { sequelize } = require('../models');

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Buyer)
const createOffer = async (req, res, next) => {
  try {
    console.log('📥 Creating offer:', req.body);
    
    const { product_id, offer_amount, message } = req.body;
    const buyer_id = req.user.id;

    // Validate required fields
    if (!product_id || !offer_amount) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and offer amount are required'
      });
    }

    // Check if product exists (using raw query since model associations are having issues)
    const [products] = await sequelize.query(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      { replacements: [product_id] }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = products[0];

    // Check if buyer is not the seller
    if (product.seller_id === buyer_id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot make an offer on your own product'
      });
    }

    // Validate offer amount
    if (parseFloat(offer_amount) >= parseFloat(product.price)) {
      return res.status(400).json({
        success: false,
        error: 'Offer amount must be less than the asking price'
      });
    }

    // Create offer using raw query
    const offerId = require('crypto').randomUUID();
    const now = new Date().toISOString();
    
    await sequelize.query(
      `INSERT INTO offers (id, product_id, buyer_id, seller_id, offer_amount, message, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      { 
        replacements: [
          offerId, 
          product_id, 
          buyer_id, 
          product.seller_id, 
          parseFloat(offer_amount), 
          message || '', 
          now, 
          now
        ] 
      }
    );

    console.log(`✅ Offer created: $${offer_amount} for product ${product.title}`);

    res.status(201).json({
      success: true,
      message: 'Offer sent successfully',
      data: {
        id: offerId,
        product_id,
        buyer_id,
        seller_id: product.seller_id,
        offer_amount: parseFloat(offer_amount),
        message: message || '',
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('❌ Error creating offer:', error);
    next(error);
  }
};

// @desc    Get offers for a seller
// @route   GET /api/offers/received
// @access  Private (Seller)
const getReceivedOffers = async (req, res, next) => {
  try {
    const seller_id = req.user.id;

    console.log('📥 Fetching offers for seller:', seller_id);

    // Use raw SQL query to get offers
    const [offers] = await sequelize.query(
      `SELECT 
        o.id, o.offer_amount, o.message, o.status, o.createdAt,
        p.id as product_id, p.title as product_title, p.price as product_price,
        u.id as buyer_id, u.name as buyer_name, u.phone as buyer_phone
       FROM offers o
       INNER JOIN products p ON o.product_id = p.id
       INNER JOIN users u ON o.buyer_id = u.id
       WHERE o.seller_id = ?
       ORDER BY o.createdAt DESC`,
      { replacements: [seller_id] }
    );

    // Format the response
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      offer_amount: parseFloat(offer.offer_amount),
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      product: {
        id: offer.product_id,
        title: offer.product_title,
        price: parseFloat(offer.product_price)
      },
      buyer: {
        id: offer.buyer_id,
        name: offer.buyer_name,
        phone: offer.buyer_phone
      }
    }));

    console.log(`✅ Found ${formattedOffers.length} offers`);

    res.status(200).json({
      success: true,
      data: formattedOffers
    });
  } catch (error) {
    console.error('❌ Error fetching received offers:', error);
    next(error);
  }
};

// @desc    Get offers sent by buyer
// @route   GET /api/offers/sent
// @access  Private (Buyer)
const getSentOffers = async (req, res, next) => {
  try {
    const buyer_id = req.user.id;

    console.log('📤 Fetching offers sent by buyer:', buyer_id);

    // Use raw SQL query to get offers
    const [offers] = await sequelize.query(
      `SELECT 
        o.id, o.offer_amount, o.message, o.status, o.createdAt, o.updatedAt,
        p.id as product_id, p.title as product_title, p.price as product_price,
        u.id as seller_id, u.name as seller_name, u.phone as seller_phone
       FROM offers o
       INNER JOIN products p ON o.product_id = p.id
       INNER JOIN users u ON o.seller_id = u.id
       WHERE o.buyer_id = ?
       ORDER BY o.createdAt DESC`,
      { replacements: [buyer_id] }
    );

    // Format the response
    const formattedOffers = offers.map(offer => ({
      id: offer.id,
      offer_amount: parseFloat(offer.offer_amount),
      message: offer.message,
      status: offer.status,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
      product: {
        id: offer.product_id,
        title: offer.product_title,
        price: parseFloat(offer.product_price)
      },
      seller: {
        id: offer.seller_id,
        name: offer.seller_name,
        phone: offer.seller_phone
      }
    }));

    console.log(`✅ Found ${formattedOffers.length} sent offers`);

    res.status(200).json({
      success: true,
      data: formattedOffers
    });
  } catch (error) {
    console.error('❌ Error fetching sent offers:', error);
    next(error);
  }
};

// @desc    Accept an offer
// @route   PATCH /api/offers/:id/accept
// @access  Private (Seller)
const acceptOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    console.log('✅ Accepting offer:', id);

    // Check if offer exists and belongs to this seller
    const [offers] = await sequelize.query(
      'SELECT * FROM offers WHERE id = ? AND seller_id = ? LIMIT 1',
      { replacements: [id, seller_id] }
    );

    if (!offers || offers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found or you do not have permission'
      });
    }

    // Update offer status
    await sequelize.query(
      'UPDATE offers SET status = ?, updatedAt = ? WHERE id = ?',
      { replacements: ['accepted', new Date().toISOString(), id] }
    );

    console.log('✅ Offer accepted');

    res.status(200).json({
      success: true,
      message: 'Offer accepted successfully'
    });
  } catch (error) {
    console.error('❌ Error accepting offer:', error);
    next(error);
  }
};

// @desc    Reject an offer
// @route   PATCH /api/offers/:id/reject
// @access  Private (Seller)
const rejectOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    console.log('❌ Rejecting offer:', id);

    // Check if offer exists and belongs to this seller
    const [offers] = await sequelize.query(
      'SELECT * FROM offers WHERE id = ? AND seller_id = ? LIMIT 1',
      { replacements: [id, seller_id] }
    );

    if (!offers || offers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Offer not found or you do not have permission'
      });
    }

    // Update offer status
    await sequelize.query(
      'UPDATE offers SET status = ?, updatedAt = ? WHERE id = ?',
      { replacements: ['rejected', new Date().toISOString(), id] }
    );

    console.log('✅ Offer rejected');

    res.status(200).json({
      success: true,
      message: 'Offer rejected'
    });
  } catch (error) {
    console.error('❌ Error rejecting offer:', error);
    next(error);
  }
};

module.exports = {
  createOffer,
  getReceivedOffers,
  getSentOffers,
  acceptOffer,
  rejectOffer
};
