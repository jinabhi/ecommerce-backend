import Joi from 'joi';

const brand = {
  name: Joi.string().trim().min(3).max(24)
    .label('Brand Name')
    .required(),
  storeName: Joi.string().trim().min(3).max(24)
    .label('Store Name')
    .required(),
  storeLicenseDocumentImage: Joi.string().trim().min(3).label('Store License Document Image')
    .required(),
  storeContactNumber: Joi.string().label('Store Contact Number').min(6)
    .max(12)
    .regex(/^\d+$/)
    .empty()
    .messages({
      'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
    }),
  storeContactNumberCountryCode: Joi.string().trim().min(1).label('Store Contact code')
    .required(),
  address: Joi.string().trim().min(1).max(54)
    // .regex(/^[a-zA-Z]+[a-zA-Z\d\s]+$/)
    // .messages({
    //   'string.pattern.base': 'ONLY_ALPHANUMERIC_ALLOWED'
    // })
    .label('Store Address')
    .required(),
  brandImage: Joi.string().trim().min(3).label('Brand image')
    .required(),
  cityId: Joi.number().integer().greater(0).required(),
  stateId: Joi.number().integer().greater(0).required(),
  countryId: Joi.number().integer().greater(0).required(),
};

const createBrandSchema = {
  body: Joi.object({
    ...brand,
    userId: Joi.number().integer().greater(0).required(),
  }),
};

const detailAndDeleteBrandSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateBrandCommission = {
  ...detailAndDeleteBrandSchema,
  body: Joi.object({
    commission: Joi.number().integer().label('Commission').greater(0)
      .max(100)
      .required(),
  }),
};

const updateBrandSchema = {
  body: Joi.object(brand),
  ...detailAndDeleteBrandSchema,
};
export default {
  createBrandSchema,
  detailAndDeleteBrandSchema,
  updateBrandSchema,
  updateBrandCommission,
};
