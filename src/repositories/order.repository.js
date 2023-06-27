/* eslint-disable consistent-return */
import { Op, Sequelize } from 'sequelize';
import axios from 'axios';
import easyInvoice from 'easyinvoice';
import fs from 'fs';
import path from 'path';

import models from '../models/index';
import utils from '../utils/index';
import loggers from '../services/logger.service';
import helper from '../helper/subQuery';
import notificationRepository from './notification.repository';
import transactionRepository from './transaction.repository';
import addressRepository from './address.repository';
import config from '../config';
import stripe from '../services/stripe.service';
import paytmService from '../services/paytm.service';
import paypalService from '../services/paypal.service';
import brainTreeService from '../services/brainTree.service';
import emailServices from '../services/emailTemplate.service';
import bucketServices from '../services/s3Bucket.service';

const {
  Product, Address, User, Order, Brand, GeneralSetting, OrderProduct, ProductImage,
  SellerProductVariant, ProductVariant, ProductVariantAttribute, Discount, ProductDiscount,
  ReviewRating, Cart, ProductWishlist, Transaction,
} = models;
export default {
  /**
   * order Listing
   * @param {object} req
   * @returns
   */
  async getAllOrder(req) {
    try {
      const {
        user: { userRole, id },
        query: {
          limit,
          offset,
          name,
          sortBy,
          sortType,
          status,
          toDate,
          fromDate,
          customerId,
        },
        headers: { timezone },
      } = req;
      const appTimezone = timezone || 'Asia/kolkata';
      let duplicating = { separate: true };
      let where = {};
      let searchCriteria = {};
      let attributes = ['id', 'productId', 'orderId'];
      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'receivedOn':
            orderBy = [['createdAt', sortType]];
            break;
          case 'customerName':
            orderBy = [[Order.associations.customer, 'first_name', sortType]];
            break;
          case 'productName':
            orderBy = [
              [
                Order.associations.orderDetails,
                OrderProduct.associations.Product,
                'product_name',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'quantity':
            orderBy = [[Order.associations.orderDetails, 'quantity', sortType]];
            duplicating = { duplicating: false };
            break;
          case 'totalAmount':
            orderBy = [['order_amount', sortType]];
            break;
          case 'deliveryAddress':
            orderBy = [[Order.associations.Address, 'address', sortType]];
            break;
          case 'AmountWithTax':
            orderBy = [['order_amount', sortType]];
            break;
          case 'totalShippingCharges':
            orderBy = [[Order.associations.orderDetails, 'shippingCharges', sortType]];
            duplicating = { duplicating: false };
            break;
          case 'totalTax':
            orderBy = [['tax', sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (name) {
        const userFullName = Sequelize.fn(
          'CONCAT_WS',
          ' ',
          Sequelize.col('customer.first_name'),
          Sequelize.col('customer.last_name'),
        );
        where = {
          ...where,
          [Op.or]: [
            Sequelize.where(userFullName, 'LIKE', `%${name}%`),
            Sequelize.where(
              Sequelize.fn(
                'CONCAT_WS',
                ' ',
                Sequelize.col('Address.address'),
                Sequelize.col('Address.landmark'),
              ),
              'LIKE',
              `%${name}%`,
            ),
            { '$customer.first_name$': { [Op.like]: `%${name}%` } },
            { '$customer.last_name$': { [Op.like]: `%${name}%` } },
            { '$Order.order_amount$': { [Op.like]: `%${name}%` } },
            { '$Order.canceled_on$': { [Op.like]: `%${name}%` } },
            { '$Order.order_id$': { [Op.like]: `%${name}%` } },
          ],
        };
      }
      if (fromDate && toDate) {
        const fromDateTime = ' 00:00:00';
        const toDateTime = ' 23:59:59';
        const dateFormat = 'YYYY-MM-DD HH:mm:ss';
        const startDate = utils.getUTCDateTimeFromTimezone(
          `${fromDate}${fromDateTime}`,
          appTimezone,
          dateFormat,
        );
        const endDate = utils.getUTCDateTimeFromTimezone(
          `${toDate}${toDateTime}`,
          appTimezone,
          dateFormat,
        );
        where.createdAt = { [Op.gte]: startDate, [Op.lte]: endDate };
      }
      const field = ['id', 'orderId', 'trackingLink', 'paymentType', 'earningStatus', 'status', 'packedOn', 'pickedUpOn', 'deliveredOn', 'canceledOn', 'createdAt'];
      // const whereProduct = {  };
      if (userRole === 'seller') {
        where.id = helper.orderIds(id);
        searchCriteria = {
          attributes: [
            ...field,
            helper.sumQueryBySeller('order_products', 'amount', 'totalAmount', id),
            helper.sumQueryBySeller('order_products', 'total_amount', 'AmountWithTax', id),
            helper.sumQueryBySeller('order_products', 'admin_commission', 'adminCommission', id),
            helper.sumQueryBySeller('order_products', 'seller_commission', 'sellerCommission', id),
            helper.sumQueryBySeller('order_products', 'shipping_charges', 'totalShippingCharges', id),
            helper.sumQueryBySeller('order_products', 'tax', 'totalTax', id),
          ],
        };
      }
      if (userRole === 'admin') {
        searchCriteria = {
          attributes: [
            ...field,
            helper.sumQuery('order_products', 'shipping_charges', 'totalShippingCharges'),
            helper.sumQuery('order_products', 'tax', 'totalTax'),
            helper.sumQuery('order_products', 'amount', 'totalAmount'),
            helper.sumQuery('order_products', 'total_amount', 'AmountWithTax'),
            helper.sumQuery('order_products', 'admin_commission', 'adminCommission'),
            helper.sumQuery('order_products', 'seller_commission', 'sellerCommission'),
          ],
        };
      }
      if (userRole === 'customer') {
        where.customer_id = id;
        attributes = {
          include: helper.productComplainCheck(),
        };
      }
      if (customerId) {
        where.customer_id = customerId;
      }
      if (status === 'past') {
        where = {
          ...where,
          status: {
            [Op.or]: ['completed', 'canceled'],
          },
        };
      } else if (status === 'active') {
        where = {
          ...where,
          status: {
            [Op.or]: ['received', 'packed', 'pickedUp'],
          },
        };
      } else if (status) {
        where.status = status;
      }

      searchCriteria = {
        ...searchCriteria,
        where: { ...where },
        col: 'id',
        distinct: true,
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
        include: [
          {
            association: 'orderDetails',
            // where: whereProduct,
            attributes,
            required: true,
            ...duplicating,
            include: [
              {
                model: Product,
                attributes: ['productName', 'id'],
                required: false,
                include: [
                  {
                    model: ProductImage,
                    as: 'productImage',
                    order: [['createdAt', 'ASC']],
                    attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
                    required: false,
                  },
                ],
              },
              {
                model: User,
                as: 'seller',
                attributes: ['firstName', 'lastName', 'id'],
                required: false,
              },
              // {
              //   model: ProductComplaint,
              //   attributes: ['firstName', 'lastName', 'id'],
              //   required: false,
              // },
            ],
          },
          {
            model: User,
            as: 'customer',
            // required: false,
            attributes: ['firstName', 'lastName', 'id'],
          },
          {
            model: Address,
            required: false,
          },
        ],
      };
      return await Order.scope('notDeletedOrder').findAndCountAll({ order: orderBy, ...searchCriteria, subQuery: false });
    } catch (error) {
      throw Error(error);
    }
  },

  /*
   * Order status update
   * @param {object} req
   * @returns
   */
  async orderStatusUpdate(req) {
    try {
      const {
        body,
        params: { id },
        order,
      } = req;
      const { orderId, customerId } = order;
      const {
        shippingApiKey: {
          trackingUrl,
        },
      } = config;
      await Order.update({ status: body.status }, { where: { orderId } });

      const updateDate = utils.getCurrentDate(Date(), 'YYYY-MM-DD HH:mm:ss');
      const data = { status: body.status };
      let notificationsObj = { orderId, userId: customerId, id: order?.id };
      if (body.status === 'pickedUp') {
        data.trackingNumber = body.trackingLink;
        data.trackingLink = `${trackingUrl}${body.trackingLink}`;
        notificationsObj.type = 'pickedUp';
        data.pickedUpOn = updateDate;
      } else if (body.status === 'packed') {
        data.packedOn = updateDate;
        notificationsObj.type = 'packed';
      } else
      if (body.status === 'canceled') {
        data.canceledOn = updateDate;
        data.earningStatus = 'refund';
        notificationsObj.type = 'canceled_order';
        await this.cancelOrder(order);
      }
      await Order.update(
        data,
        { where: { id } },
      );
      if ('type' in notificationsObj) {
        notificationRepository.orderNotification(notificationsObj);
        if (body.status === 'canceled') {
          const userDetails = await User.scope('notDeletedUser').findOne({ where: { id: customerId } });
          const customerName = `${userDetails?.firstName ?? ''} ${userDetails?.lastName ?? ''}`;
          const dateTime = utils.getCurrentLocalDate(Date(), 'YYYY-MM-DD HH:mm:ss');
          // Customer notification
          delete notificationsObj.userId;
          // Seller notifications
          const sellerDetails = await OrderProduct.scope('notDeletedOrder').findAll({ where: { orderId: id } });
          if (sellerDetails && sellerDetails.length > 0) {
            notificationsObj = {
              ...notificationsObj,
              type: 'canceled_order_seller',
              customerName,
              userId: sellerDetails?.sellerId,
            };
            sellerDetails.map((element) => notificationRepository.orderNotification({
              ...notificationsObj,
              userId: element?.sellerId,
              id: parseInt(order?.id, 10),
            }));
          }
          delete notificationsObj.sellerId;
          // Admin notifications
          notificationsObj = { ...notificationsObj, type: 'canceled_order_admin', dateTime };
          notificationRepository.orderNotification(notificationsObj);
        }
      }

      return true;
    } catch (error) {
      loggers.error(
        `Order Status update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Order detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Order.scope('notDeletedOrder').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Order detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * order Details
   * @param {object} req
   * @returns
   */
  async orderDetails(req) {
    try {
      const {
        params: { id },
        user: { userRole },
      } = req;

      const where = { id };
      const taxValue = await GeneralSetting.findOne({ where: { key: 'tax' } });
      const taxAmountData = taxValue.get();
      let searchCriteria = { where };
      const reviewWhere = { orderId: id, status: 'active' };
      if (userRole === 'customer') {
        reviewWhere.userId = req.user.id;
      }
      searchCriteria = {
        ...searchCriteria,
        attributes: [
          'id', 'orderId', 'currencyRate', 'cardId', 'invoiceImageUrl', 'invoiceImage', 'tax', 'orderAmount', 'creditPoints', 'creditPointsAmount', 'trackingLink', 'paymentType', 'earningStatus', 'status', 'packedOn', 'pickedUpOn', 'deliveredOn', 'canceledOn', 'createdAt',

          [Sequelize.literal('(credit_points_amount/currency_rate)'), 'creditAmountUsd'],
          [Sequelize.literal(`${taxAmountData?.value ?? 0}`), 'taxAmount'],
          helper.sumQuery('order_products', 'total_amount', 'AmountWithTax'),
          helper.sumQuery('order_products', 'shipping_charges', 'shippingCharges'),
          helper.sumQuery('order_products', 'amount', 'totalAmount'),
          helper.sumQuery('order_products', 'tax', 'totalTax'),
        ],
        include: [
          {
            model: User,
            as: 'customer',
            required: false,
            attributes: ['firstName', 'lastName', 'id', 'phoneNumber', 'phoneNumberCountryCode'],
          },
          {
            model: Address,
            required: false,
          },
          {
            association: 'orderDetails',
            required: false,
            attributes: {
              include: helper.productComplainCheck(),
            },
            separate: true,
            include: [
              {
                model: Product,
                attributes: ['productName', 'id', 'childCategoryId', 'productStatus', 'categoryId', 'subCategoryId'],
                required: false,
                include: [
                  {
                    model: ProductImage,
                    as: 'productImage',
                    attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
                    required: false,
                  },
                  {
                    model: ReviewRating,
                    as: 'productReviewRating',
                    where: reviewWhere,
                    limit: 1,
                    required: false,
                  },
                  {
                    model: SellerProductVariant,
                    as: 'sellerProductVariantDetails',
                    required: false,
                    include: [
                      {
                        model: ProductVariantAttribute,
                        required: false,
                      },
                      {
                        model: ProductVariant,
                        required: false,
                      },
                    ],
                  },
                ],
              },
              {
                model: User,
                as: 'seller',
                attributes: ['firstName', 'lastName', 'id'],
                required: false,
              },
            ],
          },
        ],
      };
      if (userRole === 'customer') {
        const result = await Order.findAll(searchCriteria);
        const details = await this.getSimilarProducts(result);
        return [...result, details];
      }
      return await Order.findAll(searchCriteria);
    } catch (error) {
      loggers.error(`Order error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * get Total Admin Earning
   * @returns
   */
  async getTotalEarning() {
    try {
      return await OrderProduct.scope('activeOrder').findAll({
        include: [{
          model: Order,
          required: true,
          where: { earningStatus: ['paid', 'pending'], status: { [Op.notIn]: ['pending', 'canceled'] } },
          attributes: [],
        }],
        attributes: [
          [
            Sequelize.fn('sum', Sequelize.col('admin_commission')),
            'adminCommission',
          ],
        ],
        raw: true,
      });
    } catch (error) {
      loggers.error(`Total earning error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Get all best selling products
   * @returns
   */
  async bestSellingProduct(req) {
    try {
      const {
        query: {
          limit, offset, sortBy, toPrice, name, fromPrice,
          status, brandId, sortType,
        },
      } = req;
      let orderBy = [[Sequelize.col('totalSold'), 'DESC']];
      let where = { status: 'active', id: { [Op.in]: [Sequelize.literal('(Select order_products.product_id from order_products join orders on order_products.order_id = orders.id where order_products.status != "deleted"  and orders.status = "completed")')] } };
      const duplicating = { separate: true };
      if (name) {
        where = {
          ...where,
          // having: Sequelize.col('totalSold') > 0,
          [Op.or]: [
            { productName: { [Op.like]: `%${name}%` } },
            { '$Brand.name$': { [Op.like]: `%${name}%` } },
            { '$Brand.store_name$': { [Op.like]: `%${name}%` } },
            { status: { [Op.like]: `%${name}%` } },
            Sequelize.where(
              Sequelize.fn(
                'CONCAT_WS',
                ' ',
                Sequelize.col('Brand.sellerDetails.first_name'),
                Sequelize.col('Brand.sellerDetails.last_name'),
              ),
              'LIKE',
              `%${name}%`,
            ),
          ],
        };
      }
      if (status && status !== 'all') {
        where.status = status;
      }

      if (brandId) {
        where['$Brand.id$'] = brandId;
      }
      // if (fromPrice) {
      //   where.price = { [Op.gte]: Sequelize.literal(`(${fromPrice} - shipping_charges)`) };
      // }
      // if (toPrice) {
      //   where.price = { [Op.lte]: Sequelize.literal(`(${toPrice} - shipping_charges)`) };
      // }
      if (toPrice && fromPrice) {
        // if (toPrice && fromPrice) {
        where = {
          ...where,
          [Op.and]: [
            {
              id: {
                [Op.in]: helper.productDiscountPrice(fromPrice, toPrice),
              },
            },
          ],
        };

        // }
        // where.price = {
        //   [Op.between]: [Sequelize.literal(`(${fromPrice} - shipping_charges)`),
        //     Sequelize.literal(`(${toPrice} - shipping_charges)`)],
        // };
      }
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'brandName':
            orderBy = [
              [Product.associations.Brand, 'name', sortType],
            ];
            break;
          case 'storeName':
            orderBy = [
              [
                Product.associations.Brand,
                'store_name',
                sortType,
              ],
            ];
            break;
          case 'sellerName':
            orderBy = [
              [
                Product.associations.Brand,
                Brand.associations.sellerDetails,
                'first_name',
                sortType,
              ],
            ];
            break;
          case 'new':
            orderBy = [['id', sortType]];
            break;
          case 'customerReview':
            orderBy = [[Sequelize.col('overAllRating'), sortType], [Sequelize.col('ratingCount'), sortType]];
            break;
          case 'popular':
            orderBy = [[helper.popularProduct(), sortType]];
            break;
          case 'price':
            orderBy = [[Sequelize.col('priceSort'), sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: req?.headers?.currencyCode ?? 'INR',
      });
      const activeWhere = { status: 'active' };
      const searchCriteria = {
        where,
        attributes: {
          include: [
            ...helper.productAttributes(
              req?.user?.id ?? 0,
              currencyRate?.rate ?? 0,
            ),
            helper.productPrice(),
          ],
        },
        include: [
          {
            model: OrderProduct,
            required: true,
            ...duplicating,
            include: [
              {
                model: Order,
                required: false,
                where: { status: 'completed' },
                include: [{
                  model: User,
                  as: 'customer',
                  required: false,
                  attributes: ['firstName', 'lastName', 'id'],
                },
                {
                  model: Address,
                  where: activeWhere,
                  required: false,

                },
                ],
              },
            ],
          },
          {
            model: ProductImage,
            as: 'productImage',
            ...duplicating,
            where: activeWhere,
            required: false,
            attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
          },
          {
            model: Brand,
            where: activeWhere,
            required: false,
            attributes: ['name', 'id', 'storeName'],
            include: [
              {
                association: 'sellerDetails',
                where: activeWhere,
                required: false,
                attributes: ['firstName', 'id', 'lastName'],
              },
            ],
          },
          {
            model: ProductDiscount,
            where: activeWhere,
            // ...duplicating,
            required: false,
            include: [
              {
                model: Discount,
                where: activeWhere,
                required: false,
              },
            ],
          },
        ],
        limit: parseInt(Math.abs(limit), 10) || 5,
        offset: parseInt(Math.abs(offset), 10) || 0,
        order: orderBy,
        // group: ['productName'],
        // row: true,
        // logging: true,
      };
      return await Product.scope('notDeletedProduct').findAll(searchCriteria);
    } catch (error) {
      loggers.error(`Order list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * get Order count
   * @returns
   */
  async getOrderCount(req) {
    try {
      const {
        user: { userRole, id },
        status,
      } = req;
      const whereData = { status };
      if (status === 'active') {
        whereData.status = { [Op.in]: ['received', 'packed', 'pickedUp'] };
      }
      let whereProduct = {};
      if (userRole === 'seller') {
        whereProduct = {
          [Op.and]: [{ seller_id: id }],
        };
      }
      return await Order.scope('notDeletedOrder').count({
        where: whereData,
        distinct: true,
        col: 'id',
        include: [
          {
            association: 'orderDetails',
            where: whereProduct,
            attributes: ['orderId'],
            required: true,
          },
        ],
      });
    } catch (error) {
      loggers.error(`order error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Get place order
   * @returns
   */
  async placeOrder(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        user: {
          id, firstName, lastName, email,
        },
        body: {
          order, addressId, cardId, orderTotal, creditPoints, taxPercent,
          userCredit, paymentType, orderTax, creditPointsAmount, orderNumber,
        },
        headers: { currencycode },
      } = req;
      const newOrderId = utils.generateRandomInteger(6);
      const currencyCode = currencycode.toUpperCase() ?? 'INR';
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: currencyCode,
      });
      const { app: { mediaStorage } } = config;
      const orderId = orderNumber || newOrderId;
      let notificationsObj = {};
      const orderData = {
        orderId,
        customerId: id,
        addressId,
        orderAmount: orderTotal,
        creditPoints,
        creditPointsAmount,
        paymentType,
        tax: orderTax,
        currencyRate: currencyRate?.rate ?? 0,
      };
      if (paymentType === 1 && orderTotal > 0) {
        orderData.cardId = cardId;
      } else if (orderTotal === 0) {
        orderData.status = 'received';
      }

      const orderResult = await Order.create(orderData, { transaction });

      let grandTotal = 0;
      const productData = [];
      let invoiceData = {};
      req.orderId = orderResult.id;
      // create transaction here
      if (orderTotal > 0) {
        if (paymentType === 1) {
          req.paymentOption = 'stripe';
        }
        if (paymentType === 4) {
          req.paymentOption = 'paypal';
        }
        const transactionData = await transactionRepository.createTransaction(req, transaction);
        if (['COMPLETED', 'settled', 'succeeded'].includes(transactionData.paymentStatus)) {
          orderResult.set({
            status: 'received',
          });
          await orderResult.save({ transaction });
          if (orderResult.status === 'received') {
            const object = {
              userName: firstName,
              email,
              orderId: orderResult.orderId,
              dateTime: utils.getLocaleDate() ?? '',
            };
            // Change password email send
            emailServices.OrderConfirmation(object);
          }

          // Start function for generate order invoice
          const userAddress = await Address.findOne({ where: { id: addressId } });

          invoiceData = {
            images: {
              logo: 'https://public.easyinvoice.cloud/img/logo_en_original.png',
            },
            client: {
              company: userAddress?.fullName ?? 'Dear',
              address: userAddress?.address ?? '',
            },
            information: {
              number: orderId,
              date: utils.getCurrentLocalDate(),
            },
            settings: {
              currency: currencyCode,
            },
          };
        }
      }

      const generalSetting = await GeneralSetting.findOne({ where: { key: 'minimum_quantity_product' } });
      const generalSettingTax = await GeneralSetting.findOne({ where: { key: 'tax' } });

      await Promise.all(
        order.map(async (element) => {
          const product = await Product.findOne({
            where: { id: element.productId },
          });
          const commissionData = await Brand.findOne({
            where: { userId: product.sellerId },
          });
          const adminCommission = (parseFloat(element.productAmount)
            * parseFloat(commissionData.commission)) / 100;
          const sellerCommission = parseFloat(element.productAmount) - parseFloat(adminCommission);
          const tax = (Math.floor(
            ((element.productAmount + element.shippingCharges) * taxPercent.value),
          )) / 100;
          const totalAmount = element.productAmount
            + element.shippingCharges + tax;
          const orderProduct = {
            orderId: orderResult.id,
            productId: element.productId,
            sellerId: product.sellerId,
            quantity: element.quantity,
            amount: element.productAmount,
            countryCurrencyAmount: element.countryCurrencyAmount,
            currencyCode: currencycode,
            commission: commissionData.commission,
            adminCommission,
            sellerCommission,
            shippingCharges: element.shippingCharges,
            brandId: commissionData.id,
            tax,
            totalAmount,
          };
          grandTotal += parseFloat(element?.countryCurrencyAmount);

          await OrderProduct.create(orderProduct, { transaction });
          const remainQuantity = parseInt(product.quantity, 10) - parseInt(element.quantity, 10);

          // let productStatus = 'inStock';
          // Out of stock notification
          if (remainQuantity === 0) {
            notificationRepository.productNotification({
              productName: product?.productName,
              sellerId: product?.sellerId,
              type: 'outOfStock',
            });
            // productStatus = 'outOfStock';
          } else if (remainQuantity <= parseInt(generalSetting?.value, 10)
            && remainQuantity >= 1 && product?.productStatus !== 'lowInventory') {
            notificationRepository.productNotification({
              productName: product?.productName,
              sellerId: product?.sellerId,
              type: 'lowInventory',
              quantity: remainQuantity,
            });
            // productStatus = 'lowInventory';
            // Low inventory notification
          }
          // product.set({
          //   quantity: remainQuantity, productStatus,
          // });
          // await product.save({ transaction });
          // Send notifications seller
          const customerName = `${firstName ?? ''} ${lastName ?? ''}`;
          const dateTime = utils.getCurrentLocalDate(Date(), 'YYYY-MM-DD HH:mm:ss');
          notificationsObj = {
            orderId, type: 'place_order_seller', userId: product?.sellerId, customerName, dateTime, id: req?.orderId,
          };
          notificationRepository.orderNotification(notificationsObj);
          // Send notifications admin
          notificationsObj = {
            orderId, type: 'place_order_admin', storeName: commissionData?.storeName, customerName, dateTime, id: req?.orderId,
          };
          notificationRepository.orderNotification(notificationsObj);
          const price = parseFloat(element?.countryCurrencyAmount)
            / parseInt(element?.quantity, 10);
          productData.push({
            quantity: parseInt(element?.quantity, 10) ?? 0,
            description: product?.productName,
            price,
            total: parseFloat(element?.countryCurrencyAmount),
          });
        }),
      );
      const userCreditPoints = parseInt(creditPoints, 10) > 0 ? parseInt(creditPoints, 10) : '';
      const grantTotal = parseFloat(orderTotal) + parseFloat(creditPointsAmount);
      const creditData = userCreditPoints ? `<p style="text-align:right;">Credit point : ${userCreditPoints}</p>` : '';
      const html = `<html><head><title>Order Invoice | Morluxury</title></head><body style="font-family: inherit;"><h1>Morluxury</h1><p style="font-weight: bold;">Invoice number %number%</p><p>%date%</p><p>%company-to%</p><p>%address-to%</p><table cell-padding="10" style="width:100%;border-collapse: collapse;border-spacing: 30px;" border="1"><tr><td style="font-weight: bold;">Product</th><td style="font-weight: bold;">Quantity</th><td style="font-weight: bold;">Price</th><td style="font-weight: bold;">Total</th></tr><products><tr><td>%description%</td><td>%quantity%</td><td>%price%</td><td>%row-total%</td></tr></products></table><p style="text-align:right;">Total : ₹${grandTotal}</p><p style="text-align:right;">Tax (${generalSettingTax?.value}%) : ₹${orderTax}</p>${creditData}<p style="text-align:right; font-weight: bold;">Total : ₹${grantTotal}</p></body></html>`;
      const buff = Buffer.from(html, 'utf8');
      const base64data = buff.toString('base64');
      invoiceData = { customize: { template: base64data }, ...invoiceData };
      invoiceData.products = productData;
      if (creditPoints > 0) {
        const remainPoint = userCredit.creditPoints - creditPoints;
        userCredit.set({
          creditPoints: remainPoint,
        });
        await userCredit.save({ transaction });
      }
      Cart.update({ status: 'deleted' }, { where: { userId: id } }, { transaction });

      // Invoice generate
      const distFilePath = path.join(
        __dirname,
        '../../public/uploads/order',
      );
      // Invoice destination create Folder
      if (!fs.existsSync(distFilePath)) {
        fs.mkdirSync(distFilePath, { recursive: true });
      }
      const invoicePath = `public/uploads/order/${orderId}-order-invoice.pdf`;
      if (mediaStorage === 'local') {
        easyInvoice.createInvoice(invoiceData, (result) => {
          fs.writeFileSync(`${distFilePath}/${orderId}-order-invoice.pdf`, result.pdf, 'base64');
        });
      } else {
        easyInvoice.createInvoice(invoiceData, async (result) => {
          await bucketServices.uploadBase64ImageOnS3Bucket(result, invoicePath);
        });
      }

      // End function for generate order invoice

      orderResult.set({
        invoiceImage: invoicePath,
      });
      await orderResult.save({ transaction });
      await transaction.commit();
      notificationsObj = {
        orderId, type: 'place_order_customer', userId: id, id: req?.orderId,
      };
      notificationRepository.orderNotification(notificationsObj);
      return { orderId };
    } catch (error) {
      transaction.rollback();
      loggers.error(`Place order error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * get Total Seller Earning
   * @returns
   */
  async getSellerTotalEarning(req) {
    try {
      const {
        user: { id },
      } = req;
      return await OrderProduct.scope('notDeletedOrder').findAll({
        where: { seller_id: id },
        include: [{
          model: Order,
          required: true,
          where: { earningStatus: ['paid', 'pending'], status: { [Op.notIn]: ['pending', 'canceled'] } },
          attributes: [],
        }],
        attributes: [
          [
            Sequelize.fn('sum', Sequelize.col('seller_commission')),
            'sellerCommission',
          ],
        ],
        raw: true,
      });
    } catch (error) {
      loggers.error(`Total earning error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Check order exist or not
   * @param {object} where
   * @returns
   */
  async orderExist(where) {
    try {
      return await OrderProduct.scope('notDeletedOrder').findOne(
        where,
      );
    } catch (error) {
      loggers.error(`Order detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
 * Check order exist or not
 * @param {object} where
 * @returns
 */
  async orderProductExist(where) {
    try {
      return await OrderProduct.scope('notDeletedOrder').findOne(
        {
          where,
          include: {
            model: Order.scope('notDeletedOrder'),
          },
        },
      );
    } catch (error) {
      loggers.error(`Order detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
 * Get credit points value
 * @param {object} where
 * @returns
 */
  async getCreditPointValue(key) {
    try {
      return await GeneralSetting.findOne({ where: { key } });
    } catch (error) {
      loggers.error(`Order detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * get Order count
   * @returns
   */
  async orderUpdateWebHook(req) {
    try {
      const event = req.body;
      const { orderId } = event.data.object.metadata;
      if (orderId && event.type === 'charge.succeeded') {
        await Order.update(
          { status: 'received' },
          { where: { id: orderId } },
        );
      } else if (orderId && event.type === 'charge.refunded') {
        const orderDetails = await Order.findOne({ where: { id: orderId } });
        if (orderDetails.status !== 'canceled') {
          const user = await User.scope('notDeletedUser').findOne({
            where: { id: orderDetails.customerId },
          });
          const points = parseInt(user.creditPoints, 10) + parseInt(orderDetails.creditPoints, 10);
          await user.update({ creditPoints: points });
          await Order.update(
            { status: 'canceled' },
            { where: { id: orderId } },
          );
          const productData = await OrderProduct.findAll({ where: { orderId } });
          await Promise.all(
            productData.map(async (element) => {
              const product = await Product.findOne({ where: { id: element.productId } });
              const quantity = parseInt(product.quantity, 10) + parseInt(element.quantity, 10);
              product.set({
                quantity,
              });
              await product.save();
            }),
          );
        }
      }
      return true;
    } catch (error) {
      loggers.error(`order webhook: ${error}`);
      throw Error(error);
    }
  },

  /**
   * order Details
   * @param {object} req
   * @returns
   */
  async sellerOrderDetails(req) {
    try {
      const {
        params: { id },
        user,
      } = req;
      const where = { id };
      let searchCriteria = { where };
      searchCriteria = {
        ...searchCriteria,
        attributes: [
          'id', 'orderId', 'tax', 'currencyRate', 'cardId', 'invoiceImageUrl', 'invoiceImage', 'orderAmount', 'creditPoints', 'creditPointsAmount', 'trackingLink', 'paymentType', 'earningStatus', 'status', 'packedOn', 'pickedUpOn', 'deliveredOn', 'canceledOn', 'createdAt',
          helper.sumQueryBySeller('order_products', 'amount', 'totalAmount', user.id),
          helper.sumQueryBySeller('order_products', 'total_amount', 'AmountWithTax', user.id),
        ],
        include: [
          {
            model: User,
            as: 'customer',
            required: false,
            attributes: ['firstName', 'lastName', 'id', 'phoneNumber', 'phoneNumberCountryCode'],
          },
          {
            model: Address,
            required: false,

          },
          {
            association: 'orderDetails',
            where: { sellerId: user.id },
            required: true,
            include: [
              {
                model: Product,
                attributes: ['productName', 'id'],
                required: false,
                include: [
                  {
                    model: ProductImage,
                    as: 'productImage',
                    attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
                    required: false,
                  },
                  {
                    model: ReviewRating,
                    as: 'productReviewRating',
                    on: {
                      col1: models.sequelize.where(
                        models.sequelize.col('Order.id'),
                        '=',
                        models.sequelize.col('orderDetails.Product.productReviewRating.order_id'),
                      ),
                    },
                    required: false,
                  },
                  {
                    model: SellerProductVariant,
                    as: 'sellerProductVariantDetails',
                    required: false,
                    include: [
                      {
                        model: ProductVariantAttribute,
                        required: false,
                      },
                      {
                        model: ProductVariant,
                        required: false,
                      },
                    ],
                  },
                ],
              },
              {
                model: User,
                as: 'seller',
                attributes: ['firstName', 'lastName', 'id'],
                required: false,
              },
            ],
          },
        ],
      };

      return await Order.findAll(searchCriteria);
    } catch (error) {
      loggers.error(`Order error: ${error}`);
      throw Error(error);
    }
  },
  /*
   * Get shipping link
   * @returns
   */
  async getShippingLink(id) {
    try {
      const orderDetails = await Order.scope('notDeletedOrder').findOne(
        {
          where: { id },
          include: [
            {
              model: User,
              as: 'customer',
              required: false,
              attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'id'],
            },
            {
              model: Address,
              required: false,
              attributes: ['address', 'landmark', 'zipCode', 'id', 'city', 'state'],
            },
            {
              association: 'orderDetails',
              required: true,
              include: [
                {
                  model: Product,
                  attributes: ['productName', 'weight', 'productId', 'id', 'price'],
                  required: false,

                },
                {
                  model: User,
                  as: 'seller',
                  attributes: ['firstName', 'lastName', 'id'],
                  required: false,
                },
              ],
            },
          ],
        },
      );

      const code = Product?.weight > 4 ? 'ePAQ' : 'A122';
      let totalWeight = 0;
      const item = [];
      orderDetails.orderDetails.map(async (element) => {
        totalWeight += element.Product?.weight ?? 2;
        return item.push(
          {
            sku: element.Product.productId,
            unitPrice: element.Product.price,
            quantity: element.quantity,
            unitWeight: element.Product?.weight ?? 2,
            countryOfOrigin: 'IN',
            itemDescription: 'item description',
          },
        );
      });

      const {
        shippingApiKey: {
          username, password, asendiaKey, accountNumber, shippingApiUrl, shippingPhone,
          shippingEmail, shippingCity, shippingState, shippingZipCode, shippingAddress,
        },
      } = config;

      const requestData = JSON.stringify({
        accountNumber,
        processingLocation: 'LAX',
        labelType: 'PNG',
        orderNumber: orderDetails.orderId,
        dispatchNumber: '1',
        packageID: orderDetails.orderId,
        returnPhone: orderDetails.customer?.phoneNumber ?? shippingPhone,
        returnEmail: orderDetails.customer?.email ?? shippingEmail,
        recipientCity: orderDetails.Address?.city ?? shippingCity,
        recipientProvince: orderDetails.Address?.state ?? shippingState,
        recipientPostalCode: orderDetails.Address?.zipCode ?? shippingZipCode,
        recipientCountryCode: 'IN',
        recipientPhone: orderDetails.customer?.phoneNumber ?? shippingPhone,
        recipientEmail: orderDetails.customer?.email ?? shippingEmail,
        totalPackageWeight: totalWeight ?? 2,
        weightUnit: 'Lb',
        contentType: 'D',
        currencyType: 'USD',
        productCode: code,
        sellerName: 'mor luxury',
        sellerCity: 'bhopal',
        sellerPhone: shippingPhone,
        sellerEmail: 'seller@example.com',
        sellerAddressLine1: 'us los angeles',
        sellerCountryCode: 'US',
        returnCity: 'indore',
        returnLastName: 'mor luxury',
        returnProvince: 'US',
        returnFirstName: 'mor luxury',
        returnPostalCode: '452001',
        recipientFirstName: orderDetails.customer?.firstName,
        recipientLastName: orderDetails.customer?.lastName,
        recipientBusinessName: orderDetails.customer?.lastName,
        returnCountryCode: 'US',
        returnAddressLine1: 'atlantis',
        recipientAddressLine1: `${orderDetails?.Address?.address ? orderDetails?.Address?.address.substring(0, 50) : shippingAddress.substring(0, 50)}`,
        recipientAddressLine2: orderDetails?.Address?.landmark
          ? orderDetails?.Address?.landmark.substring(0, 50) : '',
        recipientAddressLine3: orderDetails?.Address?.landmark
          ? orderDetails?.Address?.landmark.substring(51, 100) : '',
        items: item,
      });

      const axiosData = {
        method: 'post',
        url: `${shippingApiUrl}Package`,
        headers: {
          'X-AsendiaOne-ApiKey': asendiaKey,
          'X-AsendiaOne-DataSource': 'IGNORE',
          'Content-Type': 'application/json',
        },
        auth: {
          username,
          password,
        },
        data: requestData,
      };
      return await axios(axiosData);
    } catch (error) {
      loggers.error(`Shipping  charges error: ${error}`);
      return error;
      // throw Error(error);
    }
  },

  /**
   * Get shipping link
   * @returns
   */
  async cancelOrder(order) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        id, orderAmount, creditPoints, customerId, paymentType,
      } = order;

      // if (status === 'canceled' || status !== 'received') {
      //   throw new Error(utils.getMessage('', false, 'CANNOT_CANCELED'));
      // }

      if (creditPoints > 0) {
        const user = await User.scope('notDeletedUser').findOne({
          where: { id: customerId },
        });
        const points = parseInt(user.creditPoints, 10) + parseInt(creditPoints, 10);
        await user.update({ creditPoints: points }, { transaction });
      }
      if ((parseInt(paymentType, 10) === 1 || parseInt(paymentType, 10) === 4) && orderAmount > 0) {
        const transactions = await Transaction.findOne({
          where: {
            orderId: id,
            paymentStatus: { [Op.or]: ['succeeded', 'Completed', 'submitted_for_settlement', 'settling', 'settled'] },
          },
        });

        if (transactions) {
          if (parseInt(paymentType, 10) === 1) {
            const refundData = await stripe.RefundCharge(transactions.paymentId, id);
            const refundStatus = refundData.status === 'succeeded' ? 'refunded' : 'failed';
            const transactionData = {
              paymentId: refundData.id,
              orderId: id,
              status: refundStatus,
              apiResponse: JSON.stringify(refundData),
              paymentStatus: refundData.status,
            };
            await Transaction.create(transactionData, { transaction });
          } else if (parseInt(paymentType, 10) === 4) {
            // let refundData;
            const apiResp = JSON.parse(transactions?.apiResponse);

            // const currentStatus = await brainTreeService
            //   .getCurrentTransactionStatus(transactions.paymentId);
            // if (currentStatus?.status === 'submitted_for_settlement') {
            //   refundData = await brainTreeService.voidOrder(transactions.paymentId);
            // } else {
            //   refundData = await brainTreeService.refundOrder(transactions.paymentId);
            // }
            const captureId = apiResp?.purchase_units[0]?.payments?.captures[0]?.id;

            const refundData = await paypalService.refundPayment(captureId);
            const refundStatus = refundData?.status ? 'refunded' : 'failed';
            // console.log('refundData', refundData?.id, refundData?.status);
            const transactionData = {
              paymentId: refundData?.id,
              orderId: id,
              status: refundStatus,
              apiResponse: JSON.stringify(refundData),
              paymentStatus: refundData?.status ?? 'failed',
            };
            await Transaction.create(transactionData, { transaction });
          }
        }
      }
      const productData = await OrderProduct.findAll({ where: { orderId: id } });
      await Promise.all(
        productData.map(async (element) => {
          const product = await Product.findOne({ where: { id: element.productId } });
          const quantity = parseInt(product.quantity, 10) + parseInt(element.quantity, 10);
          product.set({
            quantity,
          });
          await product.save({ transaction });
        }),
      );
      await transaction.commit();
      return true;
    } catch (error) {
      transaction.rollback();
      loggers.error(`Cancel order error: ${error}`);
      throw Error(error);
    }
  },
  /*
   *get like and similar product details
   * @returns
   */
  async getSimilarProducts(order) {
    try {
      const productId = [];
      const childCategory = order[0].orderDetails.map((ele) => {
        productId.push(ele.Product.id);
        return ele.Product.childCategoryId;
      });
      const currencyRate = await addressRepository.exchangeCurrencyGet({ name: 'INR' });
      const productInclude = [
        {
          model: ProductDiscount,
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: Discount,
              where: { status: 'active' },
              required: false,
            },
          ],
        },
        {
          model: ProductImage,
          as: 'productImage',
          required: true,
          where: { status: 'active' },
        },
        {
          model: ReviewRating,
          as: 'productReviewRating',
          required: false,
          where: { status: 'active' },
        },
        {
          model: Brand,
          where: { status: 'active' },
          required: false,
          attributes: ['name', 'id', 'storeName'],
          include: [
            {
              association: 'sellerDetails',
              where: { status: 'active' },
              required: false,
              attributes: ['firstName', 'id', 'lastName'],
            },
          ],
        },
      ];
      const similarProduct = await Product.findAll({
        where: {
          childCategoryId: childCategory[0],
          status: 'active',
          id: { [Op.notIn]: productId },
        },
        attributes: {
          include: [
            ...helper.productAttributes(order?.customerId ?? 0, currencyRate?.rate ?? 0),
            ...helper.reviewRating(),
          ],
        },
        include: productInclude,
      });
      const customerLikedProduct = await Product.findAll({
        where: { status: 'active' },
        attributes: {
          include: [
            ...helper.productAttributes(order?.customerId ?? 0, currencyRate?.rate ?? 0),
            ...helper.reviewRating(),
          ],
        },
        include: [
          {
            model: ProductWishlist,
            required: true,
            where: { status: 'active', userId: { [Op.not]: order[0].customer.id } },
          },
          ...productInclude,
        ],

      });
      return {
        similarProduct,
        customerLikedProduct,
      };
    } catch (error) {
      loggers.error(`Similar product error: ${error}`);
      throw Error(error);
    }
  },

  async trackOrder(orderId) {
    try {
      const {
        shippingApiKey: {
          username, password, trackUrl, asendiaKey,
        },
      } = config;
      return await axios.get(trackUrl, {
        params: {
          trackingNumberVendor: orderId,
        },
        headers: { 'X-AsendiaOne-ApiKey': asendiaKey },
        auth: {
          username,
          password,
        },
      });
    } catch (error) {
      loggers.error(`tracking error: ${error}`);
      return error;
      // throw Error(error);
    }
  },

  async orderPickedUpStatusChange() {
    try {
      let data = {};
      let delivered = false;
      const allOrders = await Order.scope('pickedUpOrder').findAll({
        include: [{
          association: 'orderDetails',
          required: true,
        }],
      });
      await allOrders.map(async (element) => {
        const orderStatus = await this.trackOrder(element.trackingNumber);
        if (orderStatus) {
          const statusData = { ...orderStatus.data };
          const orderStatusData = statusData?.trackingMilestone?.trackingMilestoneEvents;
          if (orderStatusData) {
            orderStatusData.filter((el) => {
              if (el.eventCode === 's10') {
                data = el;
                delivered = true;
                return true;
              }
              return true;
            });
            if (delivered) {
              await Order.update(
                { status: 'completed', deliveredOn: data.eventOn },
                {
                  where: {
                    id: element.id,
                  },
                },
              );
              // Seller notifications
              if (element?.orderDetails && element?.orderDetails.length > 0) {
                const sellerDetails = element?.orderDetails;
                sellerDetails.map((item) => notificationRepository.orderNotification({
                  userId: element?.sellerId,
                  id: parseInt(item?.id, 10),
                  orderId: element?.orderId,
                  type: 'orderDelivered',
                }));
              }
              // Admin notifications
              notificationRepository.orderNotification({
                id: parseInt(element.id, 10),
                type: 'orderDelivered',
                orderId: element?.orderId,
              });
              data = {};
              return true;
            }
            return true;
          }
        }
        return true;
      });
      return true;
    } catch (error) {
      throw Error(error);
    }
  },

  async verifypaytmToken(req) {
    try {
      const { query, user: { id } } = req;
      const bodyData = {

        orderId: query.orderId,
        value: query.amount,
        userId: id,
      };
      const signature = await paytmService.verifyPayTmSignature(bodyData);
      const data = JSON.parse(signature);
      data.orderId = query.orderId;
      return data;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   *
   * @param {*} req
   * @returns order link
   */
  async PaypalOrder(req) {
    try {
      const { body: { amount } } = req;
      const orderDetails = await paypalService.createOrder(amount);
      return orderDetails?.data;
    } catch (error) {
      loggers.error(
        `Paypal order create error : ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * get Order count
   * @returns
   */
  async paypalToken() {
    try {
      const result = await brainTreeService.createToken();
      return result;
    } catch (error) {
      loggers.error(`paypal order webhook: ${error}`);
      throw Error(error);
    }
  },

  /**
   *paypal webhook
   * @returns
   */
  async paypalWebhook(req) {
    try {
      const event = req?.body;
      console.log('eventevent', event);
      const stringify = JSON.stringify(event) ?? '';
      loggers.error(`paypal webhook stringify: ${stringify}`);

      loggers.error(`paypal webhook log: ${event}`);
      return true;
    } catch (error) {
      loggers.error(`Paypal webhook error log: ${error}`);
      throw Error(error);
    }
  },
};
