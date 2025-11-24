const { sequelize } = require('../models');

// @desc    Initiate payment for accepted offer
// @route   POST /api/payments
// @access  Private (Buyer)
const createPayment = async (req, res, next) => {
  try {
    const { offer_id, payment_method, payment_phone, transaction_id, notes } = req.body;
    const buyer_id = req.user.id;

    console.log('💳 Creating payment:', { offer_id, payment_method });

    // Validate required fields
    if (!offer_id || !payment_method) {
      return res.status(400).json({
        success: false,
        error: 'Offer ID and payment method are required'
      });
    }

    // Get offer details
    const [offers] = await sequelize.query(
      `SELECT o.*, p.id as product_id, p.title, p.price, p.seller_id
       FROM offers o
       INNER JOIN products p ON o.product_id = p.id
       WHERE o.id = ? AND o.buyer_id = ? AND o.status = 'accepted'`,
      { replacements: [offer_id, buyer_id] }
    );

    if (!offers || offers.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Accepted offer not found or you do not have permission'
      });
    }

    const offer = offers[0];

    // Validate mobile money phone for mobile money payments
    if (['mtn_mobile_money', 'orange_money', 'lonestar_cell'].includes(payment_method)) {
      if (!payment_phone) {
        return res.status(400).json({
          success: false,
          error: 'Mobile money phone number is required'
        });
      }
    }

    // Check if payment already exists for this offer
    const [existingPayments] = await sequelize.query(
      'SELECT * FROM payments WHERE offer_id = ? LIMIT 1',
      { replacements: [offer_id] }
    );

    if (existingPayments && existingPayments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Payment already initiated for this offer'
      });
    }

    // Create payment record
    const paymentId = require('crypto').randomUUID();
    const now = new Date().toISOString();

    await sequelize.query(
      `INSERT INTO payments (id, offer_id, buyer_id, seller_id, product_id, amount, payment_method, payment_phone, transaction_id, status, notes, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      {
        replacements: [
          paymentId,
          offer_id,
          buyer_id,
          offer.seller_id,
          offer.product_id,
          offer.offer_amount,
          payment_method,
          payment_phone || null,
          transaction_id || null,
          notes || '',
          now,
          now
        ]
      }
    );

    console.log(`✅ Payment created: ${paymentId}`);

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        id: paymentId,
        offer_id,
        amount: parseFloat(offer.offer_amount),
        payment_method,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('❌ Error creating payment:', error);
    next(error);
  }
};

// @desc    Get buyer's payments
// @route   GET /api/payments/my-payments
// @access  Private (Buyer)
const getMyPayments = async (req, res, next) => {
  try {
    const buyer_id = req.user.id;

    const [payments] = await sequelize.query(
      `SELECT 
        pay.id, pay.amount, pay.payment_method, pay.payment_phone, 
        pay.transaction_id, pay.status, pay.createdAt, pay.completed_at,
        p.id as product_id, p.title as product_title,
        u.id as seller_id, u.name as seller_name, u.phone as seller_phone
       FROM payments pay
       INNER JOIN products p ON pay.product_id = p.id
       INNER JOIN users u ON pay.seller_id = u.id
       WHERE pay.buyer_id = ?
       ORDER BY pay.createdAt DESC`,
      { replacements: [buyer_id] }
    );

    const formattedPayments = payments.map(pay => ({
      id: pay.id,
      amount: parseFloat(pay.amount),
      payment_method: pay.payment_method,
      payment_phone: pay.payment_phone,
      transaction_id: pay.transaction_id,
      status: pay.status,
      createdAt: pay.createdAt,
      completed_at: pay.completed_at,
      product: {
        id: pay.product_id,
        title: pay.product_title
      },
      seller: {
        id: pay.seller_id,
        name: pay.seller_name,
        phone: pay.seller_phone
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedPayments
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    next(error);
  }
};

// @desc    Get seller's received payments
// @route   GET /api/payments/received
// @access  Private (Seller)
const getReceivedPayments = async (req, res, next) => {
  try {
    const seller_id = req.user.id;

    const [payments] = await sequelize.query(
      `SELECT 
        pay.id, pay.amount, pay.payment_method, pay.status, 
        pay.createdAt, pay.completed_at,
        p.id as product_id, p.title as product_title,
        u.id as buyer_id, u.name as buyer_name, u.phone as buyer_phone
       FROM payments pay
       INNER JOIN products p ON pay.product_id = p.id
       INNER JOIN users u ON pay.buyer_id = u.id
       WHERE pay.seller_id = ?
       ORDER BY pay.createdAt DESC`,
      { replacements: [seller_id] }
    );

    const formattedPayments = payments.map(pay => ({
      id: pay.id,
      amount: parseFloat(pay.amount),
      payment_method: pay.payment_method,
      status: pay.status,
      createdAt: pay.createdAt,
      completed_at: pay.completed_at,
      product: {
        id: pay.product_id,
        title: pay.product_title
      },
      buyer: {
        id: pay.buyer_id,
        name: pay.buyer_name,
        phone: pay.buyer_phone
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedPayments
    });
  } catch (error) {
    console.error('❌ Error fetching received payments:', error);
    next(error);
  }
};

// @desc    Confirm payment received (seller)
// @route   PATCH /api/payments/:id/confirm
// @access  Private (Seller)
const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller_id = req.user.id;

    // Verify payment belongs to seller
    const [payments] = await sequelize.query(
      'SELECT * FROM payments WHERE id = ? AND seller_id = ? LIMIT 1',
      { replacements: [id, seller_id] }
    );

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found or you do not have permission'
      });
    }

    // Update payment status
    await sequelize.query(
      'UPDATE payments SET status = ?, completed_at = ?, updatedAt = ? WHERE id = ?',
      { replacements: ['completed', new Date().toISOString(), new Date().toISOString(), id] }
    );

    console.log(`✅ Payment confirmed: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    next(error);
  }
};

module.exports = {
  createPayment,
  getMyPayments,
  getReceivedPayments,
  confirmPayment
};
