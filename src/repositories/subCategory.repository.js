import { Op, Sequelize } from 'sequelize';
import models from '../models';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import helper from '../helper/subQuery';

const { SubCategory, Category } = models;

export default {
  /**
   * SubCategory Create
   * @param {object} req
   * @returns
   */
  async addSubCategory(req) {
    try {
      const { body } = req;
      await mediaRepository.markMediaAsUsed([body.subCategoryImage]);
      return await SubCategory.create(body);
    } catch (error) {
      loggers.error(
        `Sub Category add error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Get all Subcategory
   * @param {object} req
   * @returns
   */
  async getAllSubCategory(req) {
    try {
      const {
        query: {
          limit, offset, name, sortBy, sortType, categoryId,
        },
      } = req;

      let where = {};
      let orderBy = [['createdAt', 'DESC']];
      const scope = 'notDeletedSubCategory';
      const scopes = req.query.scope ? req.query.scope : scope;
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'totalProduct':
            orderBy = [[Sequelize.col('totalProduct'), sortType]];
            break;
          case 'categoryName':
            orderBy = [[SubCategory.associations.Category, 'name', sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (name) {
        where = {
          ...where,
          [Op.or]: [{ name: { [Op.like]: `%${name}%` } }, { '$Category.name$': { [Op.like]: `%${name}%` } }],
        };
      }
      if (categoryId) {
        where['$Category.id$'] = categoryId;
      }
      let searchCriteria = {
        order: orderBy,
        where,
        include: [{
          model: Category,
          where: { status: 'active' },
          required: false,
        }],
      };

      if (scopes === 'notDeletedSubCategory') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          attributes: {
            include: helper.subCategoryTotalProducts(),
          },
        };
      }
      return await SubCategory.findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(
        `Sub Category list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Find name
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await SubCategory.scope('notDeletedSubCategory').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Sub Category details error: ${error}`);
      throw Error(error);
    }
  },

  /**
  * Update Subcategory
  * @param {object} req
  * @returns
  */
  async updateSubCategory(req) {
    try {
      const { body, params: { id }, subCategory } = req;
      const { status, subCategoryImage } = body;
      const result = await SubCategory.update(body, { where: { id } });
      if (status) {
        return result;
      }
      await mediaRepository.markMediaAsUsed([subCategoryImage]);
      if (subCategoryImage !== subCategory?.subCategoryImage) {
        await mediaRepository.findMediaByBasePathAndUnlink(subCategory.subCategoryImage);
        // Media file used
        await mediaRepository.markMediaAsUsed([subCategoryImage]);
      }
      return result;
    } catch (error) {
      loggers.error(
        `Sub Category update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

};
