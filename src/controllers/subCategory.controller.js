import repositories from '../repositories';
import utility from '../utils';

const { subCategoryRepository } = repositories;

export default {
  /**
   * SubCategory create
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addSubCategory(req, res, next) {
    try {
      const result = await subCategoryRepository.addSubCategory(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'SUB_CATEGORY_ADDED'),
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
  * Get all SubCategory
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async getAllSubCategory(req, res, next) {
    try {
      const result = await subCategoryRepository.getAllSubCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Subcategory
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateSubCategory(req, res, next) {
    try {
      await subCategoryRepository.updateSubCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'SUB_CATEGORY_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Delete Subcategory
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async  deleteSubCategory(req, res, next) {
    try {
      req.body.status = 'deleted';
      await subCategoryRepository.updateSubCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'SUB_CATEGORY_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Subcategory
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async getSubCategory(req, res, next) {
    try {
      const { subCategory } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: subCategory,
        message: utility.getMessage(req, false, 'CATEGORY_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
};
