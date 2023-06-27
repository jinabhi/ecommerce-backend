import { Op } from 'sequelize';
import utility from '../utils/index';
import productVariantRepository from '../repositories/productVariant.repository';

export default {
  /**
   * Check ProductVariant exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkProductVariantExist(req, res, next) {
    try {
      const {
        body: { productVariantId },
        params: { id },
      } = req;
      const where = {};
      where.id = productVariantId || id;
      const result = await productVariantRepository.findOne(where);
      if (result) {
        req.productVariant = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_VARIANT_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check update ProductVariant name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkProductVariantNameExist(req, res, next) {
    try {
      const {
        body: { name },
        params: { id },
      } = req;
      const where = { name };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await productVariantRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_VARIANT_EXIST'));
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
 * Check Duplicate product attributes
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async checkDuplicateProductAttributesExist(req, res, next) {
    try {
      const { body: { attributeNames } } = req;
      const filterArray = attributeNames.map((item) => item.toLowerCase());
      const isDuplicate = filterArray.some((item, idx) => filterArray.indexOf(item) !== idx);
      if (isDuplicate) {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_ATTRIBUTE_NOT_SAME'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

};
