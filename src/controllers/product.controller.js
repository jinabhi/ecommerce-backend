import repositories from '../repositories';
import utility from '../utils';

const { productRepository } = repositories;

export default {

  /**
      * Add Product
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addProduct(req, res, next) {
    try {
      const result = await productRepository.addProduct(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_ADDED'),
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
    * Get sample file for product upload
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getSampleFile(req, res, next) {
    try {
      const result = await productRepository.getSampleFile(req);
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

  /**
    * Product Listing
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getAllProduct(req, res, next) {
    try {
      const result = await productRepository.getAllProduct(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * customer home screen
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async customerHomeScreen(req, res, next) {
    try {
      const result = await productRepository.customerHomeScreen(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Wishlist to cart
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async wishlistToCart(req, res, next) {
    try {
      await productRepository.wishlistToCart(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_ADD_CART'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Wishlist to cart
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async productDetailData(req, res, next) {
    try {
      const { product } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Product detail
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
  async productDetail(req, res, next) {
    try {
      const result = await productRepository.productDetail(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_DETAIL'),
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
   * Update Product
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateProduct(req, res, next) {
    try {
      await productRepository.updateProduct(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   *Global search in category , subcategory , child category
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getGlobal(req, res, next) {
    try {
      const result = await productRepository.getGlobal(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Update Product Request Status
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async updateProductRequestStatus(req, res, next) {
    try {
      const { body: { productRequestStatus } } = req;
      const result = await productRepository.updateProductRequestStatus(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, productRequestStatus === 'reject' ? 'PRODUCT_REJECT_STATUS_UPDATED' : 'PRODUCT_ACCEPT_STATUS_UPDATED'),
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
     * Delete Product
     * @param {object} req
     * @param {object} res
     * @param {Function} next
     */
  async deleteProduct(req, res, next) {
    try {
      req.body.status = 'deleted';
      await productRepository.updateProduct(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
      * Add product to wishlist
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addToWishlist(req, res, next) {
    try {
      const result = await productRepository.addToWishlist(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_ADDED_WISHLIST'),
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
      * Add cart to wishlist
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addCartToWishlist(req, res, next) {
    try {
      req.query.type = true;
      const result = await productRepository.addToWishlist(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_ADDED_WISHLIST'),
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
   * Product request approve
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async productRequestApprove(req, res, next) {
    try {
      req.body.status = 'active';
      const result = await productRepository.productRequestApprove(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'PRODUCT_ACCEPT_STATUS_UPDATED'),
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
   * Add review rating
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addReviewRating(req, res, next) {
    try {
      const result = await productRepository.addReviewRating(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'REVIEW_RATING_ADDED'),
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
      * list/details wishlist
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async myWishlist(req, res, next) {
    try {
      const result = await productRepository.myWishlist(req);
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

  /**
   *  Get all review rating
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllReviewRating(req, res, next) {
    try {
      const result = await productRepository.getAllReviewRating(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
      * Remove Product from wishlist
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async removeWishlistProduct(req, res, next) {
    try {
      const result = await productRepository.removeWishlistProduct(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'PRODUCT_REMOVED_WISHLIST'),
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
   * Product request reject
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async productRequestReject(req, res, next) {
    try {
      req.body.status = 'rejected';
      await productRepository.updateProductStatus(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'PRODUCT_REJECT_STATUS_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Product status update
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async statusUpdateProduct(req, res, next) {
    try {
      const { body: { status } } = req;
      await productRepository.updateProductStatus(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, status === 'active' ? 'PRODUCT_ACTIVE_STATUS_UPDATE' : 'PRODUCT_DE_ACTIVE_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * Product Upload
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async uploadProduct(req, res, next) {
    try {
      const result = await productRepository.uploadProduct(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: result?.success ?? true,
          data: true,
          message: utility.getMessage(req, false, result.message),
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
   * Customer also liked products
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async customerLiked(req, res, next) {
    try {
      const result = await productRepository.customerLiked(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

};
