import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { paymentCardController } = controllers;
const { paymentCardValidator } = validations;

const {
  validateMiddleware,
  paymentCardMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/customer/payment-card',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(paymentCardValidator.PaymentCardSchema),
  // paymentCardMiddleware.checkPaymentCardAlreadyExist,
  paymentCardController.addPaymentCard,
);

router.get(
  '/customer/payment-card',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  paymentCardController.getSavedPaymentCardList,
);

router.get(
  '/customer/payment-card/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(paymentCardValidator.detailAndDeletePaymentCardSchema),
  paymentCardMiddleware.checkPaymentCardExist,
  paymentCardController.getPaymentCard,
);

router.delete(
  '/customer/payment-card/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(paymentCardValidator.detailAndDeletePaymentCardSchema),
  paymentCardMiddleware.checkPaymentCardExist,
  paymentCardController.deletePaymentCard,
);
router.put(
  '/customer/default-card/:id',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(paymentCardValidator.detailAndDeletePaymentCardSchema),
  paymentCardMiddleware.checkPaymentCardExist,
  paymentCardController.defaultePaymentCard,
);

export default router;
