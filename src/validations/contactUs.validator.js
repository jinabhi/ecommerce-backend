import Joi from 'joi';

const createContactUsSchema = {
  body: Joi.object({
    reason: Joi.string().trim().min(3).max(25)
      .label('Reason')
      .required(),
    description: Joi.string().trim().min(3).label('Description')
      .required(),
    userType: Joi.string().valid('customer', 'seller').required(),
  }),
};

const addCreditPointSchema = {
  body: Joi.object({
    productComplainId: Joi.number().integer().greater(0).required(),
    userId: Joi.number().integer().greater(0).required(),
    point: Joi.number().integer().label('Credit point').greater(0)
      .max(1000)
      .required(),
  }),
};

const detailAndDeleteSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const createProductComplaintSchema = {
  body: Joi.object({
    description: Joi.string().trim().min(3).label('Description')
      .required(),
    orderId: Joi.number().integer().greater(0).required(),
    productId: Joi.number().integer().greater(0).required(),
    damageProductImages: Joi.array()
      .items(
        Joi.object().keys({
          basePath: Joi.string().optional().empty().allow(''),
        }),
      )
      .optional()
      .allow(null)
      .allow(''),
  }),
};

const statusUpdateProductComplaintSchema = {
  ...detailAndDeleteSchema,
  body: Joi.object({
    productComplaintStatus: Joi.string().valid('accepted', 'rejected').required(),
  }),
};

export default {
  createContactUsSchema,
  createProductComplaintSchema,
  addCreditPointSchema,
  statusUpdateProductComplaintSchema,
};
