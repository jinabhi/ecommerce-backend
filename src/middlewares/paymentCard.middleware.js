import { Op } from 'sequelize';
import paymentCardRepository from '../repositories/paymentCard.repository';
import utility from '../utils/index';

export default {
  /**
   * check if Payment Card already exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkPaymentCardAlreadyExist(req, res, next) {
    try {
      const {
        body: { cardId },
        params: { id },
      } = req;
      const where = { cardId };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await paymentCardRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'PAYMENT_CARD_ALREADY_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if Payment Card exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async checkPaymentCardExist(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const where = {};
      where.id = id;
      const result = await paymentCardRepository.findOne(where);
      if (result) {
        req.paymentCard = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PAYMENT_CARD_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
};
