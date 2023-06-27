/* eslint-disable consistent-return */
import { Op } from 'sequelize';
import utility from '../utils/index';
import models from '../models';

const {
  Product, Cart,
} = models;

export default {

  /**
     * Check Product Available
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
  async checkProductAvailable(req, res, next) {
    try {
      const { body: { product }, params: { id } } = req;
      const newData = [];
      if (id) {
        const result = await Product.findOne({
          where: {
            id, status: 'active', quantity: { [Op.gte]: 1 }, productStatus: { [Op.ne]: 'outOfStock' },
          },
        });
        if (result) {
          next();
        } else {
          const error = new Error(utility.getMessage(req, false, 'PRODUCT_NOT_AVAILABLE'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        }
      } else {
        await Promise.all(
          product.map(async (element) => {
            const newProductData = { ...element };
            const result = await Product.findOne({
              where: {
                id: element.productId, status: 'active', quantity: { [Op.gte]: 1 }, productStatus: { [Op.ne]: 'outOfStock' },
              },
            });
            if (result) {
              if (result.quantity < element.quantity) {
                newProductData.quantity = result.quantity;
                newData.push(newProductData);
                return true;
              }
              newData.push(newProductData);
              return true;
            }
          }),
        );
        req.newProduct = newData;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
     * Check Product Quantity
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
  async checkProductQuantity(req, res, next) {
    try {
      const {
        newProduct, body: { quantity }, params, user,
      } = req;
      const finalList = [];
      const where = {
        productStatus: { [Op.ne]: 'outOfStock' },
        status: 'active',
      };
      if (params.id) {
        where.id = params.id;
        const result = await Product.findOne({ where });
        const productData = result.get();
        if (productData.quantity <= quantity) {
          req.body.quantity = productData.quantity;
          next();
        } else {
          next();
        }
      } else {
        await Promise.all(
          newProduct.map(async (element) => {
            where.id = element.productId;
            const result = await Product.findOne({ where });
            const productData = result.get();
            const newData = { ...element };
            if (productData) {
              const cartWhere = {
                userId: user.id,
                status: 'active',
                productId: productData.id,
              };
              const cartDetails = await Cart.findOne({ where: cartWhere });
              const cartData = cartDetails ? cartDetails.get() : null;
              if (cartData) {
                const newQuantity = cartData.quantity + element.quantity;
                if (productData.quantity >= newQuantity) {
                  finalList.push(newData);
                  return true;
                }
                if (productData.quantity < newQuantity) {
                  const newQuantityData = productData.quantity - cartData.quantity;
                  newData.quantity = newQuantityData;
                  finalList.push(newData);
                  return true;
                }
              } else {
                finalList.push(newData);
                return true;
              }
            }
          }),
        );
        req.finalList = finalList;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
     * Check Product In Cart
     * @param {Object} req
     * @param {Object} res
     * @param {Function} next
     */
  async checkProductInCart(req, res, next) {
    try {
      const { params: { id } } = req;
      const where = {
        productId: id, status: 'active',
      };
      const result = await Cart.findOne({ where });
      if (result) {
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_NOT_AVAILABLE'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

};
