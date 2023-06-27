import Joi from 'joi';

const updateGeneralSettingSchema = {
  body: Joi.object({
    commission: Joi.number().integer()
      .label('Commission').min(1)
      .max(100)
      .required(),
    tax: Joi.number().integer().min(1)
      .max(100)
      .label('Tax')
      .required(),
    credit_point: Joi.number().integer().min(1).max(1000)
      .label('Credit Point')
      .required(),
    minimum_quantity_product: Joi.number().integer().min(1).max(1000)
      .label('Minimum quantity Product')
      .required(),
    promotion_video: Joi.string().valid('1', '0')
      .label('Promotion video')
      .required(),
  }),
};

export default {
  updateGeneralSettingSchema,
};
