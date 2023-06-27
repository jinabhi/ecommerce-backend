import repositories from '../repositories';
import utility from '../utils';

const { paymentCardRepository } = repositories;

export default {
  /**
   * Add Payment Card
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addPaymentCard(req, res, next) {
    try {
      const result = await paymentCardRepository.addPaymentCard(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PAYMENT_CARD_ADDED'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'FALSE_RESPONSE'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get Payment Card List
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getSavedPaymentCardList(req, res, next) {
    try {
      const result = await paymentCardRepository.getSavedPaymentCardOfCustomer(
        req,
      );
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Payment Card
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async deletePaymentCard(req, res, next) {
    try {
      req.body.status = 'deleted';
      await paymentCardRepository.updatePaymentCard(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CARD_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Particular Payment Card
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async getPaymentCard(req, res, next) {
    try {
      const { paymentCard } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: paymentCard,
        message: utility.getMessage(req, false, 'CARD_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Make card default
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async defaultePaymentCard(req, res, next) {
    try {
      await paymentCardRepository.defaultePaymentCard(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CARD_DEFAULT'),
      });
    } catch (error) {
      next(error);
    }
  },
};
