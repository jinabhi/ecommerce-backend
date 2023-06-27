import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();

const { cartController } = controllers;
const { cartValidator } = validations;
const {
  validateMiddleware,
  cartMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/customer/add-cart',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  validateMiddleware(cartValidator.addToCartSchema),
  cartMiddleware.checkProductAvailable,
  cartMiddleware.checkProductQuantity,
  cartController.addToCart,
);

router.put(
  '/customer/update-cart/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  validateMiddleware(cartValidator.updateCartSchema),
  cartMiddleware.checkProductAvailable,
  cartMiddleware.checkProductQuantity,
  cartController.updateCart,
);

router.put(
  '/customer/guest-cart-update',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  validateMiddleware(cartValidator.updateGuestCartSchema),
  cartController.updateGuestCart,
);

router.put(
  '/customer/remove-product/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  validateMiddleware(cartValidator.detailAndDeleteSchema),
  cartMiddleware.checkProductInCart,
  cartController.removeCartItem,
);

router.get(
  '/customer/cart',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'guest']),
  cartController.getCartProduct,
);

export default router;
