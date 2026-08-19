const { SmsLog, User } = require('../models');

/**
 * SMS Service for sending notifications via Twilio or Africa's Talking
 *
 * Environment Variables Required:
 * - SMS_PROVIDER: 'twilio' or 'africas_talking'
 * - SMS_ENABLED: 'true' or 'false'
 *
 * For Twilio:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 *
 * For Africa's Talking:
 * - AFRICAS_TALKING_API_KEY
 * - AFRICAS_TALKING_USERNAME
 * - AFRICAS_TALKING_SENDER_ID
 */

class SmsService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'twilio';
    this.enabled = process.env.SMS_ENABLED === 'true';
    this.client = null;

    if (this.enabled) {
      this.initializeProvider();
    }
  }

  initializeProvider() {
    try {
      if (this.provider === 'twilio') {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
          console.warn('⚠️  Twilio credentials not configured. SMS disabled.');
          this.enabled = false;
          return;
        }

        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
        console.log('✅ Twilio SMS client initialized');
      } else if (this.provider === 'africas_talking') {
        const apiKey = process.env.AFRICAS_TALKING_API_KEY;
        const username = process.env.AFRICAS_TALKING_USERNAME;

        if (!apiKey || !username) {
          console.warn("⚠️  Africa's Talking credentials not configured. SMS disabled.");
          this.enabled = false;
          return;
        }

        const AfricasTalking = require('africastalking');
        const AT = AfricasTalking({
          apiKey,
          username
        });
        this.client = AT.SMS;
        console.log("✅ Africa's Talking SMS client initialized");
      }
    } catch (error) {
      console.error('Error initializing SMS provider:', error);
      this.enabled = false;
    }
  }

  /**
   * Format phone number for Liberia
   * Converts 9-digit local to international format (+231...)
   */
  formatPhoneNumber(phone) {
    // Remove spaces and dashes
    phone = phone.replace(/[\s-]/g, '');

    // If already in international format, return as is
    if (phone.startsWith('+231')) {
      return phone;
    }

    // If 9 digits (local format), add country code
    if (/^\d{9}$/.test(phone)) {
      return `+231${phone}`;
    }

    return phone;
  }

  /**
   * Send SMS notification
   */
  async sendSms({ userId, phoneNumber, message, type = 'general' }) {
    try {
      // If SMS disabled, just log it
      if (!this.enabled) {
        console.log(`[SMS Mock] To: ${phoneNumber}, Type: ${type}, Message: ${message}`);
        return { success: true, mock: true };
      }

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Check user preferences if userId provided
      if (userId) {
        const user = await User.findByPk(userId, {
          attributes: ['sms_notifications_enabled', 'sms_preferences']
        });

        if (!user || !user.sms_notifications_enabled) {
          console.log(`User ${userId} has SMS notifications disabled`);
          return { success: false, reason: 'User disabled SMS' };
        }

        // Check specific notification type preference
        if (user.sms_preferences && user.sms_preferences[type] === false) {
          console.log(`User ${userId} has ${type} SMS disabled`);
          return { success: false, reason: `User disabled ${type} SMS` };
        }
      }

      // Create SMS log entry
      const smsLog = await SmsLog.create({
        user_id: userId || null,
        phone_number: formattedPhone,
        message,
        type,
        status: 'pending',
        provider: this.provider
      });

      let result;

      // Send via provider
      if (this.provider === 'twilio') {
        result = await this.sendViaTwilio(formattedPhone, message, smsLog.id);
      } else if (this.provider === 'africas_talking') {
        result = await this.sendViaAfricasTalking(formattedPhone, message, smsLog.id);
      }

      return result;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS via Twilio
   */
  async sendViaTwilio(phoneNumber, message, logId) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      // Update log
      await SmsLog.update(
        {
          status: 'sent',
          provider_message_id: result.sid,
          cost: parseFloat(result.price || 0) * -1, // Twilio prices are negative
          sent_at: new Date()
        },
        { where: { id: logId } }
      );

      return { success: true, messageId: result.sid };
    } catch (error) {
      // Update log with error
      await SmsLog.update(
        {
          status: 'failed',
          error_message: error.message
        },
        { where: { id: logId } }
      );

      throw error;
    }
  }

  /**
   * Send SMS via Africa's Talking
   */
  async sendViaAfricasTalking(phoneNumber, message, logId) {
    try {
      const result = await this.client.send({
        to: [phoneNumber],
        message,
        from: process.env.AFRICAS_TALKING_SENDER_ID || null
      });

      const recipient = result.SMSMessageData.Recipients[0];
      const success = recipient.statusCode === 101; // 101 = success

      // Update log
      await SmsLog.update(
        {
          status: success ? 'sent' : 'failed',
          provider_message_id: recipient.messageId,
          cost: parseFloat(recipient.cost || 0),
          sent_at: success ? new Date() : null,
          error_message: success ? null : recipient.status
        },
        { where: { id: logId } }
      );

      return { success, messageId: recipient.messageId };
    } catch (error) {
      // Update log with error
      await SmsLog.update(
        {
          status: 'failed',
          error_message: error.message
        },
        { where: { id: logId } }
      );

      throw error;
    }
  }

  /**
   * Send predefined notification types
   */
  async sendNotification({ userId, phoneNumber, type, data }) {
    const messages = {
      new_message: (data) =>
        `New message from ${data.senderName} about "${data.productTitle}". Check your inbox!`,

      offer_received: (data) =>
        `New offer: $${data.amount} USD for "${data.productTitle}". View offers to respond!`,

      offer_accepted: (data) =>
        `Your offer of $${data.amount} USD for "${data.productTitle}" was accepted! Arrange payment.`,

      offer_rejected: (data) =>
        `Your offer for "${data.productTitle}" was declined. You can make another offer.`,

      payment_request: (data) =>
        `Payment requested: $${data.amount} USD for "${data.productTitle}". Complete payment to proceed.`,

      payment_confirmed: (data) =>
        `Payment received: $${data.amount} USD. Arrange pickup for "${data.productTitle}".`,

      price_drop: (data) =>
        `Price drop! "${data.productTitle}" now $${data.newPrice} (was $${data.oldPrice}). Act fast!`,

      verification: (data) =>
        `Your verification code: ${data.code}. Valid for 10 minutes. LibMarket`
    };

    const message = messages[type] ? messages[type](data) : data.message;

    return await this.sendSms({
      userId,
      phoneNumber,
      message,
      type
    });
  }
}

// Export singleton instance
module.exports = new SmsService();
