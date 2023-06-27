import Joi from 'joi';

const detailSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const otpVerify = {
  otp: Joi.number().integer()
    .required(),
  phoneNumber: Joi.string().trim().min(6)
    .max(12)
    .regex(/^\d+$/)
    .empty()
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    }),
};

const profileAndAddress = {
  profilePicture: Joi.string().trim().min(3).label('Profile Image')
    .optional()
    .empty()
    .allow(null)
    .allow(''),
  address: Joi.string().trim().min(3).label('Address')
    // .regex(/^[a-zA-Z]+[a-zA-Z\d\s]+$/)
    // .messages({
    //   'string.pattern.base': 'ONLY_ALPHANUMERIC_ALLOWED'
    // })
    .required(),
};

const commonUser = {
  firstName: Joi.string().trim().min(3).label('First Name')
    .optional()
    .empty()
    .allow(null)
    .allow(''),
  lastName: Joi.string().trim().min(3).label('Last Name')
    .optional()
    .empty()
    .allow(null)
    .allow(''),
};

const user = {
  firstName: Joi.string().trim().min(3).max(24)
    .label('First Name')
    .required(),
  lastName: Joi.string().trim().min(3).max(24)
    .label('Last Name')
    .required(),
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } }).min(6)
    .max(100)
    .label('Email')
    .required(),
  phoneNumber: Joi.string().label('Phone Number').min(6)
    .max(12)
    .regex(/^\d+$/)
    .required()
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    }),
  phoneNumberCountryCode: Joi.string().label('Country Code')
    .required(),
  password: Joi.string().trim()
    .min(6)
    .max(15)
    .regex(/(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{6,}).*$/)
    .messages({
      'string.pattern.base': 'PASSWORD_VALIDATION',
    })
    .required(),
};

const customerViaSocialLogin = {
  ...commonUser,
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } }).min(6).max(100)
    .label('Email')
    .optional()
    .empty()
    .allow(null)
    .allow(''),
  phoneNumber: Joi.string().label('Phone Number').min(6)
    .max(12)
    .regex(/^\d+$/)
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    })
    .optional()
    .empty()
    .allow(null)
    .allow(''),
  phoneNumberCountryCode: Joi.string().label('Country Code').optional().empty()
    .allow(null)
    .allow(''),
  socialId: Joi.string().label('Social Id').required(),
  socialType: Joi.string().valid('facebook', 'apple', 'google').required(),
  socialToken: Joi.string().trim().optional().empty()
    .allow(''),
  nonce: Joi.string().trim().optional().empty()
    .allow(''),
  firebaseToken: Joi.string().trim().optional().empty()
    .allow(''),
  deviceType: Joi.string().trim().valid('android', 'ios').required(),
  appVersion: Joi.string().trim().required(),
};

const updateBankDetail = {
  routingNumber: Joi.string().trim().min(9).max(12)
    .regex(/^[a-zA-Z0-9]+$/)
    .messages({
      'string.pattern.base': 'ONLY_ALPHANUMERIC_ALLOWED',
    })
    .label('Routing number')
    .required(),
  accountHolderName: Joi.string().trim().min(2).max(24)
    .label('Account holder name')
    .required(),
  accountNumber: Joi.string().trim().min(9).max(12)
    .regex(/^\d+$/)
    .label('Account number')
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    })
    .required(),
};

const createSellerSchema = {
  body: Joi.object({
    ...user,
    confirmPassword: Joi.string().trim().label('Confirm Password')
      .valid(Joi.ref('password'))
      .messages({ 'any.only': 'CONFIRM_PASSWORD_NOT_MATCH' })
      .required(),
  }),
};

const createCustomerSchema = {
  body: Joi.object(user),
};

const createCustomerViaSocialLoginSchema = {
  body: Joi.object(customerViaSocialLogin),
};

const createCustomerAboutUsSchema = {
  body: Joi.object().keys({
    userId: Joi.number().integer().greater(0).required(),
    pinCode: Joi.string().length(6).regex(/^[0-6]*$/).label('Pin code')
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      })
      .required(),
  }),
};

