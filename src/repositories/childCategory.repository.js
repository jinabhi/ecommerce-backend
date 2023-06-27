import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import helper from '../helper/subQuery';

const { ChildCategory, Category, SubCategory } = models;

export default {
  /**
   * Create child category
   * @param {object} req
   * @returns
   */
  async createChildCategory(req) {
    try {
      const { body } = req;
      await mediaRepository.markMediaAsUsed([body.childCategoryImage]);
      return await ChildCategory.create(body);
    } catch (error) {
      loggers.error(
        `childCategory add error: ${error}, user id: ${req?.user?.id}`,
      );
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
      return await ChildCategory.scope('notDeleteChildCategory').findOne({
        where,
        include: [{
          model: Category,
          required: false,
        }, {
          model: SubCategory,
          required: false,
        }],
      });
    } catch (error) {
      loggers.error(`Category details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Child category details
   * @param {object} req
   * @returns
   */
  async getAllChildCategory(req) {
    try {
      const {
        query: {
          limit, offset, name, sortBy, sortType, categoryId, subCategoryId,
        },
      } = req;

      let where = {};
      let orderBy = [['createdAt', 'DESC']];
      const scope = 'notDeleteChildCategory';
      const scopes = req.query.scope ? req.query.scope : scope;
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'totalProduct':
            orderBy = [[Sequelize.col('totalProduct'), sortType]];
            break;
          case 'categoryName':
            orderBy = [[ChildCategory.associations.Category, 'name', sortType]];
            break;
          case 'subCategoryName':
            orderBy = [[ChildCategory.associations.SubCategory, 'name', sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (name) {
        where = {
          ...where,
          [Op.or]: [{ name: { [Op.like]: `%${name}%` } }, { '$Category.name$': { [Op.like]: `%${name}%` } }, { '$SubCategory.name$': { [Op.like]: `%${name}%` } }],
        };
      }
      if (categoryId) {
        where['$Category.id$'] = categoryId;
      }
      if (subCategoryId) {
        where['$SubCategory.id$'] = subCategoryId;
      }
      const activeWhere = { status: 'active' };
      let searchCriteria = {
        order: orderBy,
        where,
        include: [{
          model: Category,
          where: activeWhere,
          required: false,
        }, {
          model: SubCategory,
          where: activeWhere,
          required: false,
        }],
      };

      if (scopes === 'notDeleteChildCategory') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          attributes: {
            include: helper.childCategoryTotalProducts(),
          },
        };
      }
      return await ChildCategory.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(
        `Sub Category list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
  * Update Childcategory
  * @param {object} req
  * @returns
  */
  async updateChildCategory(req) {
    try {
      const { body, params: { id } } = req;
      return await ChildCategory.update(body, { where: { id } });
    } catch (error) {
      loggers.error(
        `Child Category update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },
};
