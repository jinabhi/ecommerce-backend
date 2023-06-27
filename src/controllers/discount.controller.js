import repositories from '../repositories/index';
import utility from '../utils/index';

const { discountRepository } = repositories;

export default {
  /**
   * Discount add
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addDiscount(req, res, next) {
    try {
      const result = await discountRepository.addDiscount(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'DISCOUNT_ADDED'),
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
   * Discount details
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async discountDetails(req, res, next) {
    try {
      const { discount } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: discount,
        message: utility.getMessage(req, false, 'DISCOUNT_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Discount list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllDiscount(req, res, next) {
    try {
      const result = await discountRepository.getAllDiscount(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Discount
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateDiscount(req, res, next) {
    try {
      await discountRepository.updateDiscount(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'DISCOUNT_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Status update Discount
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async statusUpdateDiscount(req, res, next) {
    try {
      await discountRepository.updateDiscountStatus(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'DISCOUNT_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Product discount Status update
  * @param {object} req
  * @param {object} res
  * @param {function} next
  */
  async updateProductDiscountStatus(req, res, next) {
    try {
      await discountRepository.updateProductDiscountStatus(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_DISCOUNT_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Discount
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async deleteDiscount(req, res, next) {
    try {
      req.body.status = 'deleted';
      await discountRepository.updateDiscountStatus(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'DISCOUNT_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
