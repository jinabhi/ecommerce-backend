import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils/index';
import helper from '../helper/subQuery';
import addressRepository from './address.repository';

const {
  Discount, ProductDiscount, Product, ProductImage,
} = models;
export default {
  /**
   * Add Discount
   * @param {object} req
   * @returns
   */
  async addDiscount(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body, headers: { timezone } } = req;
      const { productIds, startDate, endDate } = body;
      let ProductDiscountArray = [];
      const fromDate = utility.changeDateFormat(startDate);
      const currentDate = utility.changeDateFormat();
      if (fromDate > currentDate) {
        body.status = 'scheduled';
      }
      body.startDate = utility.getUTCDateTimeFromTimezone(startDate, timezone || 'Asia/Calcutta', 'YYYY-MM-DD 00:00:00');
      body.endDate = utility.getUTCDateTimeFromTimezone(endDate, timezone || 'Asia/Calcutta', 'YYYY-MM-DD 23:59:59');
      const discountData = await Discount.create(body);
      if (productIds && productIds.length > 0) {
        const { id } = discountData;
        ProductDiscountArray = await Promise.all(
          productIds.map(async (ele) => ({
            productId: ele,
            discountId: id,
          })),
        );
      }
      if (ProductDiscountArray && ProductDiscountArray.length > 0) {
        await ProductDiscount.bulkCreate(ProductDiscountArray, { transaction });
      }
      await transaction.commit();
      return discountData;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Discount add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Discount list
   * @param {object} req
   * @returns
   */
  async getAllDiscount(req) {
    try {
      const {
        query: {
          offset,
          search,
          sortBy,
          fromDate,
          toDate,
          sortType,
          scope,
          categoryId,
          subCategoryId,
          dealsOfTheDay,
          sellerId,
          childCategoryId,
          status,
          customerId,
          brandId, fromPrice, toPrice,
        }, user,
        headers: { currencyCode },
      } = req;
      let where = {};
      let { limit } = req.query;
      const startDate = utility.getStartDateFormater(fromDate);
      const endDate = utility.getEndDateFormater(toDate);
      const deletedScope = 'notDeletedDiscount';
      const productWhere = { status: 'active' };
      let scopes = scope || deletedScope;
      let duplicating = { separate: true };
      let productRequired = false;
      const activeWhere = { status: 'active' };

      const sellerFullName = Sequelize.fn(
        'CONCAT_WS',
        ' ',
        Sequelize.col('sellerDetails.first_name'),
        Sequelize.col('sellerDetails.last_name'),
      );
      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'categoryName':
            orderBy = [
              [
                Discount.associations.categoryDetails,
                'name',
                sortType,
              ],
            ];
            break;
          case 'subCategoryName':
            orderBy = [
              [
                Discount.associations.subCategoryDetails,
                'name',
                sortType,
              ],
            ];
            break;
          case 'childCategoryName':
            orderBy = [
              [
                Discount.associations.childCategoryDetails,
                'name',
                sortType,
              ],
            ];
            break;
          case 'totalProduct':
            orderBy = [
              [
                helper.totalProductDiscountSorting(),
                sortType,
              ],
            ];
            break;
          case 'sellerName':
            orderBy = [[sellerFullName, sortType]];
            break;
          case 'name':
            orderBy = [[Discount.associations.sellerDetails,
              'first_name',
              sortType]];
            break;
          case 'topOffer':
            orderBy = [
              ['discount_percent', sortType]];
            limit = 5;
            break;
          case 'price':
            orderBy = [
              [
                Discount.associations.productDiscountDetails,
                ProductDiscount.associations.Product,
                'price',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      const currencyRate = await addressRepository.exchangeCurrencyGet({ name: currencyCode ?? 'INR' });
      const productAttributes = ['productName', 'id', 'status', 'price', 'quantity',
        'shippingCharges', 'weight', 'unit', 'productId', 'productStatus'];
      let attributes = [...productAttributes, ...helper.productAttributes(
        user?.id ?? customerId ?? 0,
        currencyRate?.rate ?? 0,
      ),
      ];

      if (search) {
        where = {
          ...where,
          [Op.or]: [
            Sequelize.where(sellerFullName, 'LIKE', `%${search}%`),
            { '$categoryDetails.name$': { [Op.like]: `%${search}%` } },
            { '$subCategoryDetails.name$': { [Op.like]: `%${search}%` } },
            { '$childCategoryDetails.name$': { [Op.like]: `%${search}%` } },
            { name: { [Op.like]: `%${search}%` } },
            { code: { [Op.like]: `%${search}%` } },
          ],
        };
        attributes = productAttributes;
      }
      if (fromDate) {
        where.startDate = { [Op.gte]: startDate };
      }
      if (toDate) {
        where.endDate = { [Op.lte]: endDate };
      }
      if (dealsOfTheDay) {
        const date = new Date();
        where = {
          ...where,
          [Op.and]: [
            { startDate: { [Op.gte]: utility.getStartDateFormater(date) } },
            { endDate: { [Op.lte]: utility.getEndDateFormater(date) } },
          ],
        };
      }
      if (fromDate && toDate) {
        where.startDate = { [Op.gte]: startDate };
        where.endDate = { [Op.lte]: endDate };
      }
      if (categoryId) {
        where['$categoryDetails.id$'] = categoryId;
      }
      if (subCategoryId) {
        where['$subCategoryDetails.id$'] = subCategoryId;
      }
      if (sellerId) {
        where['$sellerDetails.id$'] = sellerId;
      }
      if (user?.userRole === 'seller') {
        where['$sellerDetails.id$'] = user?.id;
        activeWhere.status = { [Op.ne]: 'deleted' };
      }
      if (childCategoryId) {
        where['$childCategoryDetails.id$'] = childCategoryId;
      }
      if (status) {
        where.status = status;
      }
      if (brandId) {
        productWhere.brandId = brandId;
        productRequired = true;
      }
      if (fromPrice) {
        productWhere.price = { [Op.gte]: fromPrice };
        productRequired = true;
      }
      if (toPrice) {
        productWhere.price = { [Op.lte]: toPrice };
        productRequired = true;
      }
      if (toPrice && fromPrice) {
        productWhere.price = { [Op.between]: [fromPrice, toPrice] };
        productRequired = true;
      }
      if (user?.userRole === 'admin') {
        activeWhere.status = { [Op.ne]: 'deleted' };
      }
      const include = await this.discountInclude();
      include.push({
        association: 'productDiscountDetails',
        where: activeWhere,
        ...duplicating,
        required: productRequired,
        include: [
          {
            model: Product,
            where: productWhere,
            required: productRequired,
            attributes,
            include: [{
              model: ProductImage,
              as: 'productImage',
              order: [['createdAt', 'ASC']],
              where: activeWhere,
              ...duplicating,
              required: false,
              attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
            },
            {
              model: ProductDiscount,
              where: activeWhere,
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
          },
        ],
      });
      let searchCriteria = {
        order: orderBy,
        where,
        col: 'id',
        distinct: true,
        include,
      };
      if (scopes === 'notDeletedDiscount') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      if (user?.userRole === 'customer' || user?.userRole === 'guest') {
        scopes = 'activeDiscount';
      }
      return Discount.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Discount list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Discount detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      const activeWhere = { status: 'active' };
      const include = await this.discountInclude();
      include.push({
        association: 'productDiscountDetails',
        where: {
          status: { [Op.ne]: 'deleted' },
        },
        required: false,
        include: [
          {
            model: Product,
            where: activeWhere,
            required: false,
            attributes: ['productName', 'id', 'status'],
          },
        ],
      });
      return await Discount.scope('notDeletedDiscount').findOne({
        where,
        include,
      });
    } catch (error) {
      loggers.error(`Discount details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Product Discount detail
   * @param {object} where
   * @returns
   */
  async productDiscountDetails(where) {
    try {
      return await ProductDiscount.scope('notDeletedProductDiscount').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Product Discount details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update Discount
   * @param {object} req
   * @returns
   */
  async updateDiscount(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        discount,
        body, headers: { timezone },
        params: { id },
      } = req;
      const { productIds, startDate, endDate } = body;
      const fromDate = utility.changeDateFormat(startDate);
      const currentDate = utility.changeDateFormat();
      body.status = 'active';
      if (fromDate > currentDate) {
        body.status = 'scheduled';
      }
      body.startDate = utility.getUTCDateTimeFromTimezone(startDate, timezone || 'Asia/Calcutta', 'YYYY-MM-DD 00:00:00');
      body.endDate = utility.getUTCDateTimeFromTimezone(endDate, timezone || 'Asia/Calcutta', 'YYYY-MM-DD 23:59:59');

      const result = await discount.update(body);
      if (productIds && productIds.length > 0) {
        await Promise.all(
          productIds.map(
            async (ele) => {
              await ProductDiscount.findOrCreate({
                where: { productId: ele, discountId: id },
              });
            },
            { transaction },
          ),
        );

        await ProductDiscount.destroy(
          {
            where: {
              discountId: id,
              productId: { [Op.notIn]: productIds },
            },
          },
          { transaction },
        );
      }
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(
        `Discount update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Update product Discount status
   * @param {object} req
   * @returns
   */
  async updateProductDiscountStatus(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        productDiscount,
        body,
        params: { id },
        discount,
      } = req;
      const { status } = body;
      const result = await productDiscount.update(body);
      const where = { discountId: id };
      const totalCount = await ProductDiscount.scope(
        'notDeletedProductDiscount',
      ).count({ where }, { transaction });
      where.status = status;
      const count = await ProductDiscount.scope(
        'notDeletedProductDiscount',
      ).count({ where }, { transaction });
      const discountStatus = discount?.status;
      if (totalCount === count && (discountStatus === 'active' || discountStatus === 'inactive')) {
        await Discount.scope('notExpiredProductDiscount').update(
          {
            status,
          },
          { where: { id } },
          { transaction },
        );
      }
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(
        `Product Discount status update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Discount include model
   */
  async discountInclude() {
    const where = { status: 'active' };
    return [
      {
        association: 'categoryDetails',
        attributes: ['name'],
        where,
        required: false,
      },
      {
        association: 'subCategoryDetails',
        attributes: ['id', 'name'],
        where,
        required: false,
      },
      {
        association: 'childCategoryDetails',
        attributes: ['id', 'name'],
        where,
        required: false,
      },
      {
        association: 'sellerDetails',
        required: false,
        where,
        attributes: ['id', 'firstName', 'lastName'],
      },
    ];
  },

  /**
   * Product Discount detail
   * @param {object} where
   * @returns
   */
  async productDiscountDetailsExist(req) {
    try {
      const {
        body: {
          productIds,
          //  startDate, endDate
        },
      } = req;

      return await ProductDiscount.scope('notDeletedProductDiscount').findAll({
        where: {
          productId: productIds,
          // [Op.or]: [{ '$Discount.start_date$': { [Op.gte]: startDate } },
          // { '$Discount.end_date$': { [Op.lte]: endDate } }]
        },
        include: [{
          model: Discount.scope('notExpiredProductDiscount'),
        }],
      });
    } catch (error) {
      loggers.error(`Product Discount details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update, delete and status update Discount
   * @param {object} req
   * @returns
   */
  async updateDiscountStatus(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        discount,
        body,
        params: { id },
      } = req;
      const { status } = body;
      const result = await discount.update(body, { transaction });
      await ProductDiscount.update(
        {
          status,
        },
        { where: { discountId: id } },
        { transaction },
      );
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(
        `Discount update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },
  /**
   * Discount status update scheduled, active, expired
   * @returns
   */
  async updateCurrentDiscountStatus() {
    try {
      const currentDate = utility.getCurrentDate();
      const status = { status: ['active', 'inactive'] };
      // Set scheduled to active
      await Discount.update({ status: 'active' }, {
        where: {
          [Op.and]: [Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m-%d'), '=', `${currentDate}`),
            { status: 'scheduled' }],
        },
      });
      // Set active to expired
      await Discount.update({ status: 'expired' }, { where: { [Op.and]: [Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('end_date'), '%Y-%m-%d'), '<', `${currentDate}`), status] } });
      await ProductDiscount.scope('activeProductDiscount').update({ status: 'inactive' }, { where: { discountId: helper.discountIds() } });
      // Set active when scheduled
      await Discount.update({ status: 'scheduled' }, { where: { [Op.and]: [Sequelize.where(Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m-%d'), '>', `${currentDate}`), status] } });
    } catch (error) {
      loggers.error(`Discount status update error: ${error}`);
      throw Error(error);
    }
  },
};
