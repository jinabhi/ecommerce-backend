import utility from '../utils/index';
import earningRepository from '../repositories/earning.repository';

export default {
  /**
   * Check Order exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkEarningExist(req, res, next) {
    try {
      const {
        params: { orderId },
      } = req;
      const where = { id: orderId };
      const result = await earningRepository.findOne(where);
      if (result) {
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'EARNING_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

};
