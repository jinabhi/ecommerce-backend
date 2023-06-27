import { Op } from 'sequelize';
import utility from '../utils/index';
import childCategoryRepository from '../repositories/childCategory.repository';

export default {

  /**
   * Check Child category name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkChildCategoryNameExist(req, res, next) {
    try {
      const {
        body: { name },
        params: { id },
      } = req;
      const where = { name };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await childCategoryRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'CHILD_CATEGORY_EXIST'));
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
        body: { childCategoryImage },
        params: { id },
      } = req;
      const where = { id };
      if (childCategoryImage) {
        where.childCategoryImage = childCategoryImage;
      }
      const result = await childCategoryRepository.findOne(where);
      if (result) {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'childCategory',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [childCategoryImage],
          mediaFor: 'childCategory',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check ChildCategory exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkChildCategoryExist(req, res, next) {
    try {
      const {
        body: { childCategoryId },
        params: { id },
      } = req;
      const where = {};
      where.id = childCategoryId || id;
      const result = await childCategoryRepository.findOne(where);
      if (result) {
        req.childCategory = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CHILD_CATEGORY_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

};
