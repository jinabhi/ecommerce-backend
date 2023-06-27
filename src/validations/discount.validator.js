import Joi from 'joi';
// import utility from '../utils';

// const date = utility.getDateYearMonthDateMintHour();

const createDiscountSchema = {
  body: Joi.object({
    discountPercent: Joi.number().integer().greater(0).max(100)
      .required(),
    categoryId: Joi.number().integer().greater(0)
      .required(),
    subCategoryId: Joi.number().integer().greater(0)
      .required(),
    childCategoryId: Joi.number().integer().greater(0)
      .required(),
    userId: Joi.number().integer().greater(0)
      .required(),
    startDate: Joi.date().label('Start date')
      // .min(date)
      .required(),
    endDate: Joi.date().label('End Date')
      // .min(date)
      // .greater(Joi.ref('startTime'))
      .required(),
    productIds: Joi.array().items(Joi.number().integer().greater(0).required()).required(),
  }),
};

const detailAndDeleteSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateDiscountSchema = {
  ...detailAndDeleteSchema,
  ...createDiscountSchema,
};

const status = {
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};
const statusUpdateSchema = {
  ...detailAndDeleteSchema,
  ...status,
};

const productDiscountStatusUpdateSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
    productId: Joi.number().integer().greater(0).required(),
  }),
  ...status,
};

export default {
  createDiscountSchema,
  updateDiscountSchema,
  statusUpdateSchema,
  detailAndDeleteSchema,
  productDiscountStatusUpdateSchema,
};
