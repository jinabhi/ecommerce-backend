import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils/index';
import mediaRepository from './media.repository';
import notificationRepository from './notification.repository';
import helper from '../helper/subQuery';

const {
  ProductComplaint, DamageProductImage, CreditPoint,
  ProductVariant, Brand, ProductVariantAttribute, User,
} = models;
export default {
  /**
   * Add Product Complaint
   * @param {object} req
   * @returns
   */
  async addProductComplaint(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        body, user: { id }, params: { basePathArray }, order,
      } = req;
      const result = await ProductComplaint.create({
        ...body,
        userId: id,
        productId: order?.productId,
      }, { transaction });
      if (result) {
        const finalImages = basePathArray.map((item) => (
          { productComplaintId: result.id, damageImage: item }));
        if (finalImages && finalImages.length > 0) {
          await mediaRepository.markMediaAsUsed(basePathArray); // Mark media used
          await DamageProductImage.bulkCreate(finalImages, { transaction });
        }
      }
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Product complaint add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Product Complaint list
   * @param {object} req
   * @returns
   */
  async getAllProductComplaint(req) {
    try {
      const {
        query: {
          limit,
          offset,
          search,
          sortBy,
          fromDate,
          toDate,
          sortType,
          scope,
        },
      } = req;
      let where = {};
      const startDate = utility.getStartDateFormater(fromDate);
      const endDate = utility.getEndDateFormater(toDate);
      const deletedScope = 'notDeletedProductComplaint';
      const scopes = scope || deletedScope;
      const userFullName = Sequelize.fn('CONCAT_WS', ' ', Sequelize.col('userDetails.first_name'), Sequelize.col('userDetails.last_name'));
      let orderBy = [['id', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'userName':
            orderBy = [[ProductComplaint.associations.userDetails, 'firstName', sortType]];
            break;
          case 'productName':
            orderBy = [[ProductComplaint.associations.productDetails, 'product_name', sortType]];
            break;
          case 'price':
            orderBy = [[ProductComplaint.associations.productDetails, 'price', sortType]];
            break;
          case 'quantity':
            orderBy = [[ProductComplaint.associations.productDetails, 'quantity', sortType]];
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
            Sequelize.where(userFullName, 'LIKE', `%${search}%`),
            { '$productDetails.product_name$': { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (fromDate) {
        where.createdAt = { [Op.gte]: startDate };
      }
      if (toDate) {
        where.createdAt = { [Op.lte]: endDate };
      }
      if (fromDate && toDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }
      let searchCriteria = { order: orderBy, where };
      const activeWhere = { status: { [Op.ne]: 'deleted' } };
      if (scopes === 'notDeletedProductComplaint') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          col: 'id',
          distinct: true,
          attributes: {
            include: helper.orderQuantityForProductComplaint(),
          },
          include: [
            {
              association: 'productDetails',
              where: activeWhere,
              required: false,
            },
            {
              association: 'damageProductImage',
              where: activeWhere,
              separate: true,
              required: false,
            },
            {
              association: 'userDetails',
              where: activeWhere,
              required: true,
              attributes: ['firstName', 'lastName', 'id'],
            },
            {
              association: 'orderDetails',
              where: activeWhere,
              required: false,
              attributes: ['trackingLink', 'deliveredOn', 'orderId', 'id'],
            },
          ],
        };
      }
      return ProductComplaint.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Product Complaint list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Product Complaint detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      const activeWhere = { status: { [Op.ne]: 'deleted' } };
      return await ProductComplaint.scope('notDeletedProductComplaint').findOne({
        where,
        attributes: {
          include: helper.orderQuantityForProductComplaint(),
        },
        include: [
          {
            association: 'damageProductImage',
            where: activeWhere,
            required: false,
          },
          {
            association: 'productDetails',
            where: activeWhere,
            required: false,
            include: [
              {
                association: 'sellerProductVariantDetails',
                where: activeWhere,
                required: false,
                include: [
                  {
                    model: ProductVariantAttribute,
                    where: activeWhere,
                    required: false,
                  },
                  {
                    model: ProductVariant,
                    where: activeWhere,
                    required: false,
                  },
                ],
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
                association: 'categoryDetails',
                where: activeWhere,
                required: false,
              },
              {
                association: 'subCategoryDetails',
                where: activeWhere,
                required: false,
              },
              {
                association: 'childCategoryDetails',
                where: activeWhere,
                required: false,
              },
            ],
          },
          {
            association: 'userDetails',
            required: false,
            where: activeWhere,
            attributes: ['firstName', 'lastName', 'id'],
          },
          {
            association: 'orderDetails',
            where: { status: { [Op.ne]: 'deleted' } },
            required: false,
            attributes: ['trackingLink', 'deliveredOn', 'orderId', 'id'],
          },
          {
            association: 'CreditPoint',
            where: { status: { [Op.ne]: 'deleted' } },
            required: false,
            attributes: ['point', 'id'],
          },
        ],
      });
    } catch (error) {
      loggers.error(`Product Complaint details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Delete Product complaint
   * @param {object} req
   * @returns
   */
  async updateProductComplaintStatus(req) {
    try {
      const { productComplaint, body } = req;
      const { productComplaintStatus, userId } = productComplaint;
      if (body.productComplaintStatus === productComplaintStatus) {
        return false;
      }
      const result = await productComplaint.update(body);
      const notificationData = {
        productComplaintStatus: body?.productComplaintStatus,
        userId,
        productName: productComplaint?.productDetails?.productName,
      };
      notificationRepository.productComplaintNotifications(notificationData);
      return result;
    } catch (error) {
      loggers.error(`Product Complaint delete error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Delete Product complaint
   * @param {object} req
   * @returns
   */
  async addCreditPoint(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body, productComplaint } = req;
      const { point, userId } = body;
      await productComplaint.update({ productComplaintStatus: 'credited' }, { transaction });
      const creditedData = await CreditPoint.create(body, { transaction });
      const user = await User.scope('notDeletedUser').findOne({ where: { id: userId } });
      if (user) {
        const creditPoints = parseInt(user?.creditPoints ?? 0, 10) + point;
        await user.update({ creditPoints }, { transaction });
      }
      const notificationData = {
        userId,
        productName: productComplaint?.productDetails?.productName,
        creditPoint: parseInt(point, 10),
      };
      notificationRepository.productComplaintNotifications(notificationData);
      await transaction.commit();
      return creditedData;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Credit Point add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Product Complaint credit point check
   * @param {object} where
   * @returns
   */
  async checkProductComplaintCreditPoint(where) {
    try {
      return await CreditPoint.scope('notDeletedCreditPoint').findOne({ where });
    } catch (error) {
      loggers.error(`Product Complaint credit point details error: ${error}`);
      throw Error(error);
    }
  },

};
