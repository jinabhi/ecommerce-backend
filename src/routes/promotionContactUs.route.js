import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares';

const { promotionController } = controllers;
const { promotionValidator } = validations;
const { validateMiddleware, promotionMiddleware } = middlewares;
const router = Router();

router.post(
  '/promotion/contact-us/enquiry',
  validateMiddleware(promotionValidator.createEnquirySchema),
  promotionController.addEnquiry,
);

router.get(
  '/promotion/contact-us/enquiry',
  promotionController.getAllEnquiry,
);

router.get(
  '/promotion/video',
  promotionController.getPromotionVideo,
);

router.delete(
  '/promotion/contact-us/enquiry/:id',
  validateMiddleware(promotionValidator.detailAndDeletePromotionEnquiry),
  promotionMiddleware.checkPromotionContactUsEnquiryExist,
  promotionController.deleteEnquiry,
);

router.post(
  '/promotion/contact-us-admin',
  validateMiddleware(promotionValidator.contactUsAdminSchema),
  promotionController.contactUsAdmin,
);

export default router;
