/* eslint-disable consistent-return */
import { Op } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utils from '../utils';
import notificationRepository from './notification.repository';

const {
  ShippingLog, Product, ProductImage, ProductVariantAttribute, ProductVariant, Brand,
  SellerProductVariant, SubCategory, Category, GeneralSetting,
} = models;

export default {
  /**
   * Add Shipping Log
   * @param {object} req
   * @returns
   */
  async addShippingLog(req) {
    try {
      const { body, user, product } = req;
      const { productName } = product;
      if (user) {
        body.sellerId = user.id;
      }
      const result = await ShippingLog.create(body);
      notificationRepository.productNotification({
        productName,
        type: 'shipped',
        sellerName: `${product?.Brand?.sellerDetails.firstName || ''} ${product?.Brand?.sellerDetails.lastName || ''}`,
      });
      return result;
    } catch (error) {
      loggers.error(`Product add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * All Shipping Logs Listing
   * @param {object} req
   * @returns
   */
  async getShippingLogs(req) {
    try {
      const {
        query: {
          limit, offset, sortBy, sortType, productId, sellerId, search,
        }, user: { id, userRole },
      } = req;
      let orderBy = [['createdAt', 'DESC']];
      const duplicating = { separate: true };
      const scope = 'notDeletedShippingLog';
      let where = {};
      const activeWhere = { status: { [Op.ne]: 'deleted' } };
      const scopes = req.query.scope ? req.query.scope : scope;
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'brandName':
            orderBy = [[ShippingLog.associations.Product, Product.associations.Brand, 'name', sortType]];
            break;
          case 'categoryName':
            orderBy = [[ShippingLog.associations.Product, Product.associations.categoryDetails, 'name', sortType]];
            break;
          case 'productName':
            orderBy = [[ShippingLog.associations.Product, 'product_name', sortType]];
            break;
          case 'price':
            orderBy = [[ShippingLog.associations.Product, 'price', sortType]];
            break;
          case 'subCategoryName':
            orderBy = [[ShippingLog.associations.Product, Product.associations.subCategoryDetails, 'name', sortType]];
            break;
          case 'variantName':
            orderBy = [
              [
                ShippingLog.associations.Product,
                Product.associations.sellerProductVariantDetails,
                SellerProductVariant.associations.ProductVariant,
                'name',
                sortType,
              ],
            ];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { '$Product.product_name$': { [Op.like]: `%${search}%` } },
            { '$Product.Brand.name$': { [Op.like]: `%${search}%` } },
            { '$Product.categoryDetails.name$': { [Op.like]: `%${search}%` } },
            { '$Product.price$': { [Op.like]: `%${search}%` } },
            { shippingStatus: search },
          ],
        };
      }
      if (productId) {
        where.productId = productId;
      }
      if (userRole === 'seller') {
        where['$Product.seller_id$'] = id;
      }
      if (sellerId) {
        where['$Product.seller_id$'] = sellerId;
      }
      let searchCriteria = {
        order: orderBy, where, col: 'id', distinct: true,
      };
      if (scopes === 'notDeletedShippingLog') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          include: [{
            model: Product,
            where: activeWhere,
            required: false,
            include: [{
              model: Category,
              as: 'categoryDetails',
              where: activeWhere,
              attributes: ['name', 'id'],
              required: false,
            },
            {
              model: SubCategory,
              as: 'subCategoryDetails',
              where: activeWhere,
              attributes: ['name', 'id'],
              required: false,
            },
            {
              association: 'childCategoryDetails',
              where: activeWhere,
              required: false,
            },
            {
              association: 'sellerProductVariantDetails',
              where: activeWhere,
              ...duplicating,
              required: false,
              include: [{
                model: ProductVariantAttribute,
                where: activeWhere,
                required: false,
              },
              {
                model: ProductVariant,
                where: activeWhere,
                required: false,
              }],
            },
            {
              model: Brand,
              where: activeWhere,
              required: false,
              attributes: ['name', 'id', 'storeName'],
              include: [{
                association: 'sellerDetails',
                where: activeWhere,
                required: false,
                attributes: ['firstName', 'id', 'lastName'],
              }],
            },
            {
              model: ProductImage,
              as: 'productImage',
              order: [['createdAt', 'ASC']],
              where: activeWhere,
              ...duplicating,
              required: false,
              attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
            },
            ],
          }],
        };
      }
      const data = await ShippingLog.scope(scopes).findAndCountAll(searchCriteria);
      const result = { ...data };
      if (productId && userRole === 'seller') {
        result.productDetails = await Product.scope('notDeletedProduct').findOne({
          where: { id: productId },
          include: [{
            model: ProductImage,
            as: 'productImage',
            where: activeWhere,
            required: false,
            attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
          },
          {
            model: Brand,
            where: activeWhere,
            required: false,
            attributes: ['name', 'id', 'storeName'],
          }],
        });
      }
      return result;
    } catch (error) {
      loggers.error(`Product list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Shipping log status update
   * @param {object} req
   * @returns
   */
  async statusUpdate(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body: { quantity }, shippingLog } = req;
      const { productId } = shippingLog;
      const productResult = await Product.scope('notDeletedProduct').findOne({ where: { id: productId } });
      const updateQuantity = parseInt(productResult?.quantity, 10) + parseInt(quantity, 10);
      await shippingLog.update({
        shippingStatus: 'delivered',
        acceptedQuantity: quantity,
        deliveryDate: utils.getCurrentDate(Date(), 'YYYY-MM-DD HH:mm:ss'),
      }, { transaction });
      // Set in Stock
      const generalSetting = await GeneralSetting.findOne({
        where: { key: 'minimum_quantity_product' },
      });
      const bodyData = { quantity: updateQuantity };
      const generalSettingQuantity = parseInt(generalSetting?.value, 10) ?? 0;
      if (updateQuantity <= generalSettingQuantity && updateQuantity >= 1) {
        bodyData.productStatus = 'lowInventory';
      }
      if (updateQuantity > generalSettingQuantity) {
        bodyData.productStatus = 'inStock';
      }
      const result = await Product.update(
        bodyData,
        { where: { id: productId } },
        { transaction },
      );
      await transaction.commit();
      notificationRepository.productComplaintNotifications({
        productName: productResult?.productName,
        type: 'delivered',
        quantity,
        userId: productResult?.sellerId,
      });
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Shipping status update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Shipping log status update
   * @param {object} req
   * @returns
   */
  async shippingLogDetails(where) {
    try {
      return await ShippingLog.scope('notDeletedShippingLog').findOne({ where });
    } catch (error) {
      loggers.error(`Shipping log details error: ${error}`);
      throw Error(error);
    }
  },
};
