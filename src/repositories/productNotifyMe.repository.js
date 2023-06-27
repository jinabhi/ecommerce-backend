import models from '../models/index';
import loggers from '../services/logger.service';

const { ProductNotifyMe } = models;

export default {

  /**
     * Add Product Notify Me
     * @param {object} req
     * @returns
     */
  async addProductNotifyMe(req) {
    try {
      const { user: { id }, params } = req;
      return await ProductNotifyMe.create({ userId: id, productId: params.id });
    } catch (error) {
      loggers.error(`Add Product Notify Me error: ${error}`);
      throw Error(error);
    }
  },
};
