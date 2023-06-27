import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { cmsController } = controllers;
const { cmsValidator } = validations;

const {
  validateMiddleware,
  cmsMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.get(
  '/cms',
  cmsController.getAllCms,
);

router.get(
  '/cms/:id',
  validateMiddleware(cmsValidator.detailAndDeleteCmsSchema),
  cmsMiddleware.checkCmsExist,
  cmsController.getCms,
);

router.put(
  '/admin/cms/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(cmsValidator.detailAndDeleteCmsSchema),
  // cmsMiddleware.checkCmsNameExist,
  cmsController.updateCms,
);

router.delete(
  '/admin/cms/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(cmsValidator.detailAndDeleteCmsSchema),
  cmsMiddleware.checkCmsExist,
  cmsController.deleteCms,
);

export default router;
