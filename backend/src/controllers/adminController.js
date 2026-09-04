const { Product, User, Offer, Report, Category } = require('../models');
const { Op } = require('sequelize');
const { calculatePlatformFee, PLATFORM_FEE_RATE } = require('../utils/platformFee');
const logger = require('../utils/logger');

const SELLER_ATTRS = ['id', 'name', 'phone', 'email'];
const BUYER_ATTRS = ['id', 'name', 'phone', 'email'];

// @desc    Platform-wide fee totals (items sold, sales value, fees collected)
// @route   GET /api/admin/fees/summary
// @access  Private (Admin)
const getFeeSummary = async (req, res, next) => {
  try {
    const soldProducts = await Product.findAll({
      where: { status: 'sold' },
      attributes: ['sold_price']
    });

    const totalItemsSold = soldProducts.length;
    const totalSoldValue = soldProducts.reduce((sum, p) => sum + (parseFloat(p.sold_price) || 0), 0);
    const { fee: totalFeesCollected, netPayout: totalPaidToSellers } = calculatePlatformFee(totalSoldValue);

    res.status(200).json({
      success: true,
      data: {
        totalItemsSold,
        totalSoldValue,
        totalFeesCollected,
        totalPaidToSellers,
        feeRate: PLATFORM_FEE_RATE
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List every fee charged (one row per sold item) with seller/buyer/amount
// @route   GET /api/admin/fees
// @access  Private (Admin)
const getFeeCollections = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, startDate, endDate } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const where = { status: 'sold' };

    if (startDate || endDate) {
      where.sold_at = {};
      if (startDate) where.sold_at[Op.gte] = new Date(startDate);
      if (endDate) where.sold_at[Op.lte] = new Date(endDate);
    }

    if (search && search.trim()) {
      where.title = { [Op.like]: `%${search.trim()}%` };
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      attributes: ['id', 'title', 'sold_price', 'sold_at', 'buyer_id', 'seller_id', 'images'],
      include: [
        { model: User, as: 'seller', attributes: SELLER_ATTRS },
        { model: User, as: 'buyer', attributes: BUYER_ATTRS }
      ],
      order: [['sold_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Products sold through the offer-based delivery-confirmation flow never
    // get buyer_id written onto the product row (only markAsSold/buyNow do
    // that) — backfill those from their completed offer instead.
    const missingBuyerProductIds = products.filter(p => !p.buyer_id).map(p => p.id);
    const offerBuyerByProduct = {};
    if (missingBuyerProductIds.length > 0) {
      const offers = await Offer.findAll({
        where: { product_id: { [Op.in]: missingBuyerProductIds }, status: 'completed' },
        attributes: ['product_id', 'buyer_id', 'updated_at'],
        include: [{ model: User, as: 'buyer', attributes: BUYER_ATTRS }],
        order: [['updated_at', 'DESC']]
      });
      offers.forEach((offer) => {
        if (!offerBuyerByProduct[offer.product_id]) {
          offerBuyerByProduct[offer.product_id] = offer.buyer;
        }
      });
    }

    const data = products.map((product) => {
      const { fee, netPayout } = calculatePlatformFee(product.sold_price);
      return {
        product_id: product.id,
        title: product.title,
        images: product.images,
        sold_price: parseFloat(product.sold_price) || 0,
        platform_fee: fee,
        seller_net: netPayout,
        sold_at: product.sold_at,
        seller: product.seller,
        buyer: product.buyer || offerBuyerByProduct[product.id] || null
      };
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      feeRate: PLATFORM_FEE_RATE,
      data
    });
  } catch (error) {
    next(error);
  }
};

const REPORT_USER_ATTRS = ['id', 'name', 'phone', 'email', 'isActive'];

// @desc    List moderation reports (reported users/listings), filterable by status
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: REPORT_USER_ATTRS },
        { model: User, as: 'reportedUser', attributes: REPORT_USER_ATTRS },
        { model: Product, as: 'product', attributes: ['id', 'title', 'status', 'images', 'seller_id'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a report's status/notes (dismiss, mark resolved/investigating)
// @route   PATCH /api/admin/reports/:id
// @access  Private (Admin)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }

    const report = await Report.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    await report.update({ status, admin_notes: admin_notes ?? report.admin_notes });
    logger.info(`Report ${report.id} set to ${status} by admin ${req.user.id}`);

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend a user account (blocks login, ends existing sessions immediately)
// @route   POST /api/admin/users/:id/suspend
// @access  Private (Admin)
const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot suspend an admin account' });
    }

    await user.update({ isActive: false });
    await user.increment('token_version');
    logger.info(`User ${user.id} suspended by admin ${req.user.id}`);

    res.status(200).json({ success: true, data: { id: user.id, isActive: false } });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate a suspended user account
// @route   POST /api/admin/users/:id/reactivate
// @access  Private (Admin)
const reactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await user.update({ isActive: true });
    logger.info(`User ${user.id} reactivated by admin ${req.user.id}`);

    res.status(200).json({ success: true, data: { id: user.id, isActive: true } });
  } catch (error) {
    next(error);
  }
};

// @desc    Browse every listing on the platform, any status, any seller
// @route   GET /api/admin/listings
// @access  Private (Admin)
const getListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, sellerSearch } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search && search.trim()) {
      where.title = { [Op.like]: `%${search.trim()}%` };
    }

    const hasSellerSearch = Boolean(sellerSearch && sellerSearch.trim());
    const sellerWhere = hasSellerSearch
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${sellerSearch.trim()}%` } },
            { phone: { [Op.like]: `%${sellerSearch.trim()}%` } }
          ]
        }
      : undefined;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'isActive'],
          where: sellerWhere,
          required: hasSellerSearch
        },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFeeSummary,
  getFeeCollections,
  getReports,
  updateReportStatus,
  suspendUser,
  reactivateUser,
  getListings
};
