import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { userController } = controllers;
const { userValidator } = validations;

const {
  validateMiddleware,
  userMiddleware,
  mediaMiddleware,
  authMiddleware,
  accountMiddleware,
  resourceAccessMiddleware,
  orderMiddleware,
  socialAuthMiddleware,
} = middlewares;

router.post(
  '/admin/staff',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.createStaffSchema),
  userMiddleware.checkUserEmailExist,
  (req, res, next) => {
    const {
      body: { profilePicture },
    } = req;
    Object.assign(req.params, {
      basePathArray: profilePicture ? [profilePicture] : [],
      mediaFor: 'user',
    });
    next();
  },
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  userController.createStaff,
);

router.put(
  '/admin/staff/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.updateStaffSchema),
  userMiddleware.checkUserExist,
  accountMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  userMiddleware.checkUserEmailExist,
  userController.updateUser,
);

router.get(
  '/admin/staff/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'staff']),
  validateMiddleware(userValidator.detailSchema),
  userMiddleware.checkUserExist,
  userController.getUserDetail,
);

router.put(
  '/admin/staff/password/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  userMiddleware.checkPassword,
  userController.updateUser,
);

router.get(
  '/admin/staff',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  (req, res, next) => {
    req.query.userRole = 'staff';
    next();
  },
  userController.getAllUser,
);

router.post(
  '/seller',
  validateMiddleware(userValidator.createSellerSchema),
  (req, res, next) => {
    req.body.userRole = 'seller';
    next();
  },
  userMiddleware.checkUserEmailExist,
  userMiddleware.checkPassword,
  userController.createUser,
);

router.post(
  '/seller/otp-verify',
  validateMiddleware(userValidator.otpVerifySchema),
  accountMiddleware.checkOtpVerify,
  userController.otpVerify,
);

router.post(
  '/seller/bank',
  validateMiddleware(userValidator.addBankDetailsSchema),
  accountMiddleware.checkUserExist,
  userMiddleware.checkRoutingAccountNumberExist,
  userController.addBankDetail,
);

router.put(
  '/seller/bank/:id',
  authMiddleware,
  validateMiddleware(userValidator.updateBankDetailsSchema),
  userMiddleware.checkRoutingAccountNumberExist,
  userController.updateBankDetail,
);

router.get(
  '/admin/seller',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  (req, res, next) => {
    req.query.userRole = 'seller';
    next();
  },
  userController.getAllUser,
);

router.get(
  '/seller/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  validateMiddleware(userValidator.detailSchema),
  userMiddleware.checkUserExist,
  userController.getUserDetail,
);

router.put(
  '/admin/seller/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.statusUpdateSchema),
  userMiddleware.checkUserExist,
  (req, res, next) => {
    req.body.userRole = 'seller';
    next();
  },
  userController.updateStatus,
);

router.put(
  '/admin/staff/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.statusUpdateSchema),
  userMiddleware.checkUserExist,
  userController.updateStatus,
);

router.put(
  '/admin/seller-request/rejection/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.requestRejectSchema),
  userMiddleware.checkUserExist,
  userController.requestRejectMessage,
);

router.post(
  '/customer',
  validateMiddleware(userValidator.createCustomerSchema),
  userMiddleware.checkUserEmailExist,
  (req, res, next) => {
    const { body } = req;
    body.userRole = 'customer';
    body.confirmPassword = body.password;
    next();
  },
  userMiddleware.checkPassword,
  userController.createUser,
);

router.post(
  '/customer/social-media-login',
  validateMiddleware(userValidator.createCustomerViaSocialLoginSchema),
  socialAuthMiddleware.checkSocialAuthToken,
  userMiddleware.checkSocialIdExist,
  userMiddleware.checkUserEmailExist,
  (req, res, next) => {
    const { body } = req;
    body.userRole = 'customer';
    body.verificationStatus = 'completed';
    body.status = 'active';
    next();
  },
  userController.createUser,
);

router.post(
  '/resend-otp',
  validateMiddleware(userValidator.resendOtpSchema),
  accountMiddleware.checkUserExist,
  userController.resendOtp,
);

router.post(
  '/guest-user',
  userController.guestUser,
);

router.post(
  '/change-number/otp',
  authMiddleware,
  resourceAccessMiddleware(['customer', 'seller']),
  validateMiddleware(userValidator.resendOtpSchema),
  userController.resendOtp,
);

router.post(
  '/customer/otp-verify',
  validateMiddleware(userValidator.customerOtpVerifySchema),
  (req, res, next) => {
    const { body } = req;
    body.userRole = 'customer';
    next();
  },
  accountMiddleware.checkOtpVerify,
  userController.otpVerify,
);

router.post(
  '/customer/mobile-number/otp-verify',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(userValidator.changeNumberOtpVerifySchema),
  (req, res, next) => {
    const { body } = req;
    body.changeNumberVerificationStatus = true;
    next();
  },
  accountMiddleware.checkOtpVerify,
  userController.otpVerify,
);

router.post(
  '/seller/mobile-number/otp-verify',
  authMiddleware,
  resourceAccessMiddleware(['seller']),
  validateMiddleware(userValidator.changeNumberOtpVerifySchema),
  (req, res, next) => {
    const { body } = req;
    body.changeNumberVerificationStatus = true;
    next();
  },
  accountMiddleware.checkOtpVerify,
  userController.otpVerify,
);

router.post(
  '/detail-check',
  authMiddleware,
  validateMiddleware(userValidator.detailCheckSchema),
  userMiddleware.checkUpdateUserEmailExist,
  userController.checkDetail,
);

router.put(
  '/customer',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(userValidator.updateCustomerAboutUsSchema),
  userMiddleware.checkUpdateUserEmailExist,
  accountMiddleware.checkUpdateMediaExist,
  mediaMiddleware.checkMediaFor,
  mediaMiddleware.checkMediaExists,
  userController.updateUser,
);

router.put(
  '/customer/mobile-number',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  validateMiddleware(userValidator.updateMobileNumberSchema),
  (req, res, next) => {
    const { body } = req;
    body.mobileNumberUpdate = true;
    next();
  },
  userController.updateUser,
);

router.get(
  '/admin/customer',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  (req, res, next) => {
    req.query.userRole = 'customer';
    next();
  },
  userController.getAllUser,
);

router.get(
  '/admin/customer/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'seller']),
  validateMiddleware(userValidator.detailSchema),
  userMiddleware.checkUserExist,
  userController.getUserDetail,
);

router.put(
  '/admin/customer/status/:id',
  authMiddleware,
  resourceAccessMiddleware(['admin']),
  validateMiddleware(userValidator.statusUpdateSchema),
  (req, res, next) => {
    req.body.userRole = 'customer';
    next();
  },
  userMiddleware.checkUserExist,
  orderMiddleware.checkCustomerOrderExist,
  userController.updateStatus,
);

router.get(
  '/payment-details',
  authMiddleware,
  resourceAccessMiddleware(['customer']),
  userController.getStripeDetails,
);

// router.post(
//   '/send-test-notification',
//   userController.sendTestNotification,
// );

export default router;
