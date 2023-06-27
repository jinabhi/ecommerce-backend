import models from '../models/index';
import utility from '../utils/index';

const { PromotionContactUs } = models;

export default {

  /**
   * Check Promotion contact us exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkPromotionContactUsEnquiryExist(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const result = await PromotionContactUs.scope('notDeletedPromotion').findOne({ where: { id } });
      if (!result) {
        const error = new Error(utility.getMessage(req, false, 'PROMOTION_ENQUIRY_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
};
