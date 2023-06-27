import axios from 'axios';

import config from '../config';
import loggers from './logger.service';

const {
  paypalApiKey: {
    clintId, secret, successUrl, cancelUrl,
    apiUrl,
  },
} = config;

export default {
  /** Create checkout order
   *
   * @param {*} payAmount
   * @returns
   */
  async createOrder(payAmount) {
    try {
      const data = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: payAmount,
            },
          },
        ],
        application_context: {
          return_url: successUrl,
          cancel_url: cancelUrl,
        },
      };
      const axiosData = {
        method: 'post',
        url: `${apiUrl}/v2/checkout/orders`,
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: clintId,
          password: secret,
        },
        data,
      };
      return await axios(axiosData);
    } catch (error) {
      const err = JSON.stringify(error?.response?.data) || error;
      loggers.error(`paypal order  error: ${err} `);

      throw Error(err);
    }
  },

  /** Capture payment
   *
   * @param {*} payAmount
   * @returns
   */
  async capturePayment(orderId) {
    try {
      const axiosData = {
        method: 'post',
        url: `${apiUrl}/v2/checkout/orders/${orderId}/capture`,
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: clintId,
          password: secret,
        },
      };
      const result = await axios(axiosData);
      return result?.data || result;
    } catch (error) {
      const err = error?.response?.data?.details[0]?.description
      || JSON.stringify(error?.response?.data) || error;
      loggers.error(`paypal capture error: ${err} `);
      throw Error(err);
    }
  },

  /** Refund payment
   *
   * @param {*} payAmount
   * @returns
   */
  async refundPayment(orderId) {
    try {
      const axiosData = {
        method: 'post',
        url: `${apiUrl}/v2/payments/captures/${orderId}/refund`,
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: clintId,
          password: secret,
        },
      };
      const result = await axios(axiosData);
      return result?.data || result;
    } catch (error) {
      const err = error?.response?.data?.details[0]?.description
      || JSON.stringify(error?.response?.data) || error;
      loggers.error(`paypal refund  error: ${err} `);
      throw Error(err);
    }
  },
};
