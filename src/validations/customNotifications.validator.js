import Joi from 'joi';

const createCustomNotificationSchema = {
  body: Joi.object({
    userType: Joi.string().valid('all', 'seller', 'customer').label('User Type')
      .required(),
    title: Joi.string().trim().min(3).label('Notification Title')
      .required(),
    description: Joi.string().trim().label('Description').required(),
  }),
};
const detailAndDeleteCustomNotificationSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateCustomNotificationSchema = {
  ...detailAndDeleteCustomNotificationSchema,
  ...createCustomNotificationSchema,
};

export default {
  createCustomNotificationSchema,
  detailAndDeleteCustomNotificationSchema,
  updateCustomNotificationSchema,
};
