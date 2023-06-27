import { Op } from 'sequelize';
import subCategoryRepository from '../repositories/subCategory.repository';
import utility from '../utils/index';

export default {
  /**
   * check SubCategory name exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkSubCategoryNameExist(req, res, next) {
    try {
      const {
        body: { name },
        params: { id },
      } = req;
      const where = { name };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await subCategoryRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'SUB_CATEGORY_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Sub category exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async checkSubCategoryExist(req, res, next) {
    try {
      const {
        body: { subCategoryId },
        params: { id },
      } = req;
      const where = {};
      where.id = subCategoryId || id;
      const result = await subCategoryRepository.findOne(where);
      if (result) {
        req.subCategory = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'SUB_CATEGORY_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
 * Check update media check
 */
  async checkUpdateMediaExist(req, res, next) {
    try {
      const {
        body: { subCategoryImage },
        params: { id },
      } = req;
      const where = { id };
      if (subCategoryImage) {
        where.subCategoryImage = subCategoryImage;
      }
      const result = await subCategoryRepository.findOne(where);
      if (result) {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'subCategory',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [subCategoryImage],
          mediaFor: 'subCategory',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },
};
