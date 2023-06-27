import Joi from 'joi';

const createCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim().min(3).label('Name')
      .required(),
    categoryImage: Joi.string().trim().min(3).label('Category image')
      .required(),
  }),
};

const detailAndDeleteSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateCategorySchema = {
  ...detailAndDeleteSchema,
  ...createCategorySchema,
};

const statusUpdateSchema = {
  ...detailAndDeleteSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};

export default {
  createCategorySchema,
  updateCategorySchema,
  statusUpdateSchema,
  detailAndDeleteSchema,
};
