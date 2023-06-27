import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { accountController } = controllers;
const { accountValidator } = validations;
const {
  validateMiddleware,
  accountMiddleware,
  authMiddleware,
  userMiddleware,
  resourceAccessMiddleware,
  mediaMiddleware,
} = middlewares;

router.post(
  '/signup',
  validateMiddleware(accountValidator.userAccountSignupSchema),
  accountMiddleware.checkEmailExists,
  accountController.signup,
);
router.post(
  '/admin/login',
  validateMiddleware(accountValidator.userAdminAccountLoginSchema),
  accountController.userAccountLogin,
);

router.post(
  '/seller/login',
  validateMiddleware(accountValidator.sellerAccountLoginSchema),
  (req, res, next) => {
    req.body.userRole = 'seller';
    next();
  },
  accountController.userAccountLogin,
);

router.get('/logout', authMiddleware, accountController.logout);

router.post(
  '/forget-password',
  validateMiddleware(accountValidator.userAccountForgetPasswordSchema),
  accountMiddleware.findUserByEmailOrMobileNumber,
  accountController.forgetPassword,
);

router.post(
  '/reset-password',
  validateMiddleware(accountValidator.userAccountResetPasswordSchema),
  accountMiddleware.checkValidToken,
  accountController.createNewPassword,
);

router.post(
  '/password',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller', 'staff']),
  validateMiddleware(accountValidator.userAccountChangePasswordSchema),
  accountMiddleware.checkOldPassword,
  accountMiddleware.checkOldPasswordNewPasswordSame,
  accountController.changePassword,
);

router.put(
  '/profile',
  authMiddleware,
  resourceAccessMiddleware(['seller', 'admin', 'staff']),
  validateMiddleware(accountValidator.editProfileSchema),
  accountMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  userMiddleware.checkUpdateUserEmailExist,
  accountController.editProfile,
);

router.put(
  '/profile-details',
  authMiddleware,
  resourceAccessMiddleware(['seller', 'admin', 'staff']),
  validateMiddleware(accountValidator.editProfileSchema),
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  accountController.editProfile,
);

router.get(
  '/account/me',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'customer', 'seller', 'staff']),
  (req, res, next) => {
    Object.assign(req.params, {
      id: req.user.id,
      type: 'self',
    });
    next();
  },
  userMiddleware.checkUserExist,
  accountController.getUserDetail,
);

router.post(
  '/login',
  validateMiddleware(accountValidator.userAccountLoginSchema),
  accountController.userAccountLogin,
);

router.get(
  '/winston-files',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  accountController.getWinstonLogsPath,
);

router.get(
  '/winston-logs',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  accountController.getWinstonLogs,
);

router.post(
  '/send-mailchimp',
  accountController.sendMailchimp,
);

// router.post(
//   '/send-test-mail',
//   accountController.sendTestMail,
// );

router.get(
  '/level-count',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  accountController.getWinstonLevelCount,
);

export default router;
