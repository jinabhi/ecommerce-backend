import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { discountController } = controllers;
const { discountValidator } = validations;
const {
  validateMiddleware,
  discountMiddleware,
  authMiddleware,
  categoryMiddleware,
  subCategoryMiddleware,
  childCategoryMiddleware,
  resourceAccessMiddleware,
  accountMiddleware,
  productMiddleware,
} = middlewares;

router.post(
  '/seller/discount',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(discountValidator.createDiscountSchema),
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryExist,
  childCategoryMiddleware.checkChildCategoryExist,
  accountMiddleware.checkUserExist,
  productMiddleware.checkBulkProductExist,
  productMiddleware.checkAssignProductExist,
  productMiddleware.checkPassedDate,
  discountController.addDiscount,
);

router.get(
  '/admin/discount',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  discountController.getAllDiscount,
);

router.put(
  '/seller/discount/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(discountValidator.updateDiscountSchema),
  discountMiddleware.checkDiscountExist,
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryExist,
  childCategoryMiddleware.checkChildCategoryExist,
  accountMiddleware.checkUserExist,
  productMiddleware.checkBulkProductExist,
  // productMiddleware.checkUpdateAssignProductExist,
  discountMiddleware.checkDiscountScheduled,
  productMiddleware.checkPassedDate,
  discountController.updateDiscount,
);

router.get(
  '/seller/discount/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller', 'admin']),
  validateMiddleware(discountValidator.detailAndDeleteSchema),
  discountMiddleware.checkDiscountExist,
  discountController.discountDetails,
);

router.get(
  '/top-offer',
  (req, res, next) => {
    req.query.sortBy = 'topOffer';
    req.query.sortType = 'DESC';
    next();
  },
  authMiddleware,
  discountController.getAllDiscount,
);

router.get(
  '/deals-of/the-day',
  (req, res, next) => {
    req.query.dealsOfTheDay = 'dealsOfTheDay';
    next();
  },
  authMiddleware,
  discountController.getAllDiscount,
);

router.put(
  '/seller/discount/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(discountValidator.statusUpdateSchema),
  discountMiddleware.checkDiscountExist,
  discountMiddleware.checkDiscountCurrentStatus,
  discountController.statusUpdateDiscount,
);

router.put(
  '/seller/discount/product/status/:id/:productId',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(discountValidator.productDiscountStatusUpdateSchema),
  discountMiddleware.checkDiscountExist,
  discountMiddleware.checkDiscountProductExist,
  discountController.updateProductDiscountStatus,
);

router.delete(
  '/seller/discount/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(discountValidator.detailAndDeleteSchema),
  discountMiddleware.checkDiscountExist,
  discountMiddleware.checkDiscountScheduled,
  discountController.deleteDiscount,
);

export default router;
