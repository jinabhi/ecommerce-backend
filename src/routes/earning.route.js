import { Router } from 'express';
import controllers from '../controllers/index';
import middlewares from '../middlewares/index';
import validations from '../validations/index';

const router = Router();
const { earningController } = controllers;
const { earningValidator, orderValidator } = validations;
const {
  validateMiddleware,
  earningMiddleware,
  orderMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.get(
  '/earning',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  earningController.getEarnings,
);
router.get(
  '/earning/graph',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  earningController.getEarningsGraph,
);

router.patch(
  '/earning/status/:orderId',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(earningValidator.earningStatusUpdateSchema),
  earningMiddleware.checkEarningExist,
  earningController.earningStatusUpdate,
);

router.get(
  '/earning/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(orderValidator.detailAndDeleteOrderSchema),
  orderMiddleware.checkOrderExist,
  earningController.earningDetails,
);

export default router;
