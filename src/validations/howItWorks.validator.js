import Joi from 'joi';

const createHowItWorksSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(2).label('Title')
      .required(),
    description: Joi.string().trim().min(3).required(),
    cmsId: Joi.number().integer().greater(0).required(),
  }),
};

const detailAndDeleteHowItWorksSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateHowItWorksSchema = {
  ...createHowItWorksSchema,
  ...detailAndDeleteHowItWorksSchema,
};
export default {
  createHowItWorksSchema,
  detailAndDeleteHowItWorksSchema,
  updateHowItWorksSchema,
};
