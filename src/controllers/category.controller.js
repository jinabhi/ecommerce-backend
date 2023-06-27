import repositories from '../repositories/index';
import utility from '../utils/index';

const { categoryRepository } = repositories;

export default {
  /**
   * Category add
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addCategory(req, res, next) {
    try {
      const result = await categoryRepository.addCategory(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'CATEGORY_ADDED'),
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
   * Category details
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async categoryDetails(req, res, next) {
    try {
      const { category } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: category,
        message: utility.getMessage(req, false, 'CATEGORY_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Category list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllCategory(req, res, next) {
    try {
      const result = await categoryRepository.getAllCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update category
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateCategory(req, res, next) {
    try {
      await categoryRepository.updateCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CATEGORY_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Status update category
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async statusUpdateCategory(req, res, next) {
    try {
      await categoryRepository.updateCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CATEGORY_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete category
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async deleteCategory(req, res, next) {
    try {
      req.body.status = 'deleted';
      await categoryRepository.updateCategory(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CATEGORY_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
