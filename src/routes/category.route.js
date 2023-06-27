import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { categoryController } = controllers;
const { categoryValidator } = validations;
const {
  validateMiddleware,
  categoryMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
  mediaMiddleware,
} = middlewares;

router.post(
  '/admin/category',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(categoryValidator.createCategorySchema),
  categoryMiddleware.checkCategoryNameExist,
  (req, res, next) => {
    const {
      body: { categoryImage },
    } = req;
    Object.assign(req.params, {
      basePathArray: [categoryImage],
      mediaFor: 'category',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  categoryController.addCategory,
);

router.get(
  '/admin/category',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  categoryController.getAllCategory,
);

router.get(
  '/category',
  categoryController.getAllCategory,
);

router.put(
  '/admin/category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(categoryValidator.updateCategorySchema),
  categoryMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  categoryMiddleware.checkCategoryNameExist,
  categoryMiddleware.checkCategoryExist,
  categoryController.updateCategory,
);

router.get(
  '/admin/category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(categoryValidator.detailAndDeleteSchema),
  categoryMiddleware.checkCategoryExist,
  categoryController.categoryDetails,
);

router.put(
  '/admin/category/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(categoryValidator.statusUpdateSchema),
  categoryMiddleware.checkCategoryExist,
  categoryController.statusUpdateCategory,
);

router.delete(
  '/admin/category/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(categoryValidator.detailAndDeleteSchema),
  categoryMiddleware.checkCategoryExist,
  categoryController.deleteCategory,
);

export default router;
