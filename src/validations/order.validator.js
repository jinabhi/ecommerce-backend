import Joi from 'joi';

const detailAndDeleteOrderSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const placeOrderSchema = {
  body: Joi.object({
    order: Joi.array().items(
      Joi.object().keys({
        productId: Joi.number().integer().greater(0).label('Product id')
          .required(),
        quantity: Joi.number().integer().greater(0).label('Quantity')
          .required(),
        productAmount: Joi.number().label('Product amount')
          .required(),
        countryCurrencyAmount: Joi.number().label('Country currency amount')
          .required(),
        shippingCharges: Joi.number().label('Country currency amount')
          .required(),
      }),
    ),
    orderNumber: Joi.string().max(6).regex(/^\d+$/)
      .label('Order Number')
      .optional()
      .empty()
      .allow(''),
    addressId: Joi.number().integer().greater(0).label('Address')
      .required(),
    creditPoints: Joi.number().integer().label('Credit points'),
    creditPointsAmount: Joi.number().label('Credit points amount'),
    cardId: Joi.string().label('Card id'),
    paymentType: Joi.number().label('Type'),
    orderTax: Joi.number().label('tax'),
    orderTotal: Joi.number().min(0).label('Order total')
      .max(999999.99)
      .required(),
    paymentTransactionId: Joi.string()
      .label('Payment Transaction Id')
      .optional()
      .empty()
      .allow(''),
    paymentTransactionStatus: Joi.string()
      .label('Order Number')
      .optional()
      .empty()
      .allow(''),
    paymentResponse: Joi.string()
      .label('Order Number')
      .optional()
      .empty()
      .allow(''),
    orderTotalUsd: Joi.any().when('paymentType', {
      is: 4,
      then: Joi.number().label('Order Total').required(),
      otherwise: Joi.optional().empty()
        .allow(''),
    }),
    nonce: Joi.any().when('paymentType', {
      is: 4,
      then: Joi.string().label('Nonce').required(),
      otherwise: Joi.optional().empty()
        .allow(''),
    }),
    payerId: Joi.string()
      .label('Payer')
      .optional()
      .empty()
      .allow(''),
  }),
};

const paypalOrderSchema = {
  body: Joi.object({
    amount: Joi.number().label('Amount')
      .required(),
  }),
};

const orderStatusUpdateSchema = {
  ...detailAndDeleteOrderSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'packed', 'pickedUp', 'completed', 'canceled').required(),
    trackingLink: Joi.string(),
  }),
};
export default {
  orderStatusUpdateSchema,
  detailAndDeleteOrderSchema,
  placeOrderSchema,
  paypalOrderSchema,

};
