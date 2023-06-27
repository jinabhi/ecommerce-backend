import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { brandController } = controllers;
const { brandValidator } = validations;
const {
  validateMiddleware, brandMiddleware, resourceAccessMiddleware, authMiddleware,
  mediaMiddleware, accountMiddleware,
} = middlewares;

router.post(
  '/seller/brand',
  validateMiddleware(brandValidator.createBrandSchema),
  brandMiddleware.checkBrandNameExist,
  brandMiddleware.checkBrandMobileNumberExist,
  (req, res, next) => {
    const {
      body: { brandImage, storeLicenseDocumentImage },
    } = req;
    Object.assign(req.params, {
      basePathArray: [brandImage, storeLicenseDocumentImage],
      mediaFor: 'brandLogo',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  accountMiddleware.checkUserExist,
  brandController.addBrand,
);

router.get(
  '/admin/brand',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer']),
  brandController.getAllBrand,
);

router.get(
  '/shop-by/brand',
  authMiddleware,
  brandController.getAllBrand,
);

router.get(
  '/brand',
  authMiddleware,
  brandController.getAllBrand,
);

router.get(
  '/seller/brand/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(brandValidator.detailAndDeleteBrandSchema),
  brandMiddleware.checkBrandExist,
  brandController.getBrand,
);

router.put(
  '/seller/brand/:id',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(brandValidator.updateBrandSchema),
  brandMiddleware.checkUpdateBrandNameExist,
  brandMiddleware.checkBrandMobileNumberExist,
  brandMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  brandController.updateBrand,
);
router.put(
  '/admin/brand-commission/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(brandValidator.updateBrandCommission),
  brandMiddleware.checkBrandExist,
  brandController.updateBrandCommission,
);

router.delete(
  '/admin/brand/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(brandValidator.detailAndDeleteBrandSchema),
  brandMiddleware.checkBrandExist,
  brandController.deleteBrand,
);
export default router;
