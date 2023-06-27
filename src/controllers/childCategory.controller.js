import repositories from '../repositories/index';
import utility from '../utils/index';

const { childCategoryRepository } = repositories;

export default {
  /**
   * Add child category
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addChildCategory(req, res, next) {
    try {
      const result = await childCategoryRepository.createChildCategory(req);

      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'CHILD_CATEGORY_ADDED'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'FALSE_RESPONSE'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
  * Get all ChildCategory
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async getAllChildCategory(req, res, next) {
    try {
      const result = await childCategoryRepository.getAllChildCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Update Childcategory
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateSubCategory(req, res, next) {
    try {
      await childCategoryRepository.updateChildCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CHILD_CATEGORY_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Delete ChildCategory
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async  deleteSubCategory(req, res, next) {
    try {
      req.body.status = 'deleted';
      await childCategoryRepository.updateChildCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CHILD_CATEGORY_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get ChildCategory
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getChildCategory(req, res, next) {
    try {
      const { childCategory } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: childCategory,
        message: utility.getMessage(req, false, 'CHILD_CATEGORY_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

};
