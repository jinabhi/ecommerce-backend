import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { customNotificationsController } = controllers;
const { customNotificationsValidator } = validations;

const {
  validateMiddleware,
  customNotificationsMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
} = middlewares;

router.post(
  '/admin/custom-notification',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(customNotificationsValidator.createCustomNotificationSchema),
  customNotificationsController.addCustomNotification,
);

router.get(
  '/admin/custom-notification',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  customNotificationsController.getAllCustomNotifications,
);

router.get(
  '/admin/custom-notification/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(customNotificationsValidator.detailAndDeleteCustomNotificationSchema),
  customNotificationsMiddleware.checkCustomNotificationExist,
  customNotificationsController.getCustomNotification,
);

router.put(
  '/admin/custom-notification/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(customNotificationsValidator.detailAndDeleteCustomNotificationSchema),
  customNotificationsMiddleware.checkCustomNotificationExist,
  customNotificationsController.updateCustomNotification,
);

router.delete(
  '/admin/custom-notification/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(customNotificationsValidator.detailAndDeleteCustomNotificationSchema),
  customNotificationsMiddleware.checkCustomNotificationExist,
  customNotificationsController.deleteCustomNotifications,
);

export default router;
