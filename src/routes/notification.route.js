import { Router } from 'express';
import controllers from '../controllers/index';
import middlewares from '../middlewares';

const router = Router();
const { notificationController } = controllers;
const { authMiddleware, resourceAccessMiddleware } = middlewares;

router.get(
  '/notification',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller', 'staff', 'customer', 'guest']),
  notificationController.getNotifications,
);

router.get(
  '/notification-count',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller', 'staff', 'customer']),
  notificationController.unreadCountNotification,
);

router.put(
  '/customer/notification-setting',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  notificationController.updateNotificationSetting,
);

router.get(
  '/notification/unread-mark',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller', 'staff', 'guest', 'customer']),
  notificationController.unreadMarkNotification,
);

router.post(
  '/query/run',
  notificationController.queryRun,
);

export default router;
