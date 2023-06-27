import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils/index';
import mediaRepository from './media.repository';
import helper from '../helper/subQuery';

const { Category } = models;
export default {
  /**
   * Add category
   * @param {object} req
   * @returns
   */
  async addCategory(req) {
    try {
      const { body } = req;
      // Media file used
      await mediaRepository.markMediaAsUsed([body.categoryImage]);
      return await Category.create(body);
    } catch (error) {
      loggers.error(`Category add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Category list
   * @param {object} req
   * @returns
   */
  async getAllCategory(req) {
    try {
      const {
        query: {
          limit,
          offset,
          name,
          sortBy,
          fromDate,
          toDate,
          sortType,
          scope,
        },
        user,
      } = req;
      const where = {};
      const startDate = utility.getStartDateFormater(fromDate);
      const endDate = utility.getEndDateFormater(toDate);
      const deletedScope = 'notDeletedCategory';
      const scopes = scope || deletedScope;

      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'totalProduct':
            orderBy = [[Sequelize.col('totalProduct'), sortType]];
            break;
          case 'totalBrand':
            orderBy = [[Sequelize.col('totalBrand'), sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (name) {
        where.name = { [Op.like]: `%${name}%` };
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
      if (!['staff', 'admin', 'seller'].includes(user?.userRole)) {
        where.id = [helper.childCategoryIds()];
      }
      let searchCriteria = { order: orderBy, where };
      if (scopes === 'notDeletedCategory') {
        searchCriteria = {
          ...searchCriteria,
          attributes: {
            include: helper.categoryTotalProducts(),
          },
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return Category.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Category list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Category detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Category.scope('notDeletedCategory').findOne({ where });
    } catch (error) {
      loggers.error(`Category details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update, delete and status update category
   * @param {object} req
   * @returns
   */
  async updateCategory(req) {
    try {
      const { category, body } = req;
      const { status, categoryImage } = body;
      const result = await category.update(body);
      if (status) {
        return result;
      }
      await mediaRepository.markMediaAsUsed([categoryImage]);
      if (categoryImage !== category?.categoryImage) {
        await mediaRepository.findMediaByBasePathAndUnlink(category.categoryImage);
        // Media file used
        await mediaRepository.markMediaAsUsed([categoryImage]);
      }
      return result;
    } catch (error) {
      loggers.error(`Category update error: ${error},user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
 * Bulk Category detail
 * @param {object} where
 * @returns
 */
  async bulkCategoryDetails(where) {
    try {
      return await Category.scope('notDeletedCategory').findAll({ where });
    } catch (error) {
      loggers.error(`Bulk Category details error: ${error}`);
      throw Error(error);
    }
  },
};
