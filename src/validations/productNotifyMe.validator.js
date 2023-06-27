import Joi from 'joi';

const productNotifyMeSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

export default {
  productNotifyMeSchema,
};
