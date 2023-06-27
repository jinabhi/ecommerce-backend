import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { howItWorksController } = controllers;
const { howItWorksValidator } = validations;
const {
  validateMiddleware, authMiddleware, resourceAccessMiddleware,
  howItWorksMiddleware,
} = middlewares;

router.post(
  '/admin/how-it-works',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(howItWorksValidator.createHowItWorksSchema),
  howItWorksController.addHowItWorks,
);

router.get(
  '/how-it-works',
  howItWorksController.howItWorksDetails,
);

router.get(
  '/how-it-works/:id',
  validateMiddleware(howItWorksValidator.detailAndDeleteHowItWorksSchema),
  howItWorksMiddleware.checkHowItWorksExist,
  howItWorksController.getHowItWorksDetails,
);

router.put(
  '/admin/how-it-works/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(howItWorksValidator.updateHowItWorksSchema),
  howItWorksMiddleware.checkHowItWorksExist,
  howItWorksController.updateHowItWorks,
);

router.delete(
  '/admin/how-it-works/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(howItWorksValidator.detailAndDeleteHowItWorksSchema),
  howItWorksMiddleware.checkHowItWorksExist,
  howItWorksController.deleteHowItWorks,
);
export default router;
