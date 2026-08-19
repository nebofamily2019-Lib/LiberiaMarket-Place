const { MobileMoneyAccount, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all mobile money accounts for logged-in user
 * @route GET /api/mobile-money/accounts
 */
exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await MobileMoneyAccount.findAll({
      where: { user_id: req.user.id },
      order: [
        ['is_primary', 'DESC'],
        ['created_at', 'DESC']
      ],
      attributes: { exclude: ['verification_code', 'verification_expires_at'] }
    });

    res.json({
      success: true,
      count: accounts.length,
      data: accounts
    });
  } catch (error) {
    console.error('Error fetching mobile money accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts',
      error: error.message
    });
  }
};

/**
 * Add a new mobile money account
 * @route POST /api/mobile-money/accounts
 */
exports.addAccount = async (req, res) => {
  try {
    const { provider, phone_number, account_name } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!provider || !phone_number || !account_name) {
      return res.status(400).json({
        success: false,
        message: 'Provider, phone number, and account name are required'
      });
    }

    // Validate provider
    const validProviders = ['orange_money', 'mtn_mobile_money', 'lonestar_money'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Must be one of: orange_money, mtn_mobile_money, lonestar_money'
      });
    }

    // Validate Liberian phone number format
    const phoneRegex = /^(\+231)?\d{9}$/;
    if (!phoneRegex.test(phone_number.replace(/[\s-]/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Liberian phone number. Must be 9 digits or +231 followed by 9 digits'
      });
    }

    // Check if account already exists for this user and provider
    const existingAccount = await MobileMoneyAccount.findOne({
      where: {
        user_id: userId,
        provider,
        phone_number: phone_number.replace(/[\s-]/g, '')
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'This mobile money account is already registered'
      });
    }

    // Check if this is user's first account (make it primary)
    const accountCount = await MobileMoneyAccount.count({
      where: { user_id: userId }
    });
    const isPrimary = accountCount === 0;

    // Auto-verify if the phone number matches the user's login phone number
    const user = await User.findByPk(userId);
    const normalizedInputPhone = phone_number.replace(/[\s-]/g, '').replace(/^\+231/, '').replace(/^0/, '');
    const normalizedUserPhone = user.phone.replace(/[\s-]/g, '').replace(/^\+231/, '').replace(/^0/, '');
    
    const isMatchingUserPhone = normalizedInputPhone === normalizedUserPhone;
    const isVerified = isMatchingUserPhone; // Auto-verify if matches

    // Create account
    const account = await MobileMoneyAccount.create({
      user_id: userId,
      provider,
      phone_number: phone_number.replace(/[\s-]/g, ''),
      account_name,
      is_verified: isVerified,
      is_primary: isPrimary
    });

    // Don't send verification code in response
    const accountData = account.toJSON();
    delete accountData.verification_code;
    delete accountData.verification_expires_at;

    res.status(201).json({
      success: true,
      message: 'Mobile money account added successfully',
      data: accountData
    });
  } catch (error) {
    console.error('Error adding mobile money account:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding account',
      error: error.message
    });
  }
};

/**
 * Send verification code to mobile money account
 * @route POST /api/mobile-money/accounts/:id/verify
 */
exports.sendVerificationCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await MobileMoneyAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update account with verification code
    await account.update({
      verification_code: verificationCode,
      verification_expires_at: expiresAt
    });

    // TODO: Send SMS with verification code
    // const smsService = require('../services/smsService');
    // await smsService.sendNotification({
    //   userId: userId,
    //   phoneNumber: account.phone_number,
    //   type: 'verification',
    //   data: { code: verificationCode }
    // });

    // In development, return the code (remove in production!)
    const response = {
      success: true,
      message: 'Verification code sent to your mobile money number'
    };

    if (process.env.NODE_ENV === 'development') {
      response.verificationCode = verificationCode; // Only for testing!
    }

    res.json(response);
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification code',
      error: error.message
    });
  }
};

/**
 * Verify mobile money account with code
 * @route POST /api/mobile-money/accounts/:id/confirm
 */
exports.confirmVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    const account = await MobileMoneyAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (account.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account is already verified'
      });
    }

    // Check if code expired
    if (!account.verification_expires_at || account.verification_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Check if code matches
    if (account.verification_code !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark account as verified
    await account.update({
      is_verified: true,
      verification_code: null,
      verification_expires_at: null
    });

    const accountData = account.toJSON();
    delete accountData.verification_code;
    delete accountData.verification_expires_at;

    res.json({
      success: true,
      message: 'Account verified successfully',
      data: accountData
    });
  } catch (error) {
    console.error('Error confirming verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming verification',
      error: error.message
    });
  }
};

/**
 * Set primary mobile money account
 * @route PUT /api/mobile-money/accounts/:id/primary
 */
exports.setPrimaryAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await MobileMoneyAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    if (!account.is_verified) {
      return res.status(400).json({
        success: false,
        message: 'Account must be verified before setting as primary'
      });
    }

    // Remove primary flag from all other accounts
    await MobileMoneyAccount.update(
      { is_primary: false },
      { where: { user_id: userId } }
    );

    // Set this account as primary
    await account.update({ is_primary: true });

    res.json({
      success: true,
      message: 'Primary account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Error setting primary account:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting primary account',
      error: error.message
    });
  }
};

/**
 * Delete mobile money account
 * @route DELETE /api/mobile-money/accounts/:id
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const account = await MobileMoneyAccount.findOne({
      where: { id, user_id: userId }
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // Check if account has been used in any payments
    const { Payment } = require('../models');
    const paymentCount = await Payment.count({
      where: { mobile_money_account_id: id }
    });

    if (paymentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with existing payment history. You can mark it as inactive instead.'
      });
    }

    await account.destroy();

    // If this was the primary account, set another as primary
    if (account.is_primary) {
      const nextAccount = await MobileMoneyAccount.findOne({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      if (nextAccount) {
        await nextAccount.update({ is_primary: true });
      }
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

/**
 * Get mobile money providers
 * @route GET /api/mobile-money/providers
 */
exports.getProviders = async (req, res) => {
  try {
    const providers = [
      {
        id: 'orange_money',
        name: 'Orange Money',
        icon: '🟠',
        color: '#FF7900',
        shortCode: '*144#',
        description: 'Orange Money Liberia'
      },
      {
        id: 'mtn_mobile_money',
        name: 'MTN Mobile Money',
        icon: '🟡',
        color: '#FFCC00',
        shortCode: '*123#',
        description: 'MTN MoMo Liberia'
      },
      {
        id: 'lonestar_money',
        name: 'Lonestar Money',
        icon: '⭐',
        color: '#00539F',
        shortCode: '*770#',
        description: 'Lonestar Cell MTN'
      }
    ];

    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching providers',
      error: error.message
    });
  }
};
