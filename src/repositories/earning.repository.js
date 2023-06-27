/* eslint-disable consistent-return */
import Sequelize, { Op } from 'sequelize';
import models from '../models/index';
import utils from '../utils/index';
import loggers from '../services/logger.service';
import helper from '../helper/subQuery';

const {
  Product, Address, User, Order, OrderProduct, SellerProductVariant, ProductVariantAttribute,
  ProductVariant, ReviewRating, Brand, ProductImage,
} = models;
export default {
  /**
   * Earning Listing
   * @param {object} req
   * @returns
   */
  async getAllEarning(req) {
    try {
      const {
        query: {
          limit,
          offset,
          name,
          sortBy,
          sortType,
          status,
          year,
          toDate,
          fromDate,
        },
        headers: { timezone },
        user: { userRole, id },
      } = req;
      const appTimezone = timezone || 'Asia/kolkata';
      let duplicating = { separate: true };
      let where = {};
      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'createdOn':
            orderBy = [['created_at', sortType]];
            break;
          case 'customerName':
            orderBy = [
              [
                Order.associations.customer,
                'first_name',
                sortType,
              ],
            ];
            break;
          case 'productName':
            orderBy = [
              [
                Order.associations.orderDetails, OrderProduct.associations.Product,
                'product_name',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'totalAmount':
            orderBy = [[Order.associations.orderDetails, 'total_amount', sortType]];
            duplicating = { duplicating: false };
            break;
          case 'myEarning':
            orderBy = [[Order.associations.orderDetails, 'admin_commission', sortType]];
            duplicating = { duplicating: false };
            break;
          case 'sellerShare':
            orderBy = [
              [Order.associations.orderDetails, 'seller_commission', sortType],
            ];
            duplicating = { duplicating: false };
            break;
          case 'status':
            orderBy = [['earning_status', sortType]];
            break;
          case 'orderId':
            orderBy = [['order_id', sortType]];
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
            { '$customer.first_name$': { [Op.like]: `%${name}%` } },
            { '$customer.last_name$': { [Op.like]: `%${name}%` } },
            { '$Order.order_id$': { [Op.like]: `%${name}%` } },
            { '$Order.order_amount$': { [Op.like]: `%${name}%` } },
            { '$orderDetails.admin_commission$': { [Op.like]: `%${name}%` } },
            { '$orderDetails.seller_commission$': { [Op.like]: `%${name}%` } },
            { '$Order.earning_status$': name },
          ],
        };
        duplicating = { duplicating: false };
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
      } else if (year && year !== 'all') {
        where = {
          ...where,
          [Op.and]: Sequelize.where(
            Sequelize.fn('YEAR', Sequelize.col('Order.created_at')),
            year,
          ),
        };
      }

      if (status && status !== 'all' && status !== 'All') {
        where.earning_status = status;
      }

      // const whereProduct = { status: { [Op]: 'deleted' } };
      const attributes = [
        'id',
        'orderId',
        'earningStatus',
        'status',
        'createdAt',
        'deliveredOn'];
      if (userRole === 'seller') {
        where.id = helper.orderIds(id);
        attributes.push(helper.sumQueryBySeller('order_products', 'admin_commission', 'adminCommission', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'amount', 'totalAmount', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'seller_commission', 'sellerCommission', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'tax', 'totalTax', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'total_amount', 'AmountWithTax', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'shipping_charges', 'totalShippingCharges', id));
        attributes.push(helper.sumQueryBySeller('order_products', 'quantity', 'quantity', id));
      } else {
        attributes.push(helper.sumQuery('order_products', 'quantity', 'quantity'));
        attributes.push(helper.sumQuery('order_products', 'admin_commission', 'adminCommission'));
        attributes.push(helper.sumQuery('order_products', 'amount', 'totalAmount'));
        attributes.push(helper.sumQuery('order_products', 'seller_commission', 'sellerCommission'));
        attributes.push(helper.sumQuery('order_products', 'shipping_charges', 'totalShippingCharges'));
        attributes.push(helper.sumQuery('order_products', 'tax', 'totalTax'));
        attributes.push(helper.sumQuery('order_products', 'total_amount', 'AmountWithTax'));
      }
      where.status = { [Op.notIn]: ['pending', 'canceled'] };
      let searchCriteria = { order: orderBy, where };
      searchCriteria = {
        ...searchCriteria,
        attributes,
        col: 'id',
        distinct: true,
        include: [
          {
            model: User,
            as: 'customer',
            required: false,
            attributes: ['firstName', 'lastName', 'id'],
          },
          {
            model: Address,
            required: false,
          },
          {
            association: 'orderDetails',
            // where: whereProduct,
            ...duplicating,
            attributes: [
              'orderId',
            ],
            required: true,
            include: [
              {
                model: Product,
                attributes: ['productName', 'id'],
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
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
      };

      return await Order.findAndCountAll({ ...searchCriteria, subQuery: false });
    } catch (error) {
      loggers.error(
        `Earning list error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * earning detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Order.findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Earning detail error: ${error}`);
      throw Error(error);
    }
  },

  /*
   * Earning status update
   * @param {object} req
   * @returns
   */
  async earningStatusUpdate(req) {
    try {
      const {
        body: { status },
        params: { orderId },
      } = req;
      return await Order.update(
        {
          earningStatus: status,
        },
        { where: { id: orderId } },
      );
    } catch (error) {
      loggers.error(
        `Earning Status update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },
  /**
   * Earning graph Listing
   * @param {object} req
   * @returns
   */
  async getEarningsGraph(req) {
    try {
      const {
        query,
        user: { userRole, id },
        headers: { timezone },
      } = req;
      const {
        year, toDate, fromDate, status,
      } = query;
      if (!year) query.year = utils.currentYear();
      const appTimezone = timezone || 'Asia/kolkata';
      let where = {};
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
      } else {
        where = {
          ...where,
          [Op.and]: Sequelize.where(
            Sequelize.fn('YEAR', Sequelize.col('Order.created_at')),
            query.year,
          ),
        };
      }

      if (status && status !== 'all') {
        where.earning_status = status;
      }
      let whereProduct = {};
      if (userRole === 'seller') {
        whereProduct = {
          [Op.and]: [{ seller_id: id }],
        };
      }

      const searchCriteria = {
        where: { ...where, earningStatus: ['paid', 'pending'], status: { [Op.notIn]: ['pending', 'canceled'] } },
        group: Sequelize.fn('MONTH', Sequelize.col('Order.created_at')),
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('Order.created_at')), 'month'],
          [Sequelize.fn('SUM', Sequelize.col('orderDetails.admin_commission')), 'adminCommission'],
          [Sequelize.fn('SUM', Sequelize.col('orderDetails.seller_commission')), 'sellerCommission'],
        ],
        include: [
          {
            association: 'orderDetails',
            attributes: [],
            where: whereProduct,
            required: true,
          },
        ],
        raw: true,
      };
      const result = await Order.findAll(searchCriteria);
      const finalData = [];
      const monthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      monthNames.forEach((everyMonth) => {
        const item = result.find((items) => items.month === everyMonth);
        result.find((items) => items.month === everyMonth);
        if (item) {
          finalData.push(item);
        } else {
          finalData.push({
            month: everyMonth,
            adminCommission: 0,
            sellerCommission: 0,
          });
        }
      });
      return finalData;
    } catch (error) {
      loggers.error(
        `Earning graph error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },
  /**
 * earning Details
 * @param {object} req
 * @returns
 */
  async earningDetails(req) {
    try {
      const {
        params: { id },
      } = req;

      const where = { id };
      let searchCriteria = { where };
      searchCriteria = {
        ...searchCriteria,
        attributes: [
          'id', 'orderId', 'currencyRate', 'cardId', 'invoiceImageUrl', 'invoiceImage', 'tax', 'orderAmount', 'creditPoints', 'creditPointsAmount', 'trackingLink', 'paymentType', 'earningStatus', 'status', 'packedOn', 'pickedUpOn', 'deliveredOn', 'canceledOn', 'createdAt',

          [Sequelize.literal('(credit_points_amount/currency_rate)'), 'creditAmountUsd'],
          helper.sumQuery('order_products', 'total_amount', 'AmountWithTax'),
          helper.sumQuery('order_products', 'shipping_charges', 'shippingCharges'),
          helper.sumQuery('order_products', 'amount', 'totalAmount'),
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
            required: true,
            include: [
              {
                model: User,
                as: 'seller',
                attributes: ['firstName', 'lastName', 'id'],
                required: false,
              },
              {
                model: Brand,
                attributes: ['id', 'name',
                  helper.avgQueryGroupBy('order_products', 'commission', 'commission'),
                  helper.sumQueryGroupBy('order_products', 'amount', 'totalAmount'),
                  helper.sumQueryGroupBy('order_products', 'admin_commission', 'adminCommission'),
                  helper.sumQueryGroupBy('order_products', 'seller_commission', 'sellerCommission')],
                required: false,
              },
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
            ],
          },
        ],
      };
      const brandArray = [];
      const innerArray = [];
      const result = await Order.findOne(searchCriteria);
      result.orderDetails.map((element, i) => {
        const data = result.orderDetails.filter((el) => element.brandId === el.brandId);
        if (!innerArray.includes(element.brandId)) {
          brandArray[i] = data;
        }
        innerArray.push(element.brandId);
        return data;
      });
      delete result.orderDetails;
      result.brandDetails = brandArray;
      return { result, brandArray };
    } catch (error) {
      loggers.error(`Order error: ${error}`);
      throw Error(error);
    }
  },
};
