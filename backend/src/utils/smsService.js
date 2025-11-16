const twilio = require('twilio')

// Initialize Twilio client
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

/**
 * Send SMS message
 * @param {string} to - Phone number (without country code)
 * @param {string} message - SMS message content
 */
exports.sendSMS = async (to, message) => {
  // Skip in test environment
  if (process.env.NODE_ENV === 'test') {
    console.log(`📱 [TEST] SMS to +231${to}: ${message}`)
    return { success: true, mock: true }
  }

  // Log if Twilio not configured
  if (!client) {
    console.warn('⚠️ Twilio not configured. SMS not sent.')
    console.log(`📱 Would send to +231${to}: ${message}`)
    return { success: false, reason: 'SMS service not configured' }
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+231${to}` // Prepend Liberian country code
    })

    console.log(`✅ SMS sent to +231${to} - SID: ${result.sid}`)
    return { success: true, sid: result.sid }
  } catch (error) {
    console.error('❌ Failed to send SMS:', error.message)
    // Don't throw - let the app continue
    return { success: false, error: error.message }
  }
}

/**
 * Send verification code SMS
 * @param {string} phone - Phone number
 * @param {string} code - Verification code
 */
exports.sendVerificationCode = async (phone, code) => {
  const message = `LibMarket verification code: ${code}\n\nThis code expires in 10 minutes.`
  return await exports.sendSMS(phone, message)
}

/**
 * Send product inquiry notification to seller
 * @param {string} sellerPhone - Seller's phone
 * @param {string} productTitle - Product title
 * @param {string} buyerPhone - Buyer's phone
 */
exports.notifySeller = async (sellerPhone, productTitle, buyerPhone) => {
  const message = `LibMarket: A buyer (+231${buyerPhone}) is interested in your product "${productTitle}". Please contact them.`
  return await exports.sendSMS(sellerPhone, message)
}
