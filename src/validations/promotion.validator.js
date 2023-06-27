import Joi from 'joi';

const createEnquirySchema = {
  body: Joi.object().keys({
    firstName: Joi.string().trim().min(3).max(26)
      .required(),
    lastName: Joi.string().trim().min(3).max(26)
      .required(),
    companyUrl: Joi.string().trim().max(200).optional()
      .empty()
      .allow('')
      .allow(null),
    instagramHandle: Joi.string().trim().max(200).optional()
      .empty()
      .allow('')
      .allow(null),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: false } }).min(6)
      .max(100)
      .label('Email')
      .required(),
    phoneNumber: Joi.string().trim().min(13)
      .max(13)
      .empty()
      .messages({
        'string.min': 'VALID_PHONE_NUMBER',
        'string.max': 'VALID_PHONE_NUMBER',
      }),
    countryCode: Joi.string().trim().min(1).max(6),
    subject: Joi.string().trim().max(100),
    message: Joi.string().trim().max(200)
      .optional()
      .empty()
      .allow('')
      .allow(null),
  }),
};

const detailAndDeletePromotionEnquiry = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const contactUsAdminSchema = {
  body: Joi.object().keys({
    from: Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: false } })
      .max(100)
      .required(),
    subject: Joi.string().trim().max(100),
    message: Joi.string().trim().max(300).required(),
  }),
};

export default {
  createEnquirySchema,
  detailAndDeletePromotionEnquiry,
  contactUsAdminSchema,
};
