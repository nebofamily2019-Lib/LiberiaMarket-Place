const { Payment, Offer, Product, User, MobileMoneyAccount } = require('../models');
const { Op } = require('sequelize');
const smsService = require('../services/smsService');

/**
 * Calculate platform fee (2% of amount)
 */
const calculatePlatformFee = (amount) => {
  return (amount * 0.02).toFixed(2);
};

/**
 * Initiate payment for an accepted offer
 * @route POST /api/payments/initiate
 */
exports.initiatePayment = async (req, res) => {
  try {
    const {
      offer_id,
      payment_method,
      mobile_money_account_id,
      currency = 'USD'
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!offer_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Offer ID and payment method are required'
      });
    }

    // Validate payment method
    const validMethods = ['orange_money', 'mtn_mobile_money', 'lonestar_money', 'cash', 'bank_transfer'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Get offer with related data
    const offer = await Offer.findByPk(offer_id, {
      include: [
        {
          model: Product,
          as: 'offerProduct',
          include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }]
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Verify user is the buyer
    if (offer.buyer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can initiate payment for this offer'
      });
    }

    // Verify offer is accepted
    if (offer.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be initiated for accepted offers'
      });
    }

    // Check if payment already exists for this offer
    const existingPayment = await Payment.findOne({
      where: {
        offer_id,
        status: { [Op.in]: ['pending', 'processing', 'completed'] }
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'A payment already exists for this offer',
        payment: existingPayment
      });
    }

    // Verify mobile money account if using mobile money
    let mobileAccount = null;
    if (['orange_money', 'mtn_mobile_money', 'lonestar_money'].includes(payment_method)) {
      if (!mobile_money_account_id) {
        return res.status(400).json({
          success: false,
          message: 'Mobile money account ID is required for mobile money payments'
        });
      }

      mobileAccount = await MobileMoneyAccount.findOne({
        where: {
          id: mobile_money_account_id,
          user_id: userId,
          is_verified: true
        }
      });

      if (!mobileAccount) {
        return res.status(400).json({
          success: false,
          message: 'Mobile money account not found or not verified'
        });
      }

      // Verify provider matches payment method
      if (mobileAccount.provider !== payment_method) {
        return res.status(400).json({
          success: false,
          message: 'Mobile money account provider does not match payment method'
        });
      }
    }

    // Calculate amounts
    const amount = parseFloat(offer.offer_amount);
    const platformFee = parseFloat(calculatePlatformFee(amount));

    // Create payment record
    const payment = await Payment.create({
      offer_id,
      payer_id: userId,
      payee_id: offer.seller_id,
      mobile_money_account_id: mobile_money_account_id || null,
      amount,
      currency,
      payment_method,
      status: 'pending',
      escrow_status: 'held',
      platform_fee: platformFee,
      payment_metadata: {
        product_title: offer.offerProduct.title,
        product_id: offer.product_id,
        initiated_at: new Date()
      }
    });

    // TODO: Integrate with actual payment provider API
    // For now, we'll simulate the payment initiation
    // const providerResponse = await initiateProviderPayment(payment);

    // Send SMS notification to seller
    try {
      await smsService.sendNotification({
        userId: offer.seller_id,
        phoneNumber: offer.offerProduct.seller.phone,
        type: 'payment_request',
        data: {
          amount: amount,
          productTitle: offer.offerProduct.title
        }
      });
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
      // Don't fail the payment if SMS fails
    }

    // Fetch complete payment data
    const completePayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [
            { model: Product, as: 'offerProduct', attributes: ['id', 'title', 'images'] }
          ]
        },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: User, as: 'payee', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated successfully',
      data: completePayment,
      instructions: payment_method === 'cash'
        ? 'Please arrange to meet the seller for cash payment'
        : 'Complete the payment using your mobile money app'
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating payment',
      error: error.message
    });
  }
};

/**
 * Confirm payment (buyer confirms they've paid)
 * @route POST /api/payments/:id/confirm
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_id } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [
            {
              model: Product,
              as: 'offerProduct',
              include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }]
            }
          ]
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user is the payer
    if (payment.payer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only confirm your own payments'
      });
    }

    // Verify payment is pending
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm payment with status: ${payment.status}`
      });
    }

    // Update payment
    await payment.update({
      status: 'processing',
      transaction_id: transaction_id || null,
      paid_at: new Date(),
      payment_metadata: {
        ...payment.payment_metadata,
        confirmed_at: new Date()
      }
    });

    // Auto-complete for cash payments (no verification needed)
    if (payment.payment_method === 'cash') {
      await payment.update({
        status: 'completed',
        completed_at: new Date()
      });
    }

    // Send SMS to seller
    try {
      await smsService.sendNotification({
        userId: payment.payee_id,
        phoneNumber: payment.offer.offerProduct.seller.phone,
        type: 'payment_confirmed',
        data: {
          amount: payment.amount,
          productTitle: payment.offer.offerProduct.title
        }
      });
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
    }

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        { model: Offer, as: 'offer', include: [{ model: Product, as: 'offerProduct' }] },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: User, as: 'payee', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: updatedPayment
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

/**
 * Release escrow (seller confirms buyer received item)
 * @route POST /api/payments/:id/release-escrow
 */
