import repositories from '../repositories/index';
import utility from '../utils/index';

const { cartRepository } = repositories;

export default {

  /**
   * Add Product to Cart
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addToCart(req, res, next) {
    try {
      const result = await cartRepository.addToCart(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_ADD_CART'),
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
   * Update Product to Cart
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateCart(req, res, next) {
    try {
      const result = await cartRepository.updateCartItem(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, (result.message ? result.message : 'PRODUCT_UPDATED_CART')),
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
   * Update Cart Product
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async removeCartItem(req, res, next) {
    try {
      req.query.type = 'remove';
      const result = await cartRepository.updateCartItem(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'PRODUCT_REMOVED_CART'),
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
   * Update Cart Product
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateGuestCart(req, res, next) {
    try {
      const result = await cartRepository.updateGuestCart(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: '',
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
   * Get Cart Products
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getCartProduct(req, res, next) {
    try {
      const result = await cartRepository.getCartProduct(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
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
};
