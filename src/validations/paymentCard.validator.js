import Joi from 'joi';

const PaymentCardSchema = {
  body: Joi.object({
    cardHolderName: Joi.string()
      .label('Card holder name')
      .required(),
    expMonth: Joi.number()
      .label('Expiry month')
      .required(),
    expYear: Joi.number()
      .label('Expiry year')
      .required(),
    cardNumber: Joi.number()
      .label('Card number')
      .required(),
    cvc: Joi.number()
      .label('CVC')
      .required(),
    cardTag: Joi.string()
      .trim()
      .valid('personal', 'business', 'other')
      .label('Card tag')
      .required(),
  }),
};
const detailAndDeletePaymentCardSchema = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

export default {
  PaymentCardSchema,
  detailAndDeletePaymentCardSchema,
};
