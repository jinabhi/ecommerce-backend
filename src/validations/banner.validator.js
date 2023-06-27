import Joi from 'joi';

const createBannerSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(50)
      .label('Title')
      .required(),
    bannerImage: Joi.string().trim().min(3).label('Banner Image')
      .required(),
    description: Joi.string().trim().min(3).max(100)
      .required(),
  }),
};

const detailAndDeleteBannerSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const bannerStatusUpdateSchema = {
  ...detailAndDeleteBannerSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};

export default {
  createBannerSchema,
  detailAndDeleteBannerSchema,
  bannerStatusUpdateSchema,
};
