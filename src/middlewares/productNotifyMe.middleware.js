import utility from '../utils/index';
import models from '../models';

const { ProductNotifyMe } = models;

export default {

  /**
   * Check Product Notify Me exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkNotifyMeExist(req, res, next) {
    try {
      const {
        user: { id },
        params,
      } = req;
      const productId = params.id;
      const result = await ProductNotifyMe.scope('notDeletedProductNotifyMe').findOne({ where: { userId: id, productId } });
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_NOTIFY_ME_EXIST'));
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
