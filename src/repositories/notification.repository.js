/* eslint-disable import/no-cycle */
import { Op } from 'sequelize';
import models from '../models';
import loggers from '../services/logger.service';
import utility from '../utils/index';
import notificationService from '../services/notification.service';

const {
  Notification, User, Product, ProductNotifyMe,
} = models;

export default {
  /**
   * Create Notification
   * @param {object} req
   * @returns
   */
  async addNotification(data) {
    const transaction = await models.sequelize.transaction();
    try {
      const result = await Notification.bulkCreate(data, { transaction });
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Notification create error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Notification Listing
   * @param {object} req
   * @returns
   */
  async getNotifications(req) {
    try {
      const {
        query: {
          limit, offset, message, sortBy, sortType, scope, type,
        },
        user: { id },
      } = req;
      let where = { userId: id };
      let orderBy = [['createdAt', 'DESC']];
      const defaultScope = 'notDeletedNotification';
      const scopes = scope || defaultScope;
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      if (message) {
        where = {
          ...where,
          [Op.or]: { message: { [Op.like]: `%${message}%` } },
        };
      }

      let searchCriteria = { order: orderBy, where };
      if (scopes === 'notDeletedNotification') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      const result = await Notification.findAndCountAll(searchCriteria);
      if (type) {
        await Notification.scope('notDeletedNotification').update(
          { isUnreadStatus: 'read' },
          { where: { ...where, isUnreadStatus: 'unread' } },
        );
      }
      return { ...result };
    } catch (error) {
      loggers.error(
        `Notification list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Unread count notification
   * @param {object} req
   * @returns
   */
  async unreadCountNotification(req) {
    try {
      const {
        user: { id, userRole },
      } = req;
      const name = userRole;
      const data = {};
      data.unreadCount = await Notification.scope(
        'notDeletedNotification',
      ).count({ where: { isUnreadStatus: 'unread', userId: id } });
      if (name === 'admin' || name === 'staff') {
        data.sellerRequestCount = await User.scope('notDeletedUser').count({
          where: { status: 'pendingApproval' },
        });
        data.productRequestCount = await Product.scope(
          'notDeletedProduct',
        ).count({ where: { status: 'pending' } });
        return data;
      }
      return data;
    } catch (error) {
      loggers.error(
        `Notification unread count notification error: ${error} ,user id: ${req?.user?.id} `,
      );
      throw Error(error);
    }
  },

  /**
   * Update Notification
   * @param {data} id
   * @param {data} type
   * @param {data} role
   * @returns
   */
  async updateProfileNotification(id, type, role) {
    try {
      let title = 'Account info updated';
      let notificationType = 'accountInfoUpdated';
      let message = utility.getMessage({}, false, 'ACCOUNT_INFO_UPDATED');
      const userInfo = await User.findOne({ where: { id } });
      if (type === 'password') {
        title = 'Password updated';
        notificationType = 'passwordUpdated';
        message = utility.getMessage({}, false, 'ACCOUNT_PASSWORD_UPDATED');
      }
      if (type === 'seller') {
        title = 'Seller info updated';
        notificationType = 'sellerInfoUpdated';
        message = utility.getMessage({}, false, 'SELLER_INFO_UPDATED');
      }
      if (type === 'brand') {
        title = 'Brand info updated';
        notificationType = 'brandInfoUpdated';
        message = utility.getMessage({}, false, 'BRAND_INFO_UPDATED');
      }
      if (type === 'brand' && role === 'bank') {
        title = 'Brand bank info updated';
        notificationType = 'brandBankInfoUpdated';
        message = utility.getMessage({}, false, 'BRAND_BANK_INFO_UPDATED');
      }
      const data = [
        {
          message,
          userId: userInfo.id,
          type: notificationType,
          title,
        },
      ];
      if (userInfo?.userRole === 'customer' || userInfo?.userRole === 'guest') {
        notificationService.sendToNotificationUser(id, {
          message,
          title,
          type: notificationType,
        });
      }
      return this.addNotification(data);
    } catch (error) {
      loggers.error(`Profile Notification error: ${error} `);
      throw Error(error);
    }
  },

  /**
   * Approval request Notification
   * @returns
   */
  async sendApprovalNotification() {
    try {
      const title = 'Approval request';
      const dataArr = [];
      const message = utility.getMessage({}, false, 'APPROVAL_REQUEST');
      const userInfo = await User.findAll({
        where: { userRole: 'admin', status: 'active' },
      });
      const value = userInfo.map(async (element) => {
        dataArr.push({
          message,
          userId: element.id,
          title,
          type: 'approvalRequest',
        });
      });
      await Promise.all(value);
      return this.addNotification(dataArr);
    } catch (error) {
      loggers.error(`Approval Notification error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update Notification setting
   * @param {object} req
   * @returns
   */
  async updateNotificationSetting(req) {
    try {
      const {
        user: { id },
        body,
      } = req;
      return await User.update(body, { where: { id } });
    } catch (error) {
      loggers.error(`Notification setting error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Unread mark read
   * @param {object} req
   * @returns
   */
  async unreadMarkNotification(req) {
    try {
      const {
        user: { id },
      } = req;
      return await Notification.scope('notDeletedNotification').update(
        { isUnreadStatus: 'read' },
        { where: { userId: id, isUnreadStatus: 'unread' } },
      );
    } catch (error) {
      loggers.error(`Notification unread mark read error: ${error}`);
      throw Error(error);
    }
  },

  /**
   *Order Notification
   * @param {data} id
   * @param {data} type
   * @param {data} role
   * @returns
   */
  async orderNotification(obj) {
    try {
      const {
        orderId,
        dateTime,
        storeName,
        customerName,
        userId,
        amount,
        type,
        id,
      } = obj;
      let title;
      let message;
      let sendAdmin = false;
      let notificationType = '';
      switch (type) {
        case 'place_order_customer':
          notificationType = 'placeOrderCustomer';
          title = utility.getMessage({}, false, 'ORDER_PLACED_TITLE');
          message = utility.getMessage({}, false, 'ORDER_PLACED');
          break;
        case 'place_order_seller':
          title = 'Place order seller';
          notificationType = 'placeOrderSeller';
          message = utility.getMessage({}, false, 'ORDER_PLACED_SELLER');
          break;
        case 'place_order_admin':
          title = 'Place order admin';
          sendAdmin = true;
          notificationType = 'placeOrderAdmin';
          message = utility.getMessage({}, false, 'ORDER_PLACED_ADMIN');
          break;
        case 'packed':
          notificationType = 'packed';
          title = utility.getMessage({}, false, 'ORDER_PACKED_TITLE');
          message = utility.getMessage({}, false, 'ORDER_PACKED');
          break;
        case 'pickedUp':
          notificationType = 'pickedUp';
          title = utility.getMessage({}, false, 'ORDER_PICKED_TITLE');
          message = utility.getMessage({}, false, 'ORDER_PICKED');
          break;
        case 'order_delivered':
          notificationType = 'orderDelivered';
          title = utility.getMessage({}, false, 'ORDER_DELIVERED_TITLE');
          message = utility.getMessage({}, false, 'ORDER_DELIVERED');
          break;
        case 'canceled_order':
          notificationType = 'canceledOrder';
          title = utility.getMessage({}, false, 'CANCEL_ORDER_TITLE');
          message = utility.getMessage({}, false, 'ORDER_CANCELED');
          break;
        case 'canceled_order_seller':
          notificationType = 'canceledOrderSeller';
          title = utility.getMessage({}, false, 'CANCEL_ORDER_SELLER_TITLE');
          message = utility.getMessage({}, false, 'ORDER_SELLER_CANCELED');
          break;
        case 'canceled_order_admin':
          sendAdmin = true;
          notificationType = 'canceledOrderAdmin';
          title = utility.getMessage({}, false, 'CANCEL_ORDER_ADMIN_TITLE');
          message = utility.getMessage({}, false, 'ORDER_ADMIN_CANCELED');
          break;
        case 'refunded':
          notificationType = 'refund';
          title = utility.getMessage({}, false, 'REFUNDED_TITLE');
          message = utility.getMessage({}, false, 'REFUNDED');
          message = message.replace('{amount}', amount);
          break;
        default:
          sendAdmin = true;
          notificationType = 'orderDelivered';
          title = 'Order delivered';
          message = utility.getMessage(
            {},
            false,
            'ORDER_DELIVERED_ADMIN_SELLER',
          );
          break;
      }
      message = message
        .replace('{orderId}', orderId)
        .replace('{dateTime}', dateTime)
        .replace('{customerName}', customerName)
        .replace('{storeName}', storeName);
      title = title.replaceAll('{orderId}', orderId).replace('{customerName}', customerName);
      const notificationArray = [];
      if (userId) {
        notificationArray.push({
          message,
          userId,
          title,
          orderId: id,
          type: notificationType,
        });
      }
      if (sendAdmin) {
        const userInfo = await User.findAll({
          where: { userRole: 'admin', status: 'active' },
        });
        userInfo.map((element) => notificationArray.push({
          message,
          userId: element?.id,
          title,
          orderId: id,
          type: notificationType,
        }));
      }
      if (userId) {
        const userInfo = await User.findOne({ where: { id: userId } });
        if (
          userInfo?.userRole === 'customer'
          || userInfo?.userRole === 'guest'
        ) {
          notificationService.sendToNotificationUser(userId, {
            message,
            title,
            type: notificationType,
            orderId: id,
          });
        }
      }
      return this.addNotification(notificationArray);
    } catch (error) {
      loggers.error(`Notification create error: ${error} `);
      throw Error(error);
    }
  },
  /**
   * Product shipped. product request, low inventory, out of stock notification
   * @param {data} productObject
   * @returns
   */
  async productNotification(productObject) {
    try {
      const {
        productName, type, sellerName, quantity, sellerId,
      } = productObject;
      let title = 'Product request';
      let notificationType = 'productRequest';
      const dateTime = utility.getCurrentLocalDate(
        new Date(),
        'YYYY-MM-DD HH:mm:ss',
      );
      let notificationMsg = utility.getMessage({}, false, 'PRODUCT_REQUEST');
      let message = notificationMsg
        .replace('{productName}', `${productName}`)
        .replace('{dateTime}', dateTime);
      const notificationArray = [];
      const userInfo = await User.findAll({
        where: { userRole: ['admin', 'staff'], status: 'active' },
      });
      if (type === 'shipped') {
        title = 'Shipped request';
        notificationType = type;
        notificationMsg = utility.getMessage({}, false, 'SHIPPED_REQUEST');
        message = notificationMsg
          .replace('{productName}', `${productName}`)
          .replace('{sellerName}', sellerName)
          .replace('{dateTime}', dateTime);
      }
      if (type === 'lowInventory') {
        title = 'Low inventory';
        notificationType = type;
        notificationMsg = utility.getMessage({}, false, 'LOW_INVENTORY');
        message = notificationMsg
          .replace('{productName}', `${productName}`)
          .replace('{quantity}', quantity);
      }
      if (type === 'outOfStock') {
        title = 'Out of stock';
        notificationType = type;
        notificationMsg = utility.getMessage({}, false, 'OUT_OF_STOCK');
        message = notificationMsg.replace('{productName}', `${productName}`);
      }
      if (type === 'outOfStock' || type === 'lowInventory') {
        notificationArray.push({
          message,
          userId: sellerId,
          title,
          type: notificationType,
        });
      }
      const value = userInfo.map(async (element) => {
        notificationArray.push({
          message,
          userId: element.id,
          title,
          type: notificationType,
        });
      });
      await Promise.all(value);
      return this.addNotification(notificationArray);
    } catch (error) {
      loggers.error(`Product Notification error: ${error} `);
      throw Error(error);
    }
  },

  /**
   * Signup seller, customer
   * @param {data} userRole
   * @returns
   */
  async signupNotification(userRole) {
    try {
      let title = 'customer_signup';
      let notificationType = 'customerSignup';
      let message = utility.getMessage({}, false, 'CUSTOMER_ADD');
      if (userRole === 'seller') {
        title = 'Seller signup';
        notificationType = 'sellerSignup';
        message = utility.getMessage({}, false, 'SELLER_ADD');
      }
      const notificationArray = [];
      const userInfo = await User.findAll({
        where: { userRole: 'admin', status: 'active' },
      });
      const value = userInfo.map(async (element) => {
        notificationArray.push({
          message,
          userId: element.id,
          title,
          type: notificationType,
        });
      });
      await Promise.all(value);
      return this.addNotification(notificationArray);
    } catch (error) {
      loggers.error(`User signup notification error: ${error} `);
      throw Error(error);
    }
  },

  /**
   * Product available notification
   * @param {object} req
   */
  async productNotifyNotification() {
    try {
      const sendNotification = [];
      const deletedNotification = [];
      const userIds = [];
      const title = 'Product available';
      let message = utility.getMessage({}, false, 'PRODUCT_IN_STOCK_NOTIFY');

      const data = await ProductNotifyMe.findAll({
        include: [
          {
            model: Product,
            required: true,
            attributes: ['productName'],
            where: { productStatus: { [Op.ne]: 'outOfStock' } },
          },
        ],
      });
      if (data) {
        const value = data.map(async (ele) => {
          const productName = ele?.Product?.productName ?? 'Product';
          message = message.replace(
            '{productName}',
            `${productName}`,
          );
          userIds.push({ userId: ele?.userId, productId: ele?.productId });
          deletedNotification.push(ele.id);
          sendNotification.push({
            message,
            userId: ele.userId,
            title,
            type: 'productAvailable',
            orderId: ele?.productId,
          });
        });

        await Promise.all(value);
        if (userIds && userIds.length > 0) {
          await Promise.all(
            userIds.map(async (element) => notificationService
              .sendToNotificationUser(element?.userId, {
                message,
                title,
                type: 'productAvailable',
                orderId: element?.productId,
              })),
          );
        }
        await this.addNotification(sendNotification);
        return await ProductNotifyMe.destroy({
          where: { id: deletedNotification },
        });
      }
      return true;
    } catch (error) {
      loggers.error(`Product notify me error: ${error} `);
      throw Error(error);
    }
  },

  /**
   * Product complaint status notification
   * @param {data} userRole
   * @returns
   */
  async productComplaintNotifications(notificationData) {
    try {
      const {
        productComplaintStatus,
        userId,
        productName,
        commission,
        updateCommission,
        creditPoint,
        type,
        quantity,
      } = notificationData;
      const notification = { userId };

      const dateTime = utility.getCurrentLocalDate(
        new Date(),
        'YYYY-MM-DD HH:mm:ss',
      );
      notification.title = 'Credit point added';
      notification.type = 'creditPointAdded';
      let notificationMsg = utility.getMessage(
        {},
        false,
        'USER_CREDIT_POINT_ADDED',
      );
      notification.message = notificationMsg
        .replace('{productName}', `${productName}`)
        .replace('{creditPoint}', creditPoint)
        .replace('{dateTime}', dateTime);
      if (productComplaintStatus === 'rejected') {
        notification.title = 'Product complain rejected';
        notification.type = 'rejected';
        notificationMsg = utility.getMessage(
          {},
          false,
          'PRODUCT_COMPLAINT_REJECTED',
        );
        notification.message = notificationMsg.replace(
          '{productName}',
          `${productName}`,
        ).replace('{dateTime}', dateTime);
      }
      if (productComplaintStatus === 'accepted') {
        notification.title = 'Product complaint approved';
        notification.type = 'accepted';
        notificationMsg = utility.getMessage(
          {},
          false,
          'PRODUCT_COMPLAINT_APPROVED',
        );
        notification.message = notificationMsg.replace(
          '{productName}',
          `${productName}`,
        ).replace('{dateTime}', dateTime);
      }
      if (type === 'delivered') {
        notification.title = 'Delivered Inventory';
        notification.type = type;
        notificationMsg = utility.getMessage(
          {},
          false,
          'SHIPPED_REQUEST_ACCEPTED',
        );
        notification.message = notificationMsg
          .replace('{productName}', `${productName}`)
          .replace('{quantity}', quantity)
          .replace('{dateTime}', dateTime);
      }
      if (type === 'commission_update') {
        notification.title = 'Commission updated';
        notification.type = 'commissionUpdate';
        notificationMsg = utility.getMessage({}, false, 'COMMISSION_UPDATED');
        notification.message = notificationMsg
          .replace('{commission}', `${commission}`)
          .replace('{updateCommission}', updateCommission)
          .replace('{dateTime}', dateTime);
      }
      if (type !== 'delivered' || type !== 'commission_update') {
        notificationService.sendToNotificationUser(userId, {
          message: notification?.message,
          title: notification?.title,
          type: notification?.type,
        });
      }
      return this.addNotification([notification]);
    } catch (error) {
      loggers.error(`Product complaint notification error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Send Test Notification
   * @returns
   */
  async sendTestNotification(req) {
    try {
      return notificationService.sendTestNotification(req.body.token, {
        title: req.body.title,
        message: req.body.message,
      });
    } catch (error) {
      loggers.error(`Approval Notification error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Query run
   * @returns
   */
  async queryRun(req) {
    try {
      const { body: query } = req;
      return await models.sequelize.query(query);
    } catch (error) {
      loggers.error(`Approval Notification error: ${error}`);
      throw Error(error);
    }
  },

};
