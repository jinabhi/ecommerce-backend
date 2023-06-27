import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { productNotifyMeController } = controllers;
const { productNotifyMeValidator } = validations;
const {
  validateMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
  productNotifyMeMiddleware,
  productMiddleware,
} = middlewares;

router.post(
  '/customer/product-notify/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(productNotifyMeValidator.productNotifyMeSchema),
  productMiddleware.checkProductExist,
  productNotifyMeMiddleware.checkNotifyMeExist,
  productNotifyMeController.addProductNotifyMe,
);

export default router;
