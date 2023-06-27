import Joi from 'joi';

const createAddressSchema = {
  body: Joi.object({
    fullName: Joi.string().trim()
      .label('Full name').min(2)
      .max(100)
      .required(),
    contactNumberCountryCode: Joi.string().required(),
    city: Joi.string().trim()
      .optional()
      .allow(null)
      .empty()
      .allow(''),
    state: Joi.string().trim()
      .optional()
      .allow(null)
      .empty()
      .allow(''),
    phoneNumber: Joi.string().trim().min(6)
      .max(12)
      .regex(/^\d+$/)
      .empty()
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      }),
    address: Joi.string().trim().max(200).label('Address'),
    latitude: Joi.number().optional().empty()
      .allow(null)
      .allow(''),
    longitude: Joi.number().optional().empty()
      .allow(null)
      .allow(''),
    zipCode: Joi.string().trim().required(),
    landmark: Joi.string().trim().max(200).optional(),
    addressType: Joi.string().valid('home', 'office', 'other').required(),
  }),
};

const detailAndDeleteAddressSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateAddressSchema = {
  ...createAddressSchema,
  ...detailAndDeleteAddressSchema,

};
export default {
  createAddressSchema,
  detailAndDeleteAddressSchema,
  updateAddressSchema,
};
