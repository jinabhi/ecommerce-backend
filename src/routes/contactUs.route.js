import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { contactUsController } = controllers;
const { contactUsValidator } = validations;
const {
  validateMiddleware, resourceAccessMiddleware, authMiddleware, contactUsMiddleware,
} = middlewares;

router.post(
  '/contact-us',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'seller', 'guest']),
  validateMiddleware(contactUsValidator.createContactUsSchema),
  contactUsController.addContactUs,
);

router.get(
  '/admin/contact-us',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  contactUsController.getAllContactUs,
);

router.delete(
  '/admin/contact-us/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  contactUsMiddleware.checkContactUsExist,
  contactUsController.deleteContactUs,
);

export default router;
