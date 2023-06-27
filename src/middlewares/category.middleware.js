import { Op } from 'sequelize';
import utility from '../utils/index';
import categoryRepository from '../repositories/category.repository';

export default {
  /**
   * Check category exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkCategoryExist(req, res, next) {
    try {
      const {
        body: { categoryId },
        params: { id },
      } = req;
      const where = {};
      where.id = categoryId || id;
      const result = await categoryRepository.findOne(where);
      if (result) {
        req.category = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CATEGORY_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check update category name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkCategoryNameExist(req, res, next) {
    try {
      const {
        body: { name },
        params: { id },
      } = req;
      const where = { name };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await categoryRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'CATEGORY_EXIST'));
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
 * Check update media check
 */
  async checkUpdateMediaExist(req, res, next) {
    try {
      const {
        body: { categoryImage },
        params: { id },
      } = req;
      const where = { id };
      if (categoryImage) {
        where.categoryImage = categoryImage;
      }
      const result = await categoryRepository.findOne(where);
      if (result) {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'category',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [categoryImage],
          mediaFor: 'category',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
  * Check bulk category exist
  * @param {object} req
  * @param {object} res
  * @param {function} next
  * @returns
  */
  async checkBulkCategoryExist(req, res, next) {
    try {
      const { body: { categoryIds } } = req;
      const result = await categoryRepository.bulkCategoryDetails({ id: categoryIds });
      if (result.length === categoryIds.length) {
        req.category = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CATEGORY_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
};
