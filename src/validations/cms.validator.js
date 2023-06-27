import Joi from 'joi';

const cmsSchema = {
  body: Joi.object({
    description: Joi.string().trim().min(3).label('Description')
      .required(),
  }),
};
const detailAndDeleteCmsSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateSubCategorySchema = {
  ...detailAndDeleteCmsSchema,
  ...cmsSchema,
};

export default {
  cmsSchema,
  detailAndDeleteCmsSchema,
  updateSubCategorySchema,
};
