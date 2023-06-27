import models from '../models';
import loggers from '../services/logger.service';
import stripe from '../services/stripe.service';

const { PaymentCard } = models;

export default {
  /**
   * Add Payment Card
   * @param {object} req
   * @returns
   */
  async addPaymentCard(req) {
    try {
      const {
        body: {
          cardNumber, expMonth, expYear, cvc, cardHolderName, cardTag,
        },
        user: { stripeCustomerId, id },
      } = req;
      const source = {
        name: cardHolderName,
        object: 'card',
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
      };
      const card = await stripe.createCard(source, stripeCustomerId);
      const cardDetails = {
        cardHolder: cardHolderName,
        userId: id,
        cardId: card.id,
        brand: card.brand,
        lastDigit: card.last4,
        cardTag,
      };
      return await PaymentCard.create(cardDetails);
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },
  /**
   * Get all Saved Payment Cards Of a Customer
   * @param {object} req
   * @returns
   */
  async getSavedPaymentCardOfCustomer(req) {
    try {
      const {
        query: { limit, offset, scope },
        user: { id },
      } = req;
      const where = {
        userId: id,
      };
      const orderBy = [['createdAt', 'DESC']];
      const defaultScope = 'notDeletedPaymentCard';
      const scopes = scope || defaultScope;
      let searchCriteria = { order: orderBy, where };

      if (scopes === 'notDeletedPaymentCard') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await PaymentCard.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(
        `Card List list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Find Payment Card
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await PaymentCard.scope('notDeletedPaymentCard').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Payment Card details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update Payment Card
   * @param {object} req
   * @returns
   */
  async updatePaymentCard(req) {
    try {
      const {
        body,
        params: { id },
      } = req;
      const result = await PaymentCard.update(body, { where: { id } });
      return result;
    } catch (error) {
      loggers.error(`CMS update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Update Payment Card
   * @param {object} req
   * @returns
   */
  async defaultePaymentCard(req) {
    try {
      const {
        paymentCard: { cardId },
        user: { stripeCustomerId },
      } = req;
      const result = await stripe.defaultCard(stripeCustomerId, cardId);
      return result;
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },
};
