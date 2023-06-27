import Joi from 'joi';

const addToCartSchema = {
  body: Joi.object({
    product: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().label('Product')
          .required(),
        quantity: Joi.number().integer().greater(0).label('Quantity')
          .required(),
      }),
    ),
  }),
};

const detailAndDeleteSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateCartSchema = {
  ...detailAndDeleteSchema,
  body: Joi.object({
    quantity: Joi.number().integer().greater(0).label('Quantity')
      .required(),
  }),
};

const updateGuestCartSchema = {
  body: Joi.object({
    token: Joi.string().label('token')
      .required(),
  }),
};

export default {
  addToCartSchema,
  updateCartSchema,
  detailAndDeleteSchema,
  updateGuestCartSchema,
};
