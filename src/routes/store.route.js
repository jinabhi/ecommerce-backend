import { Router } from 'express';
import controllers from '../controllers/index';
import middlewares from '../middlewares/index';

const router = Router();
const { storeController } = controllers;
const {
  authMiddleware, resourceAccessMiddleware,
} = middlewares;

router.get(
  '/store',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  storeController.getMyStore,
);

export default router;
