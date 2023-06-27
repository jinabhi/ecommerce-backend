import { Router } from 'express';
import controllers from '../controllers';
import middlewares from '../middlewares';

const router = Router();
const { dashboardController } = controllers;
const { authMiddleware, resourceAccessMiddleware } = middlewares;

router.get(
  '/admin/dashboard',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  dashboardController.getDashboardDetail,
);

router.get(
  '/admin/dashboard/registered-user/graph',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  dashboardController.getDashboardRegisteredUsersGraph,
);
router.get(
  '/dashboard/visitor-buyer/graph',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  dashboardController.getDashboardVisitorGraph,
);
router.get(
  '/admin/dashboard/product-category',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  dashboardController.getTopProductCategory,
);
router.get(
  '/dashboard',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  dashboardController.getSellerDashboardCount,
);

export default router;
