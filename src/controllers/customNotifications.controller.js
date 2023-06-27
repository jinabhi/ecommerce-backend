import repositories from '../repositories';
import utility from '../utils';

const { customNotificationsRepository } = repositories;

export default {
  /**
   * custom Notifications create
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addCustomNotification(req, res, next) {
    try {
      const result = await customNotificationsRepository.addCustomNotification(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'NOTIFICATION_ADDED'),
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
  * Get all Custom Notifications List
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async getAllCustomNotifications(req, res, next) {
    try {
      const result = await customNotificationsRepository.getAllCustomNotifications(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Custom Notification
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateCustomNotification(req, res, next) {
    try {
      await customNotificationsRepository.updateCustomNotification(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'NOTIFICATION_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Delete Custom Notification
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async  deleteCustomNotifications(req, res, next) {
    try {
      req.body.status = 'deleted';
      await customNotificationsRepository.updateCustomNotification(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'NOTIFICATION_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Custom Notifications by Id
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async getCustomNotification(req, res, next) {
    try {
      const { customNotification } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: customNotification,
        message: utility.getMessage(req, false, 'NOTIFICATION_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
};
