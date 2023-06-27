import customNotificationsRepository from '../repositories/customNotifications.repository';
import utility from '../utils/index';

export default {
  /**
   * Check if Custom Notification exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async checkCustomNotificationExist(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const where = {};
      where.id = id;
      const result = await customNotificationsRepository.findOne(where);
      if (result) {
        req.customNotification = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'NOTIFICATION_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
};
