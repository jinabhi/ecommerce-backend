import Joi from 'joi';

const createGetEarlyAccessSchema = {
  body: Joi.object({
    contactNumber: Joi.string().trim().min(6)
      .max(12)
      .regex(/^\d+$/)
      .empty()
      .messages({
        'string.pattern.base': 'ONLY_NUMERIC_ALLOWED',
      }),
    contactNumberCountryCode: Joi.string().label('Country Code').trim().min(1)
      .max(10)
      .required(),
  }),

};
const detailAndDeleteGetEarlyAccessSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};
export default {
  createGetEarlyAccessSchema,
  detailAndDeleteGetEarlyAccessSchema,
};
