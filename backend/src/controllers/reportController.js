const { Report, Product, User } = require('../models');
const logger = require('../utils/logger');

// @desc    Submit a report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { reported_user_id, product_id, reason, description } = req.body;
    const reporter_id = req.user.id;

    // A report can target a specific user or product, or — for a general
    // platform issue not tied to either — must at least explain the problem.
    if (!reported_user_id && !product_id && !(description && description.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Specify a user or listing to report, or describe the issue'
      });
    }

    // Verify existence of reported entities
    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
    }

    if (reported_user_id) {
      const user = await User.findByPk(reported_user_id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
    }

    const report = await Report.create({
      reporter_id,
      reported_user_id,
      product_id,
      reason,
      description,
      status: 'pending'
    });

    logger.info(`New report submitted by user ${reporter_id}`, { reportId: report.id });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. We will review it shortly.',
      data: report
    });
  } catch (error) {
    logger.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  createReport
};