exports.releaseEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [{ model: Product, as: 'offerProduct' }]
        },
        { model: User, as: 'payer', attributes: ['id', 'name', 'phone'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user is the payee (seller)
    if (payment.payee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can release escrow'
      });
    }

    // Verify payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only release escrow for completed payments'
      });
    }

    // Verify escrow is held
    if (payment.escrow_status !== 'held') {
      return res.status(400).json({
        success: false,
        message: `Escrow already ${payment.escrow_status}`
      });
    }

    // Release escrow
    await payment.update({
      escrow_status: 'released',
      payment_metadata: {
        ...payment.payment_metadata,
        escrow_released_at: new Date()
      }
    });

    // Update seller's sales count
    await User.increment('total_sales', {
      by: 1,
      where: { id: userId }
    });

    // Mark product as sold
    await Product.update(
      { status: 'sold' },
      { where: { id: payment.offer.product_id } }
    );

    res.json({
      success: true,
      message: 'Escrow released successfully. Funds will be transferred to your mobile money account.',
      data: payment
    });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    res.status(500).json({
      success: false,
      message: 'Error releasing escrow',
      error: error.message
    });
  }
};

/**
 * Request refund
 * @route POST /api/payments/:id/refund
 */
exports.requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed reason for the refund (minimum 10 characters)'
      });
    }

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user is the payer
    if (payment.payer_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can request a refund'
      });
    }

    // Verify payment can be refunded
    if (!['completed', 'processing'].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: 'This payment cannot be refunded'
      });
    }

    // Verify escrow hasn't been released
    if (payment.escrow_status === 'released') {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund - escrow has already been released to seller'
      });
    }

    // Update payment to refunded
    await payment.update({
      status: 'refunded',
      escrow_status: 'refunded',
      refunded_at: new Date(),
      payment_metadata: {
        ...payment.payment_metadata,
        refund_reason: reason,
        refunded_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Refund processed successfully. Funds will be returned to your mobile money account.',
      data: payment
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [{ model: Product, as: 'offerProduct', attributes: ['id', 'title', 'images'] }]
        },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: User, as: 'payee', attributes: ['id', 'name'] },
        { model: MobileMoneyAccount, as: 'mobileMoneyAccount', attributes: ['provider', 'phone_number'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify user is involved in this payment
    if (payment.payer_id !== userId && payment.payee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this payment'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

/**
 * Get user's payment history
 * @route GET /api/payments/my-payments
 */
exports.getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = {};

    // Filter by payment type (sent or received)
    if (type === 'sent') {
      where.payer_id = userId;
    } else if (type === 'received') {
      where.payee_id = userId;
    } else {
      where[Op.or] = [{ payer_id: userId }, { payee_id: userId }];
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Offer,
          as: 'offer',
          include: [{ model: Product, as: 'offerProduct', attributes: ['id', 'title', 'images'] }]
        },
        { model: User, as: 'payer', attributes: ['id', 'name'] },
        { model: User, as: 'payee', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate totals
    const totals = await Payment.findAll({
      where,
      attributes: [
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total_amount'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('platform_fee')), 'total_fees']
      ],
      raw: true
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totals: {
        amount: parseFloat(totals[0]?.total_amount || 0),
        fees: parseFloat(totals[0]?.total_fees || 0)
      },
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

/**
 * Get payment statistics for user
 * @route GET /api/payments/stats
 */
exports.getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get sent payments stats
    const sentStats = await Payment.findOne({
      where: { payer_id: userId, status: 'completed' },
      attributes: [
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']
      ],
      raw: true
    });

    // Get received payments stats
    const receivedStats = await Payment.findOne({
      where: { payee_id: userId, status: 'completed', escrow_status: 'released' },
      attributes: [
        [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
        [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total']
      ],
      raw: true
    });

    // Get pending payments
    const pendingCount = await Payment.count({
      where: {
        [Op.or]: [{ payer_id: userId }, { payee_id: userId }],
        status: { [Op.in]: ['pending', 'processing'] }
      }
    });

    res.json({
      success: true,
      data: {
        sent: {
          count: parseInt(sentStats?.count || 0),
          total: parseFloat(sentStats?.total || 0)
        },
        received: {
          count: parseInt(receivedStats?.count || 0),
          total: parseFloat(receivedStats?.total || 0)
        },
        pending: pendingCount
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: error.message
    });
  }
};
