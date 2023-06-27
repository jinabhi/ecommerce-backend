/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';
import utility from '../utils/index';
import orderRepository from '../repositories/order.repository';
import userRepository from '../repositories/user.repository';
// import addressRepository from '../repositories/address.repository';

import models from '../models';

const { Product, GeneralSetting } = models;

export default {
  /**
   * Check Order exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkOrderExist(req, res, next) {
    try {
      const {
        params: { id },
        body: { orderId },
        user,
      } = req;
      const where = {};
      if (id) {
        where.id = id;
      }
      if (orderId) {
        where.id = orderId;
      }
      let result;
      if (user.userRole === 'customer') {
        where.customerId = user.id;
        result = await orderRepository.findOne(where);
      } else if (user.userRole === 'seller') {
        result = await orderRepository.orderExist({ where: { sellerId: user.id, orderId: id } });
      } else {
        result = await orderRepository.findOne(where);
      }
      if (result) {
        req.order = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'ORDER_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check customer Order exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkCustomerOrderExist(req, res, next) {
    try {
      const {
        params: { id },
        body,
      } = req;
      const where = {
        customerId: id,
        status: { [Op.notIn]: ['completed', 'canceled'] },
      };
      const result = await orderRepository.findOne(where);
      if (result && body?.status === 'inactive') {
        const error = new Error(
          utility.getMessage(req, false, 'CUSTOMER_STATUS_INACTIVE'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        req.order = result;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Product Available
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkProductExist(req, res, next) {
    try {
      const {
        body: { order },
      } = req;
      await utility.delay();
      const generalSetting = await GeneralSetting.findOne({ where: { key: 'minimum_quantity_product' } });
      await Promise.all(
        order.map(async (element) => {
          const result = await Product.findOne({
            where: {
              id: element.productId,
              status: 'active',
            },
          });
          if (result) {
            if (result.quantity < element.quantity) {
              let message = utility.getMessage(
                req,
                false,
                'QUANTITY_NOT_AVAILABLE_PRODUCT',
              );
              message = message.replace('product', result.productName);
              const error = new Error(message);
              error.status = utility.httpStatus('BAD_REQUEST');
              throw error;
            }
          } else {
            const error = new Error(
              utility.getMessage(req, false, 'PRODUCT_NOT_FOUND'),
            );
            error.status = utility.httpStatus('BAD_REQUEST');
            throw error;
          }
          const remainQuantity = parseInt(result.quantity, 10) - parseInt(element.quantity, 10);
          let productStatus = 'inStock';
          // Out of stock notification
          if (remainQuantity === 0) {
            productStatus = 'outOfStock';
          } else if (remainQuantity <= parseInt(generalSetting?.value, 10)
            && remainQuantity >= 1 && result?.productStatus !== 'lowInventory') {
            productStatus = 'lowInventory';
            // Low inventory notification
          }
          result.set({
            quantity: remainQuantity, productStatus,
          });
          await result.save();
        }),
      );
      next();
    } catch (error) {
      next(error);
    }
  },

  /**
     * Check customer Order delivered exist
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns
     */
  async checkProductOrderDeliveredExist(req, res, next) {
    try {
      const {
        body: { productId }, user: { id },
      } = req;
      const where = {
        '$Order.customer_id$': id,
        productId,
        '$Order.status$': 'completed',
      };
      const result = await orderRepository.orderProductExist(where);
      if (result) {
        req.order = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ORDER_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Credit points available
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkCreditPointExist(req, res, next) {
    try {
      const {
        user: { id },
        body,
      } = req;
      const { creditPoints } = body;
      const where = { id };
      const taxPercent = await orderRepository.getCreditPointValue('tax');
      if (creditPoints) {
        const result = await userRepository.creditPointsExist(where);
        if (creditPoints > result.creditPoints) {
          const error = new Error(
            utility.getMessage(req, false, 'CREDIT_POINT_LESS'),
          );
          error.status = utility.httpStatus('BAD_REQUEST');
          throw error;
        }
        const generalSetting = await orderRepository.getCreditPointValue('credit_point');
        const creditAmount = parseInt(generalSetting?.value, 10) * creditPoints;
        // remove condition as per discuusion with garima
        // let total = 0;
        // await Promise.all(
        //   order.map(async (element) => {
        //     const tax = ((element.productAmount + element.shippingCharges)
        //       * taxPercent.value)
        //       / 100;
        //     const totalAmount = element.productAmount + element.shippingCharges + tax;
        //     total += totalAmount;
        //   }),
        // );
        // const currencyRate = await addressRepository.exchangeCurrencyGet({ name: 'INR' });
        // const rate = currencyRate?.rate ?? 70;
        // const finalAmount = (total * rate);
        // if (creditAmount > finalAmount) {
        //   const error = new Error(
        //     utility.getMessage(req, false, 'CREDIT_POINT_SHOULD_BE_LESS'),
        //   );
        //   error.status = utility.httpStatus('BAD_REQUEST');
        //   next(error);
        // } else {
        body.creditAmount = creditAmount;
        body.taxPercent = taxPercent;
        body.userCredit = result;
        next();
        // }
      } else {
        body.creditPoints = 0;
        body.creditAmount = 0;
        body.creditPointsAmount = 0;
        body.taxPercent = taxPercent;
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check customer Order exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async UserRolePermission(req, res, next) {
    try {
      const {
        user: { userRole },
        body: { status },
      } = req;
      if ((userRole === 'customer' && status === 'canceled') || (userRole === 'admin' && ['packed', 'pickedUp', 'completed'].includes(status))) {
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'ORDER_PERMISSION'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

};
