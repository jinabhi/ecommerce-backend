import Joi from 'joi';

const shippingLogSchema = {
  body: Joi.object({
    productId: Joi.number().integer().greater(0).required(),
    shippingQuantity: Joi.number()
      .integer()
      .greater(0)
      .min(1)
      .max(10000)
      .label('Shipping Quantity')
      .required(),
    trackingId: Joi.string().when('isShippingType', {
      is: false,
      then: Joi.string().trim().min(3).label('Tracking ID')
        .required(),
      otherwise: Joi.string().trim().optional().empty()
        .allow('')
        .allow(null),
    }),
    shippingCarrier: Joi.string().when('isShippingType', {
      is: false,
      then: Joi.string()
        .trim()
        .min(3)
        .label('Shipping Carrier')
        .required(),
      otherwise: Joi.string().trim().optional().empty()
        .allow('')
        .allow(null),
    }),
    isShippingType: Joi.boolean().required(),
  }),
};

const shippingLogStatusUpdateSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
  body: Joi.object({
    quantity: Joi.number().integer().greater(0)
      .label('Shipping quantity')
      .required(),
  }),
};

export default {
  shippingLogSchema,
  shippingLogStatusUpdateSchema,
};
