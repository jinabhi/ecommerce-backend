import Joi from 'joi';

const createProductVariantSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(50)
      .label('Attribute Name')
      .required(),
    attributeNames: Joi.array().items(Joi.string().min(1).max(50).label('Attribute names')
      .required()).label('Attribute names').required(),
  }),
};

const detailAndDeleteSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateProductVariantSchema = {
  ...detailAndDeleteSchema,
  ...createProductVariantSchema,
};

const statusUpdateSchema = {
  ...detailAndDeleteSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};

export default {
  createProductVariantSchema,
  updateProductVariantSchema,
  statusUpdateSchema,
  detailAndDeleteSchema,
};
