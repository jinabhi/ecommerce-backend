/* eslint-disable max-len */
import xlsx from 'xlsx';
import { Op } from 'sequelize';
import bucketServices from '../services/s3Bucket.service';

import utility from '../utils/index';
import repositories from '../repositories';
import models from '../models/index';
import config from '../config';

const {
  ProductImage,
  Inventory,
  User,
  ProductVariant,
  ProductVariantAttribute,
  Product,
  Cart,
} = models;

const { productRepository, shippingLogRepository, discountRepository } = repositories;

export default {
  /**
   * Check Product exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkProductExist(req, res, next) {
    try {
      const {
        body,
        params: { id },
        query,
        headers,
        user,
      } = req;
      const productId = body?.productId || id;
      const where = { [Op.or]: [{ id: productId }, { productId }] };
      if (user?.userRole === 'seller') {
        where.sellerId = user?.id;
      }
      const scopeData = user?.userRole === 'customer' ? 'activeProduct' : 'notDeletedProduct';
      const result = await productRepository.findOne(
        where,
        query?.customerId,
        productId,
        scopeData,
        headers?.currencyCode,
      );
      if (result) {
        req.product = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, user?.userRole === 'seller' ? '' : 'PRODUCT_NOT_FOUND'),
        );
        error.status = utility.httpStatus(user?.userRole === 'seller' ? 'NOT_FOUND' : 'BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Product Attribute and Variant Id
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkProductAttributeIdAndVariantIdExist(req, res, next) {
    try {
      const {
        body: { productVariant },
      } = req;
      if (productVariant && productVariant?.length > 0) {
        const variantData = await Promise.all(
          productVariant.map(async (ele) => ProductVariant.scope('notDeletedProductVariant').findOne({
            where: { id: ele.productVariantId },
          })),
        );
        const attributeData = await Promise.all(
          productVariant.map(async (ele) => ProductVariantAttribute.scope(
            'notDeletedProductVariantAttribute',
          ).findOne({
            where: { id: ele.productVariantAttributeId },
          })),
        );
        const filterVariantData = variantData.filter((ele) => ele !== null);
        const filterAttributeData = attributeData.filter((ele) => ele !== null);
        if (filterVariantData.length !== variantData.length) {
          const error = new Error(
            utility.getMessage(req, false, 'PRODUCT_VARIANT_NOT_EXIST'),
          );
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else if (filterAttributeData.length !== attributeData.length) {
          const error = new Error(
            utility.getMessage(req, false, 'PRODUCT_ATTRIBUTE_NOT_EXIST'),
          );
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Images Exist
   * @param {object} req
   * @param {} res
   * @param {Function} next
   */
  async checkImagesExist(req, res, next) {
    try {
      const {
        body: { productImages },
      } = req;
      if (productImages && productImages.length > 6) {
        const error = new Error(
          utility.getMessage(req, false, 'MAXIMUM_FIVE_FILE_ALLOWED'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (productImages && productImages.length > 0) {
        const imageFile = await Promise.all(
          productImages.map(async (ele) => ele.basePath),
        );
        req.body.imageFile = imageFile;
        Object.assign(req.params, {
          basePathArray: imageFile,
          mediaFor: 'product',
        });

        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'product',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Update Image Exist
   * @param {object} req
   * @param {*} res
   * @param {Function} next
   */
  async checkUpdateImagesExist(req, res, next) {
    try {
      const {
        body: { productImages },
        params: { id },
      } = req;
      if (productImages && productImages.length > 6) {
        const error = new Error(
          utility.getMessage(req, false, 'MAXIMUM_FIVE_FILE_ALLOWED'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (productImages && productImages.length > 0) {
        let productUpdateImages = await Promise.all(
          productImages.map(async (ele) => {
            const data = await ProductImage.findOne({
              where: { productImage: ele.basePath, productId: id },
            });
            if (!data) {
              return ele.basePath;
            }
            return false;
          }),
        );
        productUpdateImages = productUpdateImages.filter(
          (item) => item !== false,
        );
        Object.assign(req.params, {
          basePathArray: productUpdateImages,
          mediaFor: 'product',
        });
        req.productUpdateImage = productUpdateImages;
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'product',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Product exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkDuplicateWishlistProduct(req, res, next) {
    try {
      const {
        user: { id },
        body: { productId },
        params,
      } = req;
      const data = params.id || productId;
      const where = { productId: data, userId: id, status: 'active' };
      const result = await productRepository.wishlistFindOne(where);
      if (result) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_WISHLIST_EXIST'),
        );
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
   * Check product name exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkProductNameExist(req, res, next) {
    try {
      const {
        body: { productName },
        params: { id },
      } = req;
      const where = { productName };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await Product.scope('notDeletedProduct').findOne({
        where,
      });
      if (result) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_EXIST'),
        );
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
   * Check Duplicate product variant and attributes
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkDuplicateProductVariantExist(req, res, next) {
    try {
      const {
        body: { productVariant },
      } = req;
      if (productVariant) {
        const filterArray = productVariant.map((item) => item.productVariantId);
        const isDuplicate = filterArray.some(
          (item, idx) => filterArray.indexOf(item) !== idx,
        );
        if (isDuplicate) {
          const error = new Error(
            utility.getMessage(req, false, 'PRODUCT_ATTRIBUTE_VARIANT_NOT_SAME'),
          );
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Product exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkWishlistProductExist(req, res, next) {
    try {
      const {
        params: { id },
        user,
      } = req;
      const where = { status: 'active', userId: user.id };
      where.productId = id;
      const result = await productRepository.wishlistFindOne(where);
      if (result) {
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_WISHLIST_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Shipping log Quantity exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkProductQuantityExist(req, res, next) {
    try {
      const {
        params: { id },
        body: { quantity },
      } = req;
      const result = await shippingLogRepository.shippingLogDetails({ id });
      if (
        result
        && parseInt(result?.shippingQuantity, 10) < parseInt(quantity, 10)
      ) {
        const error = new Error(
          utility.getMessage(req, false, 'SHIPPING_LOG_QUANTITY_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (result) {
        req.shippingLog = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'SHIPPING_LOG_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Inventory exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkInventoryExist(req, res, next) {
    try {
      const {
        body: { inventoryId },
        params: { id },
      } = req;
      const where = {};
      where.id = inventoryId || id;
      const result = await Inventory.findOne(where);
      if (result) {
        req.inventory = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'INVENTORY_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Seller exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   * Check seller exist
   */
  async checkSellerExist(req, res, next) {
    try {
      const {
        body: { sellerId },
      } = req;
      const data = await User.findOne({
        where: { id: sellerId, userRole: 'seller', status: 'active' },
      });
      if (data) {
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'SELLER_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * check valid File format
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async checkValidFile(req, res, next) {
    try {
      const { body } = req;
      const { basePath } = body;
      const { app: { mediaStorage } } = config;
      let workbook; let
        header;
      if (mediaStorage === 's3') {
        const result = await bucketServices.getExcelData(basePath);
        workbook = xlsx.read(result?.Body);
        header = xlsx.read(result?.Body, { sheetRows: 1 });
      } else {
        workbook = xlsx.readFile(basePath);
        header = xlsx.readFile(basePath, { sheetRows: 1 });
      }
      const sheetNames = workbook.SheetNames;
      const columnsArray = xlsx.utils.sheet_to_json(header.Sheets[sheetNames], {
        header: 1,
      })[0];
      const columnsData = [
        'product_name',
        'price',
        'category',
        'sub_category',
        'child_category',
        'overview',
        'specification',
        'variant',
        'attribute',
      ];
      if (columnsArray && columnsArray.length > 0) {
        const fieldCheck = columnsData.reduce(
          (a, b) => a && columnsArray.includes(b),
          true,
        );
        if (fieldCheck) {
          next();
        } else {
          const error = new Error(
            utility.getMessage(req, false, 'INVALID_HEADER'),
          );
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        }
      } else {
        const error = new Error(utility.getMessage(req, false, 'EMPTY_FILE'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check Product bulk product
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkBulkProductExist(req, res, next) {
    try {
      const {
        body: { productIds },
      } = req;
      const productResult = await Promise.all(
        productIds.map(async (ele) => productRepository.findOne({ id: ele })),
      );
      const filterResultData = productResult.filter((ele) => ele !== null);
      if (productIds.length !== filterResultData.length) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_NOT_EXIST'),
        );
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
   * Check assign discount Product bulk product
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkAssignProductExist(req, res, next) {
    try {
      const discountResult = await discountRepository.productDiscountDetailsExist(req);
      if (discountResult.length > 0) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_ASSIGN'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
      next();
    } catch (error) {
      next(error);
    }
  },

  // unused code remove for current requirements
  async checkAssignProductExistOld(req, res, next) {
    try {
      const {
        body: { productIds },
      } = req;
      const productResult = await
      Promise.all(productIds.map(async (ele) => {
        const discountResult = await discountRepository.productDiscountDetails({
          productId: ele,
        });
        if (discountResult) {
          return false;
        }
        return ele;
      }));
      const filterResultData = productResult.filter((ele) => ele !== false);
      if (filterResultData.length > 0) {
        req.body.productIds = filterResultData;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_ASSIGN'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check update assign discount Product bulk product
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkUpdateAssignProductExist(req, res, next) {
    try {
      const {
        body: { productIds },
        params: { id },
      } = req;
      const discountResult = await discountRepository.productDiscountDetails({
        productId: { [Op.in]: productIds },
        discountId: { [Op.ne]: id },
      });
      if (discountResult) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_ASSIGN'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  async checkUpdateAssignProductExistOld(req, res, next) {
    try {
      const {
        body: { productIds },
        params: { id },
      } = req;
      const productResult = await
      Promise.all(productIds.map(async (ele) => {
        const discountResult = await discountRepository.productDiscountDetails({
          productId: ele, discountId: { [Op.ne]: id },
        });
        if (discountResult) {
          return false;
        }
        return ele;
      }));
      const filterResultData = productResult.filter((ele) => ele !== false);
      if (filterResultData.length > 0) {
        req.body.productIds = filterResultData;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_ASSIGN'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  async checkWishlistProductInCart(req, res, next) {
    try {
      const {
        params: { id },
        user,
      } = req;
      const cartData = await Cart.findOne({
        where: { productId: id, userId: user.id, status: 'active' },
      });
      if (cartData) {
        const error = new Error(
          utility.getMessage(req, false, 'PRODUCT_ALREADY_CART'),
        );
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
   * Check assign discount Product bulk product
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkPassedDate(req, res, next) {
    try {
      const { body } = req;
      const { endDate, startDate } = body;
      const fromDate = utility.changeDateFormat(startDate);
      const toDate = utility.changeDateFormat(endDate);

      const currentDate = utility.changeDateFormat();
      if (currentDate > fromDate || currentDate > toDate) {
        const error = new Error(
          utility.getMessage(req, false, 'PASSED_DATE_NOT_ALLOWED'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};
