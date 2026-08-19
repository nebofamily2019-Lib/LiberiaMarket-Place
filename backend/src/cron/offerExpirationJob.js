const cron = require('node-cron');
const { Offer } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

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

    } catch (error) {
      logger.error('Error in offer expiration job:', error);
    }
  });
  
  logger.info('✅ Offer expiration cron job scheduled (runs hourly).');
};

module.exports = startOfferExpirationJob;
