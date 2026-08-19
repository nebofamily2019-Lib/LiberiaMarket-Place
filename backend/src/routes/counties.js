const express = require('express');
const router = express.Router();
const countyController = require('../controllers/countyController');

/**
 * @route   GET /api/counties
 * @desc    Get all Liberian counties
 * @access  Public
 */
router.get('/', countyController.getAllCounties);

/**
 * @route   GET /api/counties/stats
 * @desc    Get counties with product counts
 * @access  Public
 */
router.get('/stats', countyController.getCountyStats);

/**
 * @route   GET /api/counties/:id
 * @desc    Get single county by ID
 * @access  Public
 */
router.get('/:id', countyController.getCountyById);

/**
 * @route   GET /api/counties/:id/products
 * @desc    Get products in a specific county
 * @access  Public
 */
router.get('/:id/products', countyController.getCountyProducts);

module.exports = router;
