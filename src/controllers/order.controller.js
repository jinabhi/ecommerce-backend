import repositories from '../repositories';
import utility from '../utils';

const { orderRepository } = repositories;

export default {

  /**
    * place order
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async placeOrder(req, res, next) {
    try {
      const result = await orderRepository.placeOrder(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'ORDER_CREATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * order  Listing
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getOrders(req, res, next) {
    try {
      const result = await orderRepository.getAllOrder(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * paytm Token
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async verifypaytmToken(req, res, next) {
    try {
      const result = await orderRepository.verifypaytmToken(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Order status update
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async orderStatusUpdate(req, res, next) {
    try {
      await orderRepository.orderStatusUpdate(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'ORDER_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Order status update
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async orderDetails(req, res, next) {
    try {
      const result = await orderRepository.orderDetails(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Seller Order status update
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async sellerOrderDetails(req, res, next) {
    try {
      const result = await orderRepository.sellerOrderDetails(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get All best Selling products
   * @param {obj} req
   * @param {obj} res
   * @param {Function} next
   */
  async getBestSellingProducts(req, res, next) {
    try {
      const result = await orderRepository.bestSellingProduct(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Order status update when charge event
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async orderUpdateWebHook(req, res, next) {
    try {
      const result = await orderRepository.orderUpdateWebHook(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * Create paypal order
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async PaypalOrder(req, res, next) {
    try {
      const result = await orderRepository.PaypalOrder(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Paypal token
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async paypalToken(req, res, next) {
    try {
      const result = await orderRepository.paypalToken(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async paypalWebhook(req, res, next) {
    try {
      const result = await orderRepository.paypalWebhook(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
