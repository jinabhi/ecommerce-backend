import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { bannerController } = controllers;
const { bannerValidator } = validations;
const {
  validateMiddleware, authMiddleware, resourceAccessMiddleware,
  bannerMiddleware, mediaMiddleware,
} = middlewares;

router.post(
  '/admin/banner',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(bannerValidator.createBannerSchema),
  (req, res, next) => {
    const {
      body: { bannerImage },
    } = req;
    Object.assign(req.params, {
      basePathArray: [bannerImage],
      mediaFor: 'banner',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  bannerMiddleware.checkBannerNameExist,
  bannerMiddleware.checkBannerCount,
  bannerController.addBanner,
);

router.get(
  '/banner/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'guest']),
  validateMiddleware(bannerValidator.detailAndDeleteBannerSchema),
  bannerMiddleware.checkBannerExist,
  bannerController.getBanner,
);

router.get(
  '/banner',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'guest']),
  bannerController.getAllBanner,
);

router.delete(
  '/admin/banner/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(bannerValidator.detailAndDeleteBannerSchema),
  bannerMiddleware.checkBannerExist,
  bannerController.deleteBanner,
);

router.put(
  '/admin/banner-status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(bannerValidator.bannerStatusUpdateSchema),
  bannerMiddleware.checkBannerExist,
  bannerMiddleware.checkBannerCount,
  bannerController.bannerStatusUpdate,
);

export default router;
