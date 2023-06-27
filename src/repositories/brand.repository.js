import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import notificationRepository from './notification.repository';
import helper from '../helper/subQuery';

const {
  Brand, Address, GeneralSetting, Product,
} = models;

export default {
  /**
   * Create Brand
   * @param {object} req
   * @returns
   */
  async addBrand(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body, user } = req;
      const { brandImage, storeLicenseDocumentImage } = body;
      if (user.status === 'rejected') {
        // Re approval request
        await Brand.destroy({ where: { userId: user.id } });
        await Address.destroy({ where: { userId: user.id } });
      }
      const commissionData = await GeneralSetting.findOne({ where: { key: 'commission' } });
      body.commission = commissionData?.value || 0;
      await mediaRepository.markMediaAsUsed([brandImage, storeLicenseDocumentImage]);
      await Brand.create(body, { transaction });
      if (user.status !== 'rejected') {
        await user.update({ verificationStatus: 'userDetail' }, { transaction });
      }
      await Address.create({ ...body, userId: user.id }, { transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Brand add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Brand detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Brand.scope('notDeletedBrand').findOne({ where });
    } catch (error) {
      loggers.error(`Brand details error: ${error}`);
      throw Error(error);
    }
  },

  /**
    *  Brand listing
    * @param {object} req
    * @returns
    */
  async getAllBrand(req) {
    try {
      const {
        query: {
          limit,
          offset,
          name,
          sortBy,
          sortType,
          categoryId,
          subCategoryId,
          childCategoryId,
        },
      } = req;
      let where = {};
      const productWhere = { status: 'active' };
      let isRequired = false;
      let orderBy = [['createdAt', 'DESC']];
      const activeWhere = { status: 'active' };
      const scope = 'notDeletedBrand';
      const scopes = req.query.scope ? req.query.scope : scope;
      let duplicating = { separate: true };
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'totalProduct':
            orderBy = [[Sequelize.col('totalProduct'), sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (name) {
        where = {
          [Op.or]: [{ name: { [Op.like]: `%${name}%` } }, { storeName: { [Op.like]: `%${name}%` } }],
        };
        duplicating = { duplicating: false };
      }
      if (categoryId) {
        productWhere.categoryId = categoryId;
        isRequired = true;
        duplicating = { duplicating: false };
      }
      if (subCategoryId) {
        productWhere.subCategoryId = subCategoryId;
        isRequired = true;
        duplicating = { duplicating: false };
      }
      if (childCategoryId) {
        productWhere.childCategoryId = childCategoryId;
        isRequired = true;
        duplicating = { duplicating: false };
      }
      let searchCriteria = {
        order: orderBy, where, col: 'id', distinct: true,
      };
      if (scopes === 'notDeletedBrand') {
        searchCriteria = {
          ...searchCriteria,
          attributes: {
            include: helper.brandTotalProducts(),
          },
          includeIgnoreAttributes: false,
          include: [
            {
              model: Product,
              required: isRequired,
              where: productWhere,
              ...duplicating,
              include: [
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
          ],
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return Brand.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Brand list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Update Brand
   * @param {object} req
   * @returns
   */
  async updateBrand(req) {
    try {
      const {
        body, user: { id }, brand, user,
      } = req;
      const { status, brandImage } = body;
      const result = await Brand.update(body, { where: { userId: id } });
      if (status) {
        return result;
      }
      await mediaRepository.markMediaAsUsed([brandImage]);
      if (brandImage !== brand?.brandImage) {
        // Unlink code
        // await mediaRepository.findMediaByBasePathAndUnlink(brand.brandImage);
        // Media file used
        await mediaRepository.markMediaAsUsed([brandImage]);
      }

      if (body.address) {
        await Address.update(body, { where: { userId: id } });
      }
      notificationRepository.updateProfileNotification(user.id, 'brand');
      return result;
    } catch (error) {
      loggers.error(
        `Brand update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Brand commission update
   * @param {object} req
   * @returns
   */
  async updateBrandCommission(req) {
    try {
      const { params: { id }, body, brand } = req;
      const result = await Brand.update(body, { where: { id } });
      notificationRepository.productComplaintNotifications({
        type: 'commission_update',
        commission: brand?.commission,
        updateCommission: body?.commission,
        userId: brand?.userId,
      });
      return result;
    } catch (error) {
      loggers.error(
        `Brand  Commission update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

};
