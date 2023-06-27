import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { shippingLogController } = controllers;
const { shippingLogValidator } = validations;
const {
  validateMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
  productMiddleware,
} = middlewares;

router.post(
  '/seller/inventory/shipping-log',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(shippingLogValidator.shippingLogSchema),
  productMiddleware.checkProductExist,
  shippingLogController.addShippingLog,
);

router.get(
  '/inventory/shipping-log',
  authMiddleware,
  resourceAccessMiddleware(['seller', 'admin', 'staff']),
  shippingLogController.getShippingLogs,
);

router.put(
  '/admin/shipping-log/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(shippingLogValidator.shippingLogStatusUpdateSchema),
  productMiddleware.checkProductQuantityExist,
  shippingLogController.statusUpdate,
);

export default router;
