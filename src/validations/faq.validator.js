import Joi from 'joi';

const createFaqSchema = {
  body: Joi.object({
    question: Joi.string().trim().min(3).label('Question')
      .required(),
    answer: Joi.string().trim().min(3).label('Answer')
      .required(),
    type: Joi.string().valid('seller', 'customer', 'promotional').label('Type')
      .required(),
  }),
};
const detailAndDeleteFaqSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateSubCategorySchema = {
  ...detailAndDeleteFaqSchema,
  ...createFaqSchema,
};

export default {
  createFaqSchema,
  detailAndDeleteFaqSchema,
  updateSubCategorySchema,
};
