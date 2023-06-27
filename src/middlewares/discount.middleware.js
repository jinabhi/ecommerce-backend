import { Op } from 'sequelize';
import utility from '../utils/index';
import discountRepository from '../repositories/discount.repository';

export default {
  /**
   * Check discount exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDiscountExist(req, res, next) {
    try {
      const { body: { discountId }, params: { id }, user } = req;
      const where = {};
      where.id = discountId || id;
      if (user?.userRole === 'seller') {
        where['$sellerDetails.id$'] = user?.id;
      }
      const result = await discountRepository.findOne(where);
      if (result) {
        req.discount = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, user?.userRole === 'seller' ? '' : 'DISCOUNT_NOT_EXIST'));
        error.status = utility.httpStatus(user?.userRole === 'seller' ? 'NOT_FOUND' : 'BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check discount status schedule or not exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDiscountScheduled(req, res, next) {
    try {
      const { body: { discountId }, params: { id } } = req;
      const where = {};
      where.id = discountId || id;
      // where.status = 'scheduled';
      const result = await discountRepository.findOne(where);
      if (result) {
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'DISCOUNT_NOT_SCHEDULED'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check product discount exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDiscountProductExist(req, res, next) {
    try {
      const { params: { id, productId } } = req;
      const where = { discountId: id, productId };
      const result = await discountRepository.productDiscountDetails(where);
      if (result) {
        req.productDiscount = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_DISCOUNT_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check update discount name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDiscountNameExist(req, res, next) {
    try {
      const {
        body: { name, code },
        params: { id },
      } = req;
      const where = { [Op.or]: [{ name }, { code }] };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await discountRepository.findOne(where);
      if (result && result.name.toLowerCase() === name.toLowerCase()) {
        const error = new Error(utility.getMessage(req, false, 'DISCOUNT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (result && result.code.toLowerCase() === code.toLowerCase()) {
        const error = new Error(utility.getMessage(req, false, 'DISCOUNT_CODE_EXIST'));
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
   * Check discount status active or inactive
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDiscountCurrentStatus(req, res, next) {
    try {
      const { body: { discountId }, params: { id } } = req;
      const where = {};
      where.id = discountId || id;
      where.status = 'scheduled';
      const result = await discountRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'DISCOUNT_SCHEDULED'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};
