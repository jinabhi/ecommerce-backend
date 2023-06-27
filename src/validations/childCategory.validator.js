import Joi from 'joi';

const createChildCategory = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(36)
      .label('Child Category Name')
      .required(),
    childCategoryImage: Joi.string().trim().min(3).label('Child Category image')
      .required(),
    categoryId: Joi.number().integer().greater(0).required(),
    subCategoryId: Joi.number().integer().greater(0).required(),
  }),
};
const detailAndDeleteChildCategorySchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateChildCategorySchema = {
  ...createChildCategory,
  ...detailAndDeleteChildCategorySchema,
};

export default {
  createChildCategory,
  detailAndDeleteChildCategorySchema,
  updateChildCategorySchema,
};
