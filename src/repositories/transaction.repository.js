import models from '../models';
import loggers from '../services/logger.service';
import stripe from '../services/stripe.service';
// import brainTreeService from '../services/brainTree.service';
import paypalService from '../services/paypal.service';

const {
  Transaction,
} = models;

export default {

  /**
   * Get all setting
   * @param {Object} req
   */
  async createTransaction(req, transaction) {
    try {
      const {
        orderId,
        user: { stripeCustomerId },
        body: {
          orderTotal, cardId, paymentTransactionId, paymentResponse, paymentTransactionStatus,
          nonce,
        },
        headers: { currencycode },
        paymentOption,
      } = req;
      const totalAmount = orderTotal * 100;
      let chargeStatus = '';
      let createIntent;
      if (paymentOption === 'stripe') {
        const charge = {
          amount: parseInt(totalAmount.toFixed(2), 10),
          currency: currencycode,
          source: cardId,
          customer: stripeCustomerId,
          description: 'order charge',
          metadata: { orderId },
        };
        createIntent = await stripe.createCharge(charge);
        chargeStatus = createIntent.status === 'succeeded' ? 'success' : 'failed';
      }

      if (paymentOption === 'paypal') {
        // createIntent = await paypalService.createTransaction({  it is paypal code
        //   amount: orderTotalUsd,
        //   paymentMethodNonce: nonce,
        //   options: {
        //     submitForSettlement: true,
        //   },
        // });
        createIntent = await paypalService.capturePayment(
          nonce,
        );
        // console.log('data is ', createIntent);

        chargeStatus = ['COMPLETED'].includes(createIntent?.status) ? 'success' : 'failed';
        createIntent.status = createIntent?.status ?? 'failed';
      }
      const paymentStatusData = paymentTransactionStatus === 'success' ? 'success' : 'failed';
      const transactionData = {
        paymentId: createIntent?.id || paymentTransactionId,
        orderId,
        status: chargeStatus || paymentStatusData,
        apiResponse: createIntent ? JSON.stringify(createIntent) : paymentResponse,
        paymentStatus: createIntent?.status ?? 'succeeded',
      };
      return await Transaction.create(transactionData, { transaction });
    } catch (error) {
      loggers.error(`Transaction error: ${error} `);
      throw Error(error);
    }
  },
};
