import Joi from 'joi';

const createSubCategorySchema = {
  body: Joi.object({
    subCategoryImage: Joi.string().trim().min(3).label('Sub Category Image')
      .required(),
    name: Joi.string().trim().min(3).label('Name')
      .required(),
    categoryId: Joi.number().integer().greater(0).required(),
  }),
};
const detailAndDeleteSubCategorySchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateSubCategorySchema = {
  ...detailAndDeleteSubCategorySchema,
  ...createSubCategorySchema,
};

export default {
  createSubCategorySchema,
  detailAndDeleteSubCategorySchema,
  updateSubCategorySchema,
};
