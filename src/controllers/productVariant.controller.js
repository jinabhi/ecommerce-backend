import repositories from '../repositories/index';
import utility from '../utils/index';

const { productVariantRepository } = repositories;

export default {
  /**
   * ProductVariant add
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addProductVariant(req, res, next) {
    try {
      const result = await productVariantRepository.addProductVariant(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_VARIANT_ADDED'),
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
   * ProductVariant details
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async productVariantDetails(req, res, next) {
    try {
      const { productVariant } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: productVariant,
        message: utility.getMessage(req, false, 'PRODUCT_VARIANT_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ProductVariant list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllProductVariant(req, res, next) {
    try {
      const result = await productVariantRepository.getAllProductVariant(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update ProductVariant
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateProductVariant(req, res, next) {
    try {
      await productVariantRepository.updateProductVariant(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_VARIANT_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Status update ProductVariant
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async statusUpdateProductVariant(req, res, next) {
    try {
      await productVariantRepository.updateProductVariant(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_VARIANT_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Product Variant
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async deleteProductVariant(req, res, next) {
    try {
      req.body.status = 'deleted';
      await productVariantRepository.deleteProductVariantAndAttribute(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_VARIANT_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
