import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { faqController } = controllers;
const { faqValidator } = validations;

const {
  validateMiddleware,
  faqMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/admin/faq',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(faqValidator.createFaqSchema),
  faqController.createFaq,
);

router.get(
  '/faq',
  faqController.getAllFaq,
);

router.get(
  '/faq/:id',
  validateMiddleware(faqValidator.detailAndDeleteFaqSchema),
  faqMiddleware.checkFaqExist,
  faqController.getFaqDetail,
);

router.put(
  '/admin/faq/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(faqValidator.detailAndDeleteFaqSchema),
  faqMiddleware.checkFaqExist,
  faqController.updateFaq,
);

router.delete(
  '/admin/faq/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(faqValidator.detailAndDeleteFaqSchema),
  faqMiddleware.checkFaqExist,
  faqController.deleteFaq,
);

export default router;
