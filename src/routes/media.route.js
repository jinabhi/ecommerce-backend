import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { mediaValidator } = validations;
const { mediaController } = controllers;
const { validateMiddleware, authMiddleware } = middlewares;

router.post(
  '/media/upload/:mediaFor/:mediaType',
  authMiddleware,
  (req, res, next) => {
    const { params, body } = req;
    params.apiName = 'media';
    Object.assign(body, params);
    next();
  },
  validateMiddleware(mediaValidator.uploadSchema),
  mediaController.uploadMedia,
  mediaController.saveMedia,
);

router.post(
  '/public/upload/:mediaFor/:mediaType',
  (req, res, next) => {
    const { params, body } = req;
    params.apiName = 'media';
    Object.assign(body, params);
    next();
  },
  validateMiddleware(mediaValidator.uploadSchema),
  mediaController.uploadMedia,
  mediaController.saveMedia,
);

router.post(
  '/media/upload/:mediaFor',
  (req, res, next) => {
    const { params, body } = req;
    params.apiName = 'media';
    Object.assign(body, params);
    next();
  },
  validateMiddleware(mediaValidator.uploadMediaSchema),
  mediaController.uploadMediaFile,
  mediaController.saveMedia,
);

export default router;