const createStaffSchema = {
  body: Joi.object().keys({
    ...user,
    ...profileAndAddress,
  }),
};

const otpVerifySchema = {
  body: Joi.object().keys(otpVerify),
};

const customerOtpVerifySchema = {
  body: Joi.object().keys({
    ...otpVerify,
    firebaseToken: Joi.string().trim().optional().empty()
      .allow(''),
    deviceType: Joi.string().trim().valid('android', 'ios').required(),
    appVersion: Joi.string().trim().required(),
  }),
};

const addBankDetailsSchema = {
  body: Joi.object().keys({
    ...updateBankDetail,
    userId: Joi.number().integer().greater(0).required(),
  }),
};

const updateBankDetailsSchema = {
  body: Joi.object().keys(updateBankDetail),
  ...detailSchema,
};

const userCategorySchema = {
  body: Joi.object().keys({
    categoryIds: Joi.array()
      .items(Joi.number().integer().greater(0).required())
      .required(),
    userId: Joi.number().integer().greater(0).required(),
    firebaseToken: Joi.string().trim().optional().empty()
      .allow(''),
    deviceType: Joi.string().trim().valid('android', 'ios').required(),
    appVersion: Joi.string().trim().required(),
  }),
};

const sellerCategorySchema = {
  body: Joi.object().keys({
    categoryIds: Joi.array()
      .items(Joi.number().integer().greater(0).required())
      .required(),
    userId: Joi.number().integer().greater(0).required(),
  }),
};

const resendOtpSchema = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().label('Phone Number').min(6)
      .max(12)
      .regex(/^\d+$/)
      .empty()
      .required()
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      }),
  }),
};

delete user.password;
delete user.status;
const updateCustomerAboutUsSchema = {
  body: Joi.object().keys({
    ...user,
    profilePicture: Joi.string().trim().optional().empty()
      .allow(null || '')
      .required(),
  }),
};

const updateSchema = {
  ...detailSchema,
  ...createStaffSchema,
};

const updateMobileNumberSchema = {
  body: Joi.object().keys({
    phoneNumber: Joi.string().trim().min(6)
      .max(12)
      .regex(/^\d+$/)
      .empty()
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      }),
  }),
};

const requestRejectSchema = {
  ...detailSchema,
  body: Joi.object().keys({
    message: Joi.string().trim().min(1)
      .max(254)
      .required(),
  }),
};

delete user.password;
const updateStaffSchema = {
  ...detailSchema,
  body: Joi.object().keys({
    ...user,
    profilePicture: Joi.string().trim().min(3).label('Profile Image')
      .optional()
      .allow('')
      .empty(),
    address: Joi.string().trim().min(3).label('Address')
      .optional()
      .allow('')
      .empty(),
  }),

};

const statusUpdateSchema = {
  ...detailSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};

delete otpVerify.phoneNumber;
const changeNumberOtpVerifySchema = {
  body: Joi.object(otpVerify),
};

const detailCheckSchema = {
  body: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } }).min(6)
      .max(100)
      .label('Email')
      .required(),
    phoneNumber: Joi.string().label('Phone Number').min(6)
      .max(12)
      .regex(/^\d+$/)
      .required()
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      }),
  }),
};

export default {
  createStaffSchema,
  updateStaffSchema,
  createSellerSchema,
  userCategorySchema,
  sellerCategorySchema,
  detailSchema,
  detailCheckSchema,
  otpVerifySchema,
  updateSchema,
  addBankDetailsSchema,
  updateBankDetailsSchema,
  createCustomerSchema,
  createCustomerViaSocialLoginSchema,
  createCustomerAboutUsSchema,
  resendOtpSchema,
  updateCustomerAboutUsSchema,
  updateMobileNumberSchema,
  requestRejectSchema,
  customerOtpVerifySchema,
  statusUpdateSchema,
  changeNumberOtpVerifySchema,
};
