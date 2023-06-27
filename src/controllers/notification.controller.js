import repositories from '../repositories';
import utility from '../utils';

const { notificationRepository } = repositories;

export default {
  /**
   * Notification Listing
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getNotifications(req, res, next) {
    try {
      const result = await notificationRepository.getNotifications(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  /**
  * Unread count notification
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async unreadCountNotification(req, res, next) {
    try {
      const result = await notificationRepository.unreadCountNotification(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  /**
 * Unread mark read notification
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async unreadMarkNotification(req, res, next) {
    try {
      await notificationRepository.unreadMarkNotification(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Query run
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async queryRun(req, res, next) {
    try {
      await notificationRepository.queryRun(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Update Notification setting
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */

  async updateNotificationSetting(req, res, next) {
    try {
      await notificationRepository.updateNotificationSetting(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
};
