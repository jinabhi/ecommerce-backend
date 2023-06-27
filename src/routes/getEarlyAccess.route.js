import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares';

const { getEarlyAccessController } = controllers;
const { getEarlyAccessValidator } = validations;
const { validateMiddleware, getEarlyAccessMiddleware } = middlewares;
const router = Router();

router.post(
  '/promotion/early-access',
  validateMiddleware(getEarlyAccessValidator.createGetEarlyAccessSchema),
  getEarlyAccessMiddleware.checkCountryCodeAndMobile,
  getEarlyAccessController.addContact,
);

router.get(
  '/promotion/early-access',
  getEarlyAccessController.getAllGetEarlyContactUs,
);

router.delete(
  '/promotion/early-access/:id',
  validateMiddleware(getEarlyAccessValidator.detailAndDeleteGetEarlyAccessSchema),
  getEarlyAccessMiddleware.checkGetEarlyAccessEnquiryExist,
  getEarlyAccessController.deleteGetEarlyAccess,
);

export default router;
