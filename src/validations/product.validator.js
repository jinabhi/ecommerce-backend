import Joi from 'joi';

const productData = {
  product_name: Joi.string().trim().min(3).label('Product Name')
    .required(),
  price: Joi.number().integer().label('Price').greater(0)
    .required(),
  category: Joi.string().label('Category').required(),
  sub_category: Joi.string().label('Sub Category').required(),
  child_category: Joi.string().label('Child Category').required(),
  overview: Joi.string().trim().min(1).label('Overview')
    .required(),
  specification: Joi.string().trim().min(1).label('Specification')
    .required(),
  variant: Joi.string().trim().min(1).label('Product Variant')
    .optional()
    .allow(null),
  attribute: Joi.string().trim().min(1).label('Product Variant Attributes')
    .optional()
    .allow(null),
};

const detailAndDeleteProductSchema = {
  params: Joi.object().keys({
    id: Joi.alternatives().try(
      Joi.number().integer().greater(0).required(),
      Joi.string().trim().min(1)
        .required(),
    ),
  }),
};

const createProductSchema = {
  body: Joi.object({
    productName: Joi.string().trim().min(1).max(100)
      .label('Product Name')
      .required(),
    price: Joi.number().integer().greater(0).required(),
    quantity: Joi.number().integer().optional().allow(null)
      .allow(''),
    brandId: Joi.number().integer().greater(0).required(),
    categoryId: Joi.number().integer().greater(0).required(),
    subCategoryId: Joi.number().integer().greater(0).required(),
    childCategoryId: Joi.number().integer().greater(0).required(),
    overview: Joi.string().trim().min(1)
      .required(),
    unit: Joi.string().valid('lb', 'ounces', 'gm').required().required(),
    weight: Joi.number().positive().label('Product Weight')
      .required(),
    specification: Joi.string().trim().min(1)
      .required(),
    productVariant: Joi.array().items(
      Joi.object().keys({
        productVariantAttributeId: Joi.number().integer().greater(-1).optional()
          .allow(null)
          .allow(''),
        productVariantId: Joi.number().integer().greater(-1).optional()
          .allow(null)
          .allow(''),
      }),
    ),
    productImages: Joi.array()
      .items(
        Joi.object().keys({
          basePath: Joi.string().required(),
        }),
      )
      .required(),
  }),
};

const productRequestStatusSchema = {
  ...detailAndDeleteProductSchema,
  body: Joi.object({
    productRequestStatus: Joi.string().valid('approve', 'rejected').required(),
  }),
};
const reviewRating = {
  review: Joi.string().trim().label('Review').min(2)
    .max(200)
    .optional(),
  rating: Joi.number().min(0).max(5).required(),
  productId: Joi.number().integer().greater(0).required(),
  orderId: Joi.number().integer().greater(0).required(),
};

const createProductReviewRating = {
  body: Joi.object(reviewRating),
};

const createSellerReviewRating = {
  body: Joi.object({
    ...reviewRating,
    sellerId: Joi.number().integer().greater(0).required(),
  }),
};

const createProductRequestReject = {
  ...detailAndDeleteProductSchema,
  body: Joi.object({
    rejectMessage: Joi.string().trim().min(2).required(),
  }),
};

const wishlistProductSchema = {
  body: Joi.object().keys({
    productId: Joi.number().integer().greater(0).required(),
  }),
};

const wishlistToCartSchema = {
  params: Joi.object().keys({
    id: Joi.number().integer().greater(0).required(),
  }),
};

const updateProductSchema = {
  ...createProductSchema,
  ...detailAndDeleteProductSchema,
};

const productStatusUpdateSchema = {
  ...detailAndDeleteProductSchema,
  body: Joi.object({
    status: Joi.string().valid('active', 'inactive').required(),
  }),
};

export default {
  productData,
  createProductSchema,
  detailAndDeleteProductSchema,
  updateProductSchema,
  wishlistProductSchema,
  createProductReviewRating,
  productStatusUpdateSchema,
  productRequestStatusSchema,
  createSellerReviewRating,
  wishlistToCartSchema,
  createProductRequestReject,
};
