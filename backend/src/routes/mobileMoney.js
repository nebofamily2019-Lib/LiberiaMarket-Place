const express = require('express');
const router = express.Router();
const mobileMoneyController = require('../controllers/mobileMoneyController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/mobile-money/providers
 * @desc    Get list of supported mobile money providers
 * @access  Public
 */
router.get('/providers', mobileMoneyController.getProviders);

/**
 * @route   GET /api/mobile-money/accounts
 * @desc    Get all mobile money accounts for logged-in user
 * @access  Private
 */
router.get('/accounts', protect, mobileMoneyController.getMyAccounts);

/**
 * @route   POST /api/mobile-money/accounts
 * @desc    Add a new mobile money account
 * @access  Private
 */
router.post('/accounts', protect, mobileMoneyController.addAccount);

/**
 * @route   POST /api/mobile-money/accounts/:id/verify
 * @desc    Send verification code to mobile money account
 * @access  Private
 */
router.post('/accounts/:id/verify', protect, mobileMoneyController.sendVerificationCode);

/**
 * @route   POST /api/mobile-money/accounts/:id/confirm
 * @desc    Confirm verification with code
 * @access  Private
 */
router.post('/accounts/:id/confirm', protect, mobileMoneyController.confirmVerification);

/**
 * @route   PUT /api/mobile-money/accounts/:id/primary
 * @desc    Set mobile money account as primary
 * @access  Private
 */
router.put('/accounts/:id/primary', protect, mobileMoneyController.setPrimaryAccount);

/**
 * @route   DELETE /api/mobile-money/accounts/:id
 * @desc    Delete mobile money account
 * @access  Private
 */
router.delete('/accounts/:id', protect, mobileMoneyController.deleteAccount);

module.exports = router;
