import braintree from 'braintree';

import config from '../config';

export default {

  /**
   *
   * @returns Create brain tree token
   */
  gateway() {
    try {
      const {
        brainTreeApiKey: {
          merchantId, publicKey, privateKey,
        },
      } = config;
      const result = new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId,
        publicKey,
        privateKey,
      });
      return result;
    } catch (error) {
      throw Error(error);
    }
  },

  async createToken() {
    try {
      return await this.gateway().clientToken.generate();
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @returns Create transaction
   */
  async createTransaction(data) {
    try {
      return await this.gateway().transaction.sale(data);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @returns Refund amount on cancel order
   */
  async refundOrder(transactionId) {
    try {
      return await this.gateway().transaction.refund(transactionId);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @returns webhook parse
   */
  async webhookNotification(req) {
    try {
      return await this.gateway().webhookNotification.parse(
        req.body.bt_signature,
        req.body.bt_payload,
      );
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @returns Refund amount on cancel order
   */
  async voidOrder(transactionId) {
    try {
      return await this.gateway().transaction.void(transactionId);
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @returns Get current payment status
   */
  async getCurrentTransactionStatus(transactionId) {
    try {
      return await this.gateway().transaction.find(transactionId);
    } catch (error) {
      throw Error(error);
    }
  },
};
