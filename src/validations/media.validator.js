import Joi from 'joi';

const uploadSchema = {
  body: Joi.object().keys({
    mediaType: Joi.string()
      .trim()
      .valid('image', 'icon', 'audio', 'video', 'presentations', 'upload')
      .required(),
    mediaFor: Joi.string()
      .trim()
      .valid(
        'user',
        'product',
        'csv',
        'category',
        'subCategory',
        'childCategory',
        'brandLogo',
        'damageProductImage',
        'banner',
      )
      .required(),
    apiName: Joi.string().optional().empty().allow(''),
  }),
};

const uploadMediaSchema = {
  body: Joi.object().keys({
    mediaFor: Joi.string().valid('user'),
    apiName: Joi.string().optional().empty().allow(''),
  }),
};

export default {
  uploadSchema,
  uploadMediaSchema,
};
