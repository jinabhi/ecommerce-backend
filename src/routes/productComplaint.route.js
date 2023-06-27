import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { productComplaintController } = controllers;
const { contactUsValidator } = validations;
const {
  validateMiddleware, resourceAccessMiddleware, authMiddleware,
  contactUsMiddleware, mediaMiddleware, accountMiddleware,
  orderMiddleware,
} = middlewares;

router.post(
  '/product-complaint',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(contactUsValidator.createProductComplaintSchema),
  contactUsMiddleware.addDamageProductImageValidate,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  orderMiddleware.checkOrderExist,
  orderMiddleware.checkProductOrderDeliveredExist,
  productComplaintController.addProductComplaint,
);

router.get(
  '/admin/product-complaint',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  productComplaintController.getAllProductComplaint,
);

router.put(
  '/admin/product-complaint/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(contactUsValidator.statusUpdateProductComplaintSchema),
  contactUsMiddleware.checkProductComplaintExist,
  productComplaintController.updateProductComplaintStatus,
);

router.get(
  '/admin/product-complaint/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  validateMiddleware(contactUsValidator.detailAndDeleteSchema),
  contactUsMiddleware.checkProductComplaintExist,
  productComplaintController.productComplaintDetails,
);

router.post(
  '/admin/product-complaint/credit',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(contactUsValidator.addCreditPointSchema),
  contactUsMiddleware.checkProductComplaintExist,
  contactUsMiddleware.checkProductComplaintCreditExist,
  accountMiddleware.checkUserExist,
  productComplaintController.addCreditPoint,
);

export default router;
