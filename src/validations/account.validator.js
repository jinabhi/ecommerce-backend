import Joi from 'joi';

const emailOrMobile = Joi.alternatives().try(
  Joi.string().trim().label('Phone Number').min(6)
    .max(15)
    .regex(/^\d+$/)
    .empty()
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    }),
  Joi.string().trim().label('Email')
    .required(),
).messages({
  'alternatives.match': 'EMAIL_MOBILE_NUMBER_ALLOWED',
});

const updateData = {
  firstName: Joi.string().trim().min(3).max(24)
    .label('First Name')
    .required(),
  lastName: Joi.string().trim().min(3).max(24)
    .label('Last Name')
    .optional()
    .empty()
    .allow(null)
    .allow(''),
  profilePicture: Joi.string().trim().optional().empty()
    .allow(''),
  phoneNumber: Joi.string().label('Phone Number').min(6)
    .max(12)
    .regex(/^\d+$/)
    .empty()
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    }),
  email: Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: false } }).min(6)
    .max(100)
    .required(),
};

const loginDetail = {
  email: Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: false } }).label('Email')
    .required(),
  password: Joi.string().trim().label('Password')
    .required(),
};

const passwordCommon = {
  newPassword: Joi.string().trim()
    .min(6)
    .max(15)
    .regex(/(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{6,}).*$/)
    .messages({
      'string.pattern.base': 'PASSWORD_VALIDATION',
    })
    .required(),
  confirmPassword: Joi.string().trim().label('Confirm Password')
    .valid(Joi.ref('newPassword'))
    .messages({ 'any.only': 'CONFIRM_PASSWORD_NOT_MATCH' })
    .required(),
};

const userAccountSignupSchema = {
  body: Joi.object().keys({
    ...updateData,
    ...loginDetail,
    confirmPassword: Joi.string().trim().label('Confirm Password')
      .valid(Joi.ref('password'))
      .messages({ 'any.only': 'CONFIRM_PASSWORD_NOT_MATCH' })
      .required(),
  }),
};

const editProfileSchema = {
  body: Joi.object().keys(updateData),
};

const editProfileDetailsSchema = {
  body: Joi.object().keys({
    ...updateData,
    city: Joi.string().trim().min(2).max(30)
      .optional()
      .empty()
      .allow(''),
    state: Joi.string().trim().min(2).max(30)
      .optional()
      .empty()
      .allow(''),
    country: Joi.string().trim().min(2).max(20)
      .optional()
      .empty()
      .allow(''),
    address: Joi.string().trim().min(2).max(60)
      .optional()
      .empty()
      .allow(''),
    dateOfBirth: Joi.string().trim().optional().empty()
      .allow(''),
    gender: Joi.string()
      .valid('male', 'female', 'other')
      .optional()
      .empty()
      .allow(''),
  }),
};

const userAdminAccountLoginSchema = {
  body: Joi.object().keys({
    ...loginDetail,
    userRole: Joi.string().trim().valid('admin', 'staff').required(),
  }),
};

const userAccountForgetPasswordSchema = {
  body: Joi.object().keys({ email: emailOrMobile }),
};

const userAccountResetPasswordSchema = {
  body: Joi.object().keys({
    token: Joi.string().trim().required(),
    ...passwordCommon,
    location: Joi.string().trim().min(1).required(),
  }),
};

const userAccountChangePasswordSchema = {
  body: Joi.object().keys({
    currentPassword: Joi.string().trim().required(),
    ...passwordCommon,
    location: Joi.string().trim().min(1).required(),
  }),
};

delete loginDetail.email;
const sellerAccountLoginSchema = {
  body: Joi.object().keys({
    emailMobileNumber: emailOrMobile,
    ...loginDetail,
  }),
};

const userAccountLoginSchema = {
  body: Joi.object({
    ...loginDetail,
    email: Joi.alternatives().try(
      Joi.string().trim().label('Phone Number').min(10)
        .max(12)
        .regex(/^\d+$/)
        .empty()
        .messages({
          'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
        }),
      Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: false } }).label('Email')
        .required(),
    ).messages({
      'alternatives.match': 'EMAIL_MOBILE_NUMBER_ALLOWED',
    }),
    firebaseToken: Joi.string().trim().optional().empty()
      .allow(''),
    deviceType: Joi.string().trim().valid('android', 'ios').required(),
    appVersion: Joi.string().trim().required(),
  }),
};

export default {
  userAccountSignupSchema,
  userAdminAccountLoginSchema,
  userAccountForgetPasswordSchema,
  editProfileSchema,
  userAccountResetPasswordSchema,
  userAccountChangePasswordSchema,
  userAccountLoginSchema,
  sellerAccountLoginSchema,
  editProfileDetailsSchema,
};
