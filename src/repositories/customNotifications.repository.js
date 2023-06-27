import { Op } from 'sequelize';
import models from '../models';
import loggers from '../services/logger.service';
import notification from '../services/notification.service';

const { CustomNotification, User, Notification } = models;

export default {
  /**
   * Create Custom Notification
   * @param {object} req
   * @returns
   */
  async addCustomNotification(req) {
    try {
      const { body } = req;
      // const { title, description, userType } = body;
      const where = { status: 'active', verificationStatus: 'completed', userRole: body.userType };
      const userDataId = [];
      if (body.userType === 'all') {
        where.userRole = { [Op.notIn]: ['admin', 'staff'] };
      }
      const result = await CustomNotification.create(body);
      if (result) {
        // Send push notification to all users

        const notificationObj = {
          title: body.title,
          message: body.description,
          type: 'broadCast',
        };
        const userData = await User.findAll({ where });
        if (userData) {
          userData.map((element) => {
            if (element?.userRole === 'customer' || element?.userRole === 'guest') {
              userDataId.push(element.id);
            }
            Notification.create({ userId: element.id, ...notificationObj, type: 'broadCast' });
            return true;
          });
        }
        if (userDataId ?? userDataId.length > 0) {
          notification.sendMultipleNotificationUser(userDataId, notificationObj);
        }
      }
      return true;
    } catch (error) {
      loggers.error(`Create Custom Notification error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
  /**
   * Get all Custom Notifications
   * @param {object} req
   * @returns
   */
  async getAllCustomNotifications(req) {
    try {
      const {
        query: {
          limit, offset, scope, sortBy, sortType, search, userType,
        },
      } = req;

      let where = {};
      let orderBy = [['createdAt', 'DESC']];
      const defaultScope = 'notDeletedCustomNotification';
      if (search) {
        where = {
          ...where,
          title: { [Op.like]: `%${search}%` },
        };
      }
      if (userType && userType !== 'all') {
        where.userType = userType;
      }
      const scopes = scope || defaultScope;
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      let searchCriteria = { order: orderBy, where };

      if (scopes === 'notDeletedCustomNotification') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await CustomNotification.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Custom Notifications list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Find Custom Notification
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await CustomNotification.scope('notDeletedCustomNotification').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Custom Notification details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update/Delete Custom Notification
   * @param {object} req
   * @returns
   */
  async updateCustomNotification(req) {
    try {
      const {
        body,
        params: { id },
      } = req;
      const { status } = body;
      const result = await CustomNotification.update(body, { where: { id } });
      if (status) {
        return result;
      }
      return result;
    } catch (error) {
      loggers.error(`Custom Notification update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
};
