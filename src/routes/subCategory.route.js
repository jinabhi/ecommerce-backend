import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { subCategoryController } = controllers;
const { subCategoryValidator } = validations;

const {
  validateMiddleware,
  subCategoryMiddleware,
  categoryMiddleware,
  mediaMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/admin/sub-category',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(subCategoryValidator.createSubCategorySchema),
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryNameExist,
  (req, res, next) => {
    const {
      body: { subCategoryImage },
    } = req;
    Object.assign(req.params, {
      basePathArray: [subCategoryImage],
      mediaFor: 'subCategory',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  subCategoryController.addSubCategory,
);

router.get(
  '/admin/sub-category',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  subCategoryController.getAllSubCategory,
);

router.get(
  '/sub-category',
  subCategoryController.getAllSubCategory,
);

router.get(
  '/admin/sub-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(subCategoryValidator.detailAndDeleteSubCategorySchema),
  subCategoryMiddleware.checkSubCategoryExist,
  subCategoryController.getSubCategory,
);

router.put(
  '/admin/sub-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(subCategoryValidator.detailAndDeleteSubCategorySchema),
  subCategoryMiddleware.checkSubCategoryExist,
  subCategoryMiddleware.checkSubCategoryNameExist,
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  subCategoryController.updateSubCategory,
);

router.delete(
  '/admin/sub-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(subCategoryValidator.detailAndDeleteSubCategorySchema),
  subCategoryMiddleware.checkSubCategoryExist,
  subCategoryController.deleteSubCategory,
);

export default router;
