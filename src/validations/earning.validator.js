import Joi from 'joi';

const detailAndDeleteEarningSchema = {
  params: Joi.object().keys({
    orderId: Joi.number().integer().required(),
  }),
};

const earningStatusUpdateSchema = {
  ...detailAndDeleteEarningSchema,
  body: Joi.object({
    status: Joi.string().valid('paid', 'pending').required(),
  }),
};
export default {
  earningStatusUpdateSchema,

};
