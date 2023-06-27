import { Router } from 'express';
import controllers from '../controllers/index';
import middlewares from '../middlewares/index';
import validations from '../validations/index';

const router = Router();
const { orderController } = controllers;
const { orderValidator } = validations;
const {
  validateMiddleware,
  orderMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/order',
  authMiddleware,
  // resourceAccessMiddleware(['customer']),
  validateMiddleware(orderValidator.placeOrderSchema),
  orderMiddleware.checkProductExist,
  orderMiddleware.checkCreditPointExist,
  orderController.placeOrder,
);
router.get(
  '/orders',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller', 'customer']),
  orderController.getOrders,
);

router.get(
  '/paytm-token',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  orderController.verifypaytmToken,
);

router.post(
  '/paypal-order',
  authMiddleware,
  // resourceAccessMiddleware(['customer']),
  validateMiddleware(orderValidator.paypalOrderSchema),
  orderController.PaypalOrder,
);
router.get(
  '/best-selling/products',
  authMiddleware,
  orderController.getBestSellingProducts,
);

router.patch(
  '/order/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer']),
  validateMiddleware(orderValidator.orderStatusUpdateSchema),
  orderMiddleware.checkOrderExist,
  // orderMiddleware.UserRolePermission,
  orderController.orderStatusUpdate,
);

router.get(
  '/order/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer']),
  validateMiddleware(orderValidator.detailAndDeleteOrderSchema),
  orderMiddleware.checkOrderExist,
  orderController.orderDetails,
);

router.get(
  '/sellerOrder/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller']),
  validateMiddleware(orderValidator.detailAndDeleteOrderSchema),
  orderMiddleware.checkOrderExist,
  orderController.sellerOrderDetails,
);

router.post(
  '/order-webhook',
  orderController.orderUpdateWebHook,
);
router.get(
  '/paypal-token',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer']),
  orderController.paypalToken,
);
router.post(
  '/paypal-webhook',
  orderController.paypalWebhook,
);
export default router;
