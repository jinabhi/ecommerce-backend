import { Router } from 'express';
import controllers from '../controllers/index';
import validations from '../validations/index';
import middlewares from '../middlewares/index';

const router = Router();
const { generalSettingController } = controllers;
const { generalSettingValidator } = validations;
const {
  validateMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.get(
  '/general-setting',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  generalSettingController.getAllGeneralSetting,
);

router.put(
  '/general-setting',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(generalSettingValidator.updateGeneralSettingSchema),
  generalSettingController.updateGeneralSetting,
);

export default router;
