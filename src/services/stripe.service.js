import Stripe from 'stripe';
import config from '../config';

export default {
  /**
   * Create stripe customer
   * @param {*} data
   * @returns
   */
  async createCustomer(data) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      const result = await stripe.customers.create(data);
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Create stripe card
   * @param {*} data
   * @returns
   */
  async createCard(source, stripeCustomerId) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      const token = await stripe.tokens.create({ card: source });
      const result = await stripe.customers.createSource(stripeCustomerId, { source: token.id });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Create payment intent
   * @param {* amount , currency type} data
   * @returns
   */
  async createPaymentIntent(data) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      const result = await stripe.paymentIntents.create(data);
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * make card default
   * @param {*} data
   * @returns
   */
  async defaultCard(stripeCustomerId, cardId) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      const result = await stripe.customers.update(stripeCustomerId, {
        default_source: cardId,
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *create charge
   * @param {*} data
   * @returns
   */
  async createCharge(data) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      return await stripe.charges.create(data);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *Webhook event
   * @param {*} data
   * @returns
   */
  async getWebHook(sig, bodyData) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      return stripe.webhooks.constructEvent(bodyData, sig, config.stripe.webHookSecret);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Refund charge amount
   * @param {*} data
   * @returns
   */
  async RefundCharge(charge, orderId) {
    try {
      const stripe = new Stripe(config.stripe.secretKey);
      return await stripe.refunds.create({ charge, metadata: { orderId } });
    } catch (error) {
      throw Error(error);
    }
  },

};
