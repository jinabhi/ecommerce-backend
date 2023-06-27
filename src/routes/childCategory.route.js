import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { childCategoryController } = controllers;
const { childCategoryValidator } = validations;
const {
  validateMiddleware,
  childCategoryMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
  categoryMiddleware,
  subCategoryMiddleware,
  mediaMiddleware,
} = middlewares;

router.post(
  '/admin/child-category',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(childCategoryValidator.createChildCategory),
  childCategoryMiddleware.checkChildCategoryNameExist,
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryExist,
  (req, res, next) => {
    const {
      body: { childCategoryImage },
    } = req;
    Object.assign(req.params, {
      basePathArray: [childCategoryImage],
      mediaFor: 'childCategory',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  childCategoryController.addChildCategory,
);

router.get(
  '/admin/child-category',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  childCategoryController.getAllChildCategory,
);

router.get(
  '/child-category',
  childCategoryController.getAllChildCategory,
);

router.get(
  '/admin/child-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  validateMiddleware(childCategoryValidator.detailAndDeleteChildCategorySchema),
  childCategoryMiddleware.checkChildCategoryExist,
  childCategoryController.getChildCategory,
);
router.put(
  '/admin/child-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(childCategoryValidator.updateChildCategorySchema),
  childCategoryMiddleware.checkChildCategoryNameExist,
  categoryMiddleware.checkCategoryExist,
  subCategoryMiddleware.checkSubCategoryExist,
  childCategoryMiddleware.checkChildCategoryExist,
  childCategoryMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  childCategoryController.updateSubCategory,
);
router.delete(
  '/admin/child-category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(childCategoryValidator.detailAndDeleteChildCategorySchema),
  childCategoryMiddleware.checkChildCategoryExist,
  childCategoryController.deleteSubCategory,
);
export default router;
