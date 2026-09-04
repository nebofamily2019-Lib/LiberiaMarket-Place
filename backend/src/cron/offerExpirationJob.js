const cron = require('node-cron');
const { Offer } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { completeTransaction } = require('../controllers/offerController');

const AUTO_RESOLVE_HOURS = 48;

// Seller confirmed delivery but the buyer never responded — after 48 hours,
// resolve in the seller's favor rather than leaving the deal stuck forever.
const autoResolveUnconfirmedDeliveries = async () => {
  const cutoff = new Date(Date.now() - AUTO_RESOLVE_HOURS * 60 * 60 * 1000);

  const staleOffers = await Offer.findAll({
    where: {
      status: 'accepted',
      seller_confirmed: true,
      buyer_confirmed: false,
      seller_confirmed_at: { [Op.lt]: cutoff }
    }
  });

  for (const offer of staleOffers) {
    try {
      await completeTransaction(offer);
      logger.info(`Auto-resolved offer ${offer.id} after ${AUTO_RESOLVE_HOURS}h of no buyer response`);
    } catch (error) {
      logger.error(`Failed to auto-resolve offer ${offer.id}:`, error);
    }
  }

  if (staleOffers.length > 0) {
    logger.info(`Auto-resolved ${staleOffers.length} unconfirmed deliveries.`);
  }
};

const startOfferExpirationJob = () => {
  // Run every hour: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    logger.info('Running offer expiration check...');
    try {
      const now = new Date();

      // Find expired offers
      const expiredOffers = await Offer.findAll({
        where: {
          status: { [Op.in]: ['pending', 'countered'] },
          expires_at: { [Op.lt]: now }
        }
      });

      if (expiredOffers.length > 0) {
        const ids = expiredOffers.map(o => o.id);

        // Update status to expired
        await Offer.update(
          { status: 'expired' },
          {
            where: {
              id: { [Op.in]: ids }
            }
          }
        );

        logger.info(`Expired ${expiredOffers.length} offers: ${ids.join(', ')}`);

        // TODO: Send notifications to users about expired offers
      } else {
        logger.info('No expired offers found.');
      }

      await autoResolveUnconfirmedDeliveries();
    } catch (error) {
      logger.error('Error in offer expiration job:', error);
    }
  });

  logger.info('✅ Offer expiration cron job scheduled (runs hourly).');
};

module.exports = startOfferExpirationJob;
