import repositories from '../repositories';
import utility from '../utils';

const { shippingLogRepository } = repositories;

export default {

  /**
      * Add Shipping Log
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addShippingLog(req, res, next) {
    try {
      const result = await shippingLogRepository.addShippingLog(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'SHIPPING_LOG_ADDED'),
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
    * Get Product Shipping Logs
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getShippingLogs(req, res, next) {
    try {
      const result = await shippingLogRepository.getShippingLogs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Shipping log status update
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async statusUpdate(req, res, next) {
    try {
      const user = await shippingLogRepository.statusUpdate(req);
      if (user) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'DELIVER_STATUS_UPDATED'),
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
