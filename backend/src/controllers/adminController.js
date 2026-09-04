const { Product, User, Report, Category } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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
  getReports,
  updateReportStatus,
  suspendUser,
  reactivateUser,
  getListings
};
