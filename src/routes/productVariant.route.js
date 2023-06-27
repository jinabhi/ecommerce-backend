import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { productVariantController } = controllers;
const { productVariantValidator } = validations;
const {
  validateMiddleware,
  productVariantMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/admin/product-variant',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(productVariantValidator.createProductVariantSchema),
  productVariantMiddleware.checkProductVariantNameExist,
  productVariantMiddleware.checkDuplicateProductAttributesExist,
  productVariantController.addProductVariant,
);

router.get(
  '/admin/product-variant',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  productVariantController.getAllProductVariant,
);

router.put(
  '/admin/product-variant/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(productVariantValidator.updateProductVariantSchema),
  productVariantMiddleware.checkProductVariantExist,
  productVariantMiddleware.checkProductVariantNameExist,
  productVariantMiddleware.checkDuplicateProductAttributesExist,
  productVariantController.updateProductVariant,
);

router.get(
  '/admin/product-variant/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  validateMiddleware(productVariantValidator.detailAndDeleteSchema),
  productVariantMiddleware.checkProductVariantExist,
  productVariantController.productVariantDetails,
);

router.put(
  '/admin/product-variant/change-status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(productVariantValidator.statusUpdateSchema),
  productVariantMiddleware.checkProductVariantExist,
  productVariantController.statusUpdateProductVariant,
);

router.delete(
  '/admin/product-variant/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(productVariantValidator.detailAndDeleteSchema),
  productVariantMiddleware.checkProductVariantExist,
  productVariantController.deleteProductVariant,
);

export default router;
