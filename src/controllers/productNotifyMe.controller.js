import repositories from '../repositories';
import utility from '../utils';

const { productNotifyMeRepository } = repositories;

export default {
  /**
    * Add product Notify Me
    * @param {object} req
    * @param {object} res
    * @param {object} next
    */
  async addProductNotifyMe(req, res, next) {
    try {
      const result = await productNotifyMeRepository.addProductNotifyMe(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_NOTIFY_ME_ADDED'),
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

};
