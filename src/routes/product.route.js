import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { productController } = controllers;
const { productValidator } = validations;
const {
  validateMiddleware, categoryMiddleware, brandMiddleware, subCategoryMiddleware,
  childCategoryMiddleware, authMiddleware, resourceAccessMiddleware,
  productMiddleware, mediaMiddleware, cartMiddleware, orderMiddleware,
} = middlewares;

router.get(
  '/product/sample-file',
  authMiddleware,
  productController.getSampleFile,
);

router.get(
  '/product/wishlist',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  productController.myWishlist,
);

router.post(
  '/seller/product',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(productValidator.createProductSchema),
  productMiddleware.checkImagesExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  productMiddleware.checkProductNameExist,
  productMiddleware.checkDuplicateProductVariantExist,
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryExist,
  childCategoryMiddleware.checkChildCategoryExist,
  brandMiddleware.checkBrandExist,
  productMiddleware.checkProductAttributeIdAndVariantIdExist,
  productController.addProduct,
);

router.post(
  '/product/review-rating',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  validateMiddleware(productValidator.createProductReviewRating),
  productMiddleware.checkProductExist,
  orderMiddleware.checkOrderExist,
  orderMiddleware.checkProductOrderDeliveredExist,
  productController.addReviewRating,
);

router.get(
  '/product/review-rating',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller', 'staff', 'guest']),
  productController.getAllReviewRating,
);

router.get(
  '/product',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller', 'staff']),
  (req, res, next) => {
    const { query } = req;
    query.productRequestStatus = 'approve';
    next();
  },
  productController.getAllProduct,
);

router.get(
  '/product/discounted-product',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  (req, res, next) => {
    const { query } = req;
    query.productDiscount = 'yes';
    query.productRequestStatus = 'approve';
    next();
  },
  productController.getAllProduct,
);

router.get(
  '/customer/product',
  (req, res, next) => {
    const { query } = req;
    query.productRequestStatus = 'approve';
    next();
  },
  productController.getAllProduct,
);

router.get(
  '/admin/product-request',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  productController.getAllProduct,
);

router.get(
  '/customer/global-search',
  productController.getGlobal,
);

router.get(
  '/product/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller', 'staff']),
  validateMiddleware(productValidator.detailAndDeleteProductSchema),
  productMiddleware.checkProductExist,
  productController.productDetailData,
);

router.get(
  '/customer-liked',
  authMiddleware,
  productController.customerLiked,
);

router.get(
  '/customer/product/:id',
  validateMiddleware(productValidator.detailAndDeleteProductSchema),
  productMiddleware.checkProductExist,
  productController.productDetail,
);

router.put(
  '/seller/product/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(productValidator.updateProductSchema),
  productMiddleware.checkProductExist,
  productMiddleware.checkDuplicateProductVariantExist,
  productMiddleware.checkUpdateImagesExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  productMiddleware.checkProductNameExist,
  categoryMiddleware.checkCategoryExist,
  brandMiddleware.checkBrandExist,
  productMiddleware.checkProductAttributeIdAndVariantIdExist,
  productController.updateProduct,
);

router.put(
  '/seller/product/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller', 'staff']),
  validateMiddleware(productValidator.productStatusUpdateSchema),
  productMiddleware.checkProductExist,
  productController.statusUpdateProduct,
);

router.put(
  '/admin/product-approve/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  productMiddleware.checkProductExist,
  productController.productRequestApprove,
);

router.put(
  '/admin/product-request/reject/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(productValidator.createProductRequestReject),
  productMiddleware.checkProductExist,
  productController.productRequestReject,
);

router.put(
  '/admin/product-request/update-status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(productValidator.productRequestStatusSchema),
  productMiddleware.checkProductExist,
  productController.updateProductRequestStatus,
);

router.put(
  '/customer/wishlist-to-cart/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(productValidator.wishlistToCartSchema),
  cartMiddleware.checkProductAvailable,
  (req, res, next) => {
    Object.assign(req.params, {
      type: true,
    });
    next();
  },
  productMiddleware.checkWishlistProductExist,
  productMiddleware.checkWishlistProductInCart,
  productController.wishlistToCart,
);

router.delete(
  '/admin/product/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(productValidator.detailAndDeleteProductSchema),
  productMiddleware.checkProductExist,
  productController.deleteProduct,
);

router.post(
  '/product/wishlist',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(productValidator.wishlistProductSchema),
  productMiddleware.checkProductExist,
  productMiddleware.checkDuplicateWishlistProduct,
  productController.addToWishlist,
);

router.post(
  '/product/cart-to-wishlist/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(productValidator.detailAndDeleteProductSchema),
  productMiddleware.checkProductExist,
  productMiddleware.checkDuplicateWishlistProduct,
  cartMiddleware.checkProductInCart,
  productController.addCartToWishlist,
);

router.delete(
  '/product/wishlist/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(productValidator.detailAndDeleteProductSchema),
  productMiddleware.checkWishlistProductExist,
  productController.removeWishlistProduct,
);

router.post(
  '/product/upload',
  authMiddleware,
  (req, res, next) => {
    const {
      body: { basePath },
    } = req;
    Object.assign(req.params, {
      basePathArray: [basePath],
      mediaFor: 'product',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  productMiddleware.checkValidFile,
  productController.uploadProduct,
);

router.get(
  '/customer/inspired-view/product',
  (req, res, next) => {
    const { query } = req;
    query.type = 'inspiredView';
    query.productRequestStatus = 'approve';
    next();
  },
  authMiddleware,
  productController.getAllProduct,
);

router.get(
  '/customer/home-screen',
  authMiddleware,
  (req, res, next) => {
    const { query } = req;
    query.type = 'inspiredView';
    query.productRequestStatus = 'approve';
    query.sortBy = 'topOffer';
    query.sortType = 'DESC';
    next();
  },
  productController.customerHomeScreen,
);

export default router;
