/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
import { Op, Sequelize } from 'sequelize';
import xlsx from 'xlsx';
import Joi from 'joi';

import path from 'path';
import fs from 'fs';
import axios from 'axios';
import bucketServices from '../services/s3Bucket.service';
import models from '../models/index';
import config from '../config';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import productValidator from '../validations/product.validator';
import helper from '../helper/subQuery';
import utils from '../utils/index';
import addressRepository from './address.repository';
import notificationRepository from './notification.repository';
import emailTemplateService from '../services/emailTemplate.service';
import discountRepository from './discount.repository';
import bannerRepository from './banner.repository';
import orderRepository from './order.repository';

const fileFormats = ['mp4', 'mov', 'wmv', 'avi'];
const {
  Product,
  Brand,
  Category,
  ProductVariant,
  SubCategory,
  ChildCategory,
  ProductImage,
  ProductWishlist,
  User,
  GeneralSetting,
  ReviewRating,
  SellerProductVariant,
  ProductVariantAttribute,
  ProductDiscount,
  Discount,
  Cart,
  ProductView,
  Address,
  OrderProduct,
} = models;

export default {
  /**
   * Add Product
   * @param {object} req
   * @returns
   */
  async addProduct(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body, user } = req;
      const { productImages, imageFile, productVariant } = body;
      let productArray;
      let newWeight = 0;
      let productVariantArray;
      await mediaRepository.markMediaAsUsed(imageFile);
      body.productId = utils.getUniqueId(6);
      body.sellerId = user.id;
      if (body.unit === 'ounces') {
        newWeight = body.weight / 16;
      } else if (body.unit === 'gm') {
        newWeight = body.weight / 453.592;
      }
      const weightData = newWeight > 0 ? newWeight : body.weight;
      const shippingResult = await this.shippingCharges(weightData);
      const shippingCharges = shippingResult?.data?.shippingRates[0]?.rate ?? 0;
      const productData = await Product.create(
        { ...body, quantity: 0, shippingCharges },
        { transaction },
      );
      if (productImages && productImages.length > 0) {
        const { id } = productData;
        productArray = await Promise.all(
          productImages.map(async (ele) => {
            const extname = path.extname(ele.basePath);
            const fileFormat = extname.split('.').pop(); // file format
            return {
              productImage: ele.basePath,
              productId: id,
              fileType: fileFormats.includes(fileFormat.toLowerCase())
                ? 'video'
                : 'image',
            };
          }),
        );
      }
      if (productArray && productArray.length > 0) {
        await ProductImage.bulkCreate(productArray, { transaction });
      }
      if (productVariant && productVariant.length > 0) {
        const { id } = productData;
        productVariantArray = productVariant.map((item) => ({
          productId: id,
          productVariantId: item.productVariantId,
          productVariantAttributeId: item.productVariantAttributeId,
        }));
      }

      if (productVariantArray && productVariantArray.length > 0) {
        await SellerProductVariant.bulkCreate(productVariantArray, {
          transaction,
        });
      }
      notificationRepository.productNotification({
        productName: productData?.productName,
      });
      await transaction.commit();
      return productData;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Product add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Product Listing
   * @param {object} req
   * @returns
   */
  async getAllProduct(req) {
    try {
      const {
        user,
        query: {
          offset,
          name,
          sortBy,
          sortType,
          productStatus,
          status,
          productRequestStatus,
          categoryId,
          subCategoryId,
          childCategoryId,
          customerId,
          productDiscount,
          type,
          brandId,
          toPrice,
          fromPrice,
          customerLiked,
        },
        headers: { currencyCode },
      } = req;
      let {
        query: { limit },
      } = req;
      let where = { status: 'active' };
      let orderBy = [['created_at', 'DESC']];
      const scope = 'notDeletedProduct';
      const scopes = req.query.scope ? req.query.scope : scope;
      let duplicating = { separate: true };
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'brandName':
            orderBy = [[Product.associations.Brand, 'name', sortType]];
            break;
          case 'storeName':
            orderBy = [[Product.associations.Brand, 'store_name', sortType]];
            break;
          case 'sellerName':
            orderBy = [
              [
                Product.associations.Brand,
                Brand.associations.sellerDetails,
                'first_name',
                sortType,
              ],
            ];
            break;
          case 'categoryName':
            orderBy = [
              [Product.associations.categoryDetails, 'name', sortType],
            ];
            break;
          case 'subCategoryName':
            orderBy = [
              [Product.associations.subCategoryDetails, 'name', sortType],
            ];
            break;
          case 'childCategoryName':
            orderBy = [
              [Product.associations.childCategoryDetails, 'name', sortType],
            ];
            break;
          case 'variantName':
            orderBy = [
              [
                Product.associations.sellerProductVariantDetails,
                SellerProductVariant.associations.ProductVariant,
                'name',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'productImage':
            orderBy = [
              [Product.associations.productImage, 'product_image', sortType],
            ];
            break;
          case 'new':
            orderBy = [['id', sortType]];
            break;
          case 'customerReview':
            orderBy = [[Sequelize.col('overAllRating'), sortType], [Sequelize.col('ratingCount'), sortType]];
            break;
          case 'price':
            orderBy = [[Sequelize.col('priceSort'), sortType]];
            break;
          case 'popular':
            orderBy = [[helper.popularProduct(), sortType]];
            break;
          case 'inspired':
            orderBy = [[Sequelize.col('totalViewCount'), 'DESC']];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      const searchArray = [
        { productName: { [Op.like]: `%${name}%` } },
        { '$Brand.name$': { [Op.like]: `%${name}%` } },
        { '$categoryDetails.name$': { [Op.like]: `%${name}%` } },
        { status: { [Op.like]: `%${name}%` } },
        {
          id: {
            [Op.in]: helper.productSellerProductVariantLike(name),
          },
        },
      ];
      if (name) {
        if (productRequestStatus !== 'approve') {
          searchArray.push(
            Sequelize.where(
              Sequelize.fn(
                'CONCAT_WS',
                ' ',
                Sequelize.col('Brand.sellerDetails.first_name'),
                Sequelize.col('Brand.sellerDetails.last_name'),
              ),
              'LIKE',
              `%${name}%`,
            ),
          );
          searchArray.push({
            '$Brand.store_name$': { [Op.like]: `%${name}%` },
          });
        }
        where = {
          ...where,
          [Op.or]: searchArray,
        };
        // duplicating = { duplicating: false };
      }
      if (user?.userRole === 'seller') {
        where['$Brand.user_id$'] = user?.id;
        delete where.status;
      }
      if (productStatus && productStatus !== 'all') {
        where.productStatus = productStatus;
      }
      if (
        !productRequestStatus
        && (user?.userRole === 'admin' || user?.userRole === 'staff')
      ) {
        where.status = { [Op.in]: ['pending', 'rejected'] };
      }
      if (
        productRequestStatus
        && (user?.userRole === 'admin' || user?.userRole === 'staff')
      ) {
        where.status = ['active', 'inactive'];
      }
      if (status && status !== 'all') {
        where.status = status;
      }
      if (categoryId) {
        where['$categoryDetails.id$'] = categoryId;
      }
      if (subCategoryId) {
        where['$subCategoryDetails.id$'] = subCategoryId;
      }
      if (childCategoryId) {
        where['$childCategoryDetails.id$'] = childCategoryId;
      }
      if (brandId) {
        where['$Brand.id$'] = brandId;
      }
      if (productDiscount) {
        where.status = ['active', 'inactive'];
        where.id = {
          [Op.notIn]: helper.productDiscountAddId(),
        }; // Not include discount assign product
      }
      if (type === 'productDiscount') {
        where.status = ['active', 'inactive'];
        where.id = helper.productDiscountAddId(); // Discounted assign product
      }
      if (type === 'inspiredView') {
        limit = 5;
        // Inspired View product
        // orderBy = [[Sequelize.col('totalViewCount'), 'DESC']];
        //  orderBy = [[Sequelize.col('totalViewCount'), 'DESC']];
        // case 'price':
        //  console.log('here');
        if (!sortType && !sortBy) {
          orderBy = [[Sequelize.col('totalViewCount'), 'DESC']];
        }
        // if (sortType) {
        //   if (sortBy === 'price') {
        //     orderBy = [[Sequelize.col('priceSort'), sortType]];
        //   } else if (sortBy === 'customerReview') {
        //     orderBy = [[Sequelize.col('overAllRating'), 'DESC']];
        //   }
        // }

        where.id = [Sequelize.literal('(SELECT product_id FROM product_views WHERE status = \'active\' AND product_id = Product.id  GROUP BY product_id ORDER BY count(product_id) DESC )')];
      }
      if (type === 'inventory') {
        where.status = ['active', 'inactive']; // Inventory list in seller
      }

      if (toPrice && fromPrice) {
        where.id = { [Op.in]: [helper.productDiscountPrice(fromPrice, toPrice)] };

        // [Op.or]:  [ id:{ [Op.in]: [helper.productDiscountPrice(fromPrice, toPrice) ] },
        // { [Op.in]: [helper.productNonDiscountPrice(fromPrice, toPrice) ] }]
      }

      if (customerLiked) {
        const userId = customerId ?? user?.id ?? 0;
        where = {
          ...where,
          [Op.and]: [
            {
              id: {
                [Op.in]: Sequelize.literal(`(SELECT product_id FROM product_wishlists WHERE status = "active" AND user_id != ${userId} AND product_id = Product.id  GROUP BY product_id ORDER BY count(product_id) DESC )`),
              },
            },
          ],
        };
        // where.id = [Sequelize.literal('(SELECT product_id FROM product_wishlists WHERE status = \
        // 'active\' AND product_id = Product.id
        // GROUP BY product_id ORDER BY count(product_id) DESC )')];
      }
      const activeWhere = { status: 'active' };
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: currencyCode ?? 'INR',
      });
      const rate = currencyRate ? currencyRate?.rate : 0;
      const discountInclude = [
        {
          model: ProductDiscount,
          where: activeWhere,
          required: false,
          include: [
            {
              model: Discount,
              where: activeWhere,
              required: false,
            },
          ],
        },
      ];
      let searchCriteria = {
        order: orderBy,
        where,
        col: 'id',
        distinct: true,
        attributes: {
          include: [...helper.productAttributes(customerId ?? user?.id ?? 0, rate),
            helper.productPrice(),
          ],
        },
        include: [
          ...discountInclude,
          {
            association: 'categoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            association: 'subCategoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            model: ProductWishlist,
            where: activeWhere,
            ...duplicating,
            required: false,
          },
          {
            association: 'childCategoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            association: 'sellerProductVariantDetails',
            where: activeWhere,
            ...duplicating,
            required: false,
            include: [
              {
                model: ProductVariantAttribute,
                where: activeWhere,
                required: false,
              },
              {
                model: ProductVariant,
                where: activeWhere,
                required: false,
              },
            ],
          },
          {
            model: Brand,
            where: activeWhere,
            required: false,
            attributes: ['name', 'id', 'storeName'],
            include: [
              {
                association: 'sellerDetails',
                where: activeWhere,
                required: false,
                attributes: ['firstName', 'id', 'lastName'],
              },
            ],
          },
          {
            model: ProductImage,
            as: 'productImage',
            where: activeWhere,
            ...duplicating,
            required: false,
            attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
          },
        ],
      };
      // if (fromPrice) {
      //   searchCriteria = {
      //     ...searchCriteria,
      //     having: Sequelize.col('totalSold') >=
      // Sequelize.literal(`(${fromPrice} - shipping_charges)`),
      //     // where.price = { [Op.gte]: Sequelize.literal(`(${fromPrice} - shipping_charges)`) },
      //   };
      // }
      // if (toPrice) {
      //   where.price = { [Op.lte]: Sequelize.literal(`(${toPrice} - shipping_charges)`) };
      // }

      // where.price = {
      //   [Op.between]: [Sequelize.literal(`(${fromPrice} - shipping_charges)`),
      //     Sequelize.literal(`(${toPrice} - shipping_charges)`)],
      // };
      // }

      if (scopes === 'notDeletedProduct') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await Product.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`Product list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Product detail
   * @param {object} where
   * @returns
   */
  async findOne(where, customerId, productId, scopeData, currencyCode = 'INR') {
    try {
      const activeWhere = { status: 'active' };
      let currencyRate = null;
      if (currencyCode) {
        currencyRate = await addressRepository.exchangeCurrencyGet({
          name: currencyCode ?? 'INR',
        });
      }
      if (customerId) {
        await this.productView({ userId: customerId, productId });
      }
      const tokenData = await emailTemplateService.getShortLink(
        productId,
        'product',
      );
      return await Product.scope(scopeData).findOne({
        where,
        attributes: {
          include: helper.productAttributes(
            customerId ?? 0,
            currencyRate?.rate ?? 0,
            tokenData,
          ),
        },
        include: [
          {
            model: ProductDiscount,
            where: activeWhere,
            required: false,
            include: [
              {
                model: Discount,
                where: activeWhere,
                required: false,
              },
            ],
          },
          {
            model: ReviewRating,
            as: 'productReviewRating',
            required: false,
            where: activeWhere,
            include: [
              {
                model: User,
                required: false,
                where: activeWhere,
                attributes: [
                  'firstName',
                  'lastName',
                  'id',
                  'profilePictureUrl',
                  'profilePicture',
                ],
              },
            ],
          },
          {
            association: 'sellerProductVariantDetails',
            where: activeWhere,
            required: false,
            include: [
              {
                model: ProductVariantAttribute,
                where: activeWhere,
                required: false,
              },
              {
                model: ProductVariant,
                where: activeWhere,
                required: false,
                include: [
                  {
                    model: ProductVariantAttribute,
                    where: activeWhere,
                    required: false,
                    as: 'productVariantAttributeDetail',
                  },
                ],
              },
            ],
          },
          {
            model: ProductWishlist,
            where: activeWhere,
            required: false,
          },
          {
            model: Brand,
            where: activeWhere,
            required: false,
            attributes: ['name', 'id', 'storeName'],
            include: [
              {
                association: 'sellerDetails',
                where: activeWhere,
                required: false,
                attributes: ['firstName', 'id', 'lastName'],
              },
            ],
          },
          {
            association: 'categoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            association: 'subCategoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            association: 'childCategoryDetails',
            where: activeWhere,
            required: false,
          },
          {
            model: ProductImage,
            as: 'productImage',
            where: activeWhere,
            attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
            required: false,
          },
        ],
      });
    } catch (error) {
      loggers.error(`Product detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Product view customer
   * @param {object} where
   * @returns
   */
  async productView(where) {
    try {
      await ProductView.findOrCreate({ where });
    } catch (error) {
      loggers.error(`Product wish list details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Product detail
   * @param {object} where
   * @returns
   */
  async wishlistFindOne(where) {
    try {
      return await ProductWishlist.scope('notDeletedProductWishlist').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Product wish list details error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Product wishlist to cart
   * @param {object} req
   * @returns
   */

  async wishlistToCart(req) {
    try {
      const {
        user,
        params: { id },
      } = req;
      const cartData = { productId: id, userId: user.id, quantity: '1' };
      await Cart.create(cartData);
      return await ProductWishlist.destroy({
        where: { productId: id, userId: user.id, status: 'active' },
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Product request approve
   * @param {object} req
   * @returns
   */
  async productRequestApprove(req) {
    try {
      const {
        body,
        params: { id },
      } = req;
      return await Product.update(body, { where: { id } });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Update Product
   * @param {object} req
   * @returns
   */
  async updateProduct(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        body,
        params: { id },
        product,
      } = req;
      const { status } = product;
      const productName = body?.productName ?? product.productName;
      if (status === 'incomplete') {
        body.status = 'pending';
      }
      const { productVariant, productImages } = body;
      let productArray;
      let productVariantArray;
      if (status === 'rejected') {
        // Product re approval request
        body.status = 'pending';
      }
      // if (body.unit === 'ounces') {
      //   body.weight /= 16;
      // }
      let newWeight = 0;
      if (body.unit === 'ounces') {
        newWeight = body.weight / 16;
      } else if (body.unit === 'gm') {
        newWeight = body.weight / 453.592;
      }
      const weightData = newWeight > 0 ? newWeight : body.weight;
      const shippingResult = await this.shippingCharges(weightData);
      const shippingCharges = shippingResult?.data?.shippingRates[0]?.rate ?? 0;
      body.shippingCharges = shippingCharges;
      await Product.update(body, { where: { id } }, { transaction });
      if (productImages && productImages.length > 0) {
        await ProductImage.destroy(
          { where: { productId: id } },
          { transaction },
        );
        productArray = productImages.map((ele) => {
          const extname = path.extname(ele.basePath);
          const fileFormat = extname.split('.').pop(); // file format
          return {
            productImage: ele.basePath,
            productId: id,
            fileType: fileFormats.includes(fileFormat.toLowerCase())
              ? 'video'
              : 'image',
          };
        });
      }
      if (productArray && productArray.length > 0) {
        // await mediaRepository.findMediaByBasePathAndUnlink(productUpdateImage);
        // Media file used
        const productArrayUsed = productImages.map((ele) => ele.basePath);
        await mediaRepository.markMediaAsUsed(productArrayUsed);
        await ProductImage.bulkCreate(productArray, { transaction });
      }
      if (productVariant && productVariant.length > 0) {
        await SellerProductVariant.destroy(
          { where: { productId: id } },
          { transaction },
        );
        productVariantArray = productVariant.map((item) => ({
          productId: id,
          productVariantId: item.productVariantId,
          productVariantAttributeId: item.productVariantAttributeId,
        }));
      }

      if (productVariantArray && productVariantArray.length > 0) {
        await SellerProductVariant.bulkCreate(productVariantArray, {
          transaction,
        });
      }
      if (status === 'rejected' || status === 'incomplete') {
        // Product re approval request
        notificationRepository.productNotification({ productName });
      }

      await transaction.commit();
      return true;
    } catch (error) {
      transaction.rollback();
      loggers.error(
        `Product update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Add product to wishlist
   * @param {object} req
   * @returns
   */
  async addToWishlist(req) {
    try {
      const {
        user: { id },
        body,
        query: { type },
        params,
      } = req;
      const productData = params.id || body.productId;
      body.productId = productData;
      body.userId = id;
      if (type) {
        await Cart.update(
          { status: 'deleted' },
          { where: { productId: productData, userId: id, status: 'active' } },
        );
      }
      const data = await ProductWishlist.create(body);
      return data;
    } catch (error) {
      loggers.error(
        `Product wishlist error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Product details
   * @param {object} req
   * @returns
   */
  async productDetail(req) {
    try {
      const {
        product,
        query: { customerId },
        headers: { currencyCode },
      } = req;
      const productData = product.get();
      const userData = customerId || 0;
      product.dataValues.ratingData = await this.reviewRatingStarCount(
        productData?.id,
      );

      const where = {
        status: 'active',
        productId: {
          [Op.ne]: productData?.id,
        },
      };
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: currencyCode ?? 'INR',
      });

      const attributeInclude = {
        include: [
          ...helper.productAttributes(userData, currencyRate?.rate ?? 0),
          ...helper.reviewRating(),
        ],
      };
      const productInclude = [
        {
          model: ProductDiscount,
          where: { status: 'active' },
          required: false,
          include: [
            {
              model: Discount,
              where: { status: 'active' },
              required: false,
            },
          ],
        },
        {
          model: ProductImage,
          as: 'productImage',
          required: false,
          where: { status: 'active' },
        },
        {
          model: ReviewRating,
          as: 'productReviewRating',
          required: false,
          where: { status: 'active' },
          include: [
            {
              model: User,
              required: false,
              where: { status: { [Op.ne]: 'deleted' } },
              attributes: [
                'firstName',
                'lastName',
                'id',
                'profilePictureUrl',
                'profilePicture',
              ],
            },
          ],
        },
        {
          model: Brand,
          where: { status: 'active' },
          required: false,
          attributes: ['name', 'id', 'storeName'],
          include: [
            {
              association: 'sellerDetails',
              where: { status: 'active' },
              required: false,
              attributes: ['firstName', 'id', 'lastName'],
            },
          ],
        },
      ];
      if (customerId) {
        where.userId = { [Op.ne]: customerId };
      }
      const similarProduct = await Product.findAll({
        where: {
          childCategoryId: productData?.childCategoryId,
          status: 'active',
          id: { [Op.ne]: productData?.id },
        },
        attributes: attributeInclude,
        include: productInclude,
      });
      const frequentBuyProduct = await Product.findAll({
        where: {
          subCategoryId: productData?.subCategoryId,
          status: 'active',
          childCategoryId: { [Op.ne]: productData?.childCategoryId },
        },
        limit: 2,
        attributes: attributeInclude,
        include: productInclude,
      });
      const customerLikedProduct = await Product.findAll({
        where: { status: 'active' },
        attributes: attributeInclude,
        include: [
          {
            model: ProductWishlist,
            required: true,
            where,
          },
          ...productInclude,
        ],
      });
      const addressWhere = { status: 'active' };

      if (customerId) {
        addressWhere.userId = customerId;
        addressWhere.isDefault = true;
      }
      const address = await Address.findOne({
        where: addressWhere,
      });

      return {
        product,
        similarProduct,
        frequentBuyProduct,
        customerLikedProduct,
        address,
      };
    } catch (error) {
      loggers.error(
        `Product detail error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Add review Rating
   * @param {object} req
   * @returns
   */
  async addReviewRating(req) {
    try {
      const {
        body,
        user: { id },
      } = req;
      const data = {
        ...body,
        userId: id,
      };

      const {
        userId, productId, review, rating, orderId,
      } = data;
      const [reviewRating, created] = await ReviewRating.findOrCreate({
        where: { userId, productId, orderId },
        defaults: { review, rating },
      });
      if (created) {
        return reviewRating;
      }
      return await reviewRating.update(data);
    } catch (error) {
      loggers.error(
        `Add review rating error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * list/details wishlist
   * @param {object} req
   * @returns
   */
  async myWishlist(req) {
    try {
      const {
        query: { name, currencyCode },
        user: { id },
        headers,
      } = req;
      const where = { userId: id };
      let productWhere = { status: 'active' };
      if (name) {
        productWhere = {
          ...productWhere,
          [Op.or]: [
            { productName: { [Op.like]: `%${name}%` } },
            // { '$Product.Brand.name$': { [Op.like]: `%${name}%` } },
          ],
        };
      }
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: currencyCode ?? headers?.currencyCode ?? 'INR',
      });
      return ProductWishlist.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            col: 'id',
            where: productWhere,
            distinct: true,
            attributes: {
              include: [
                ...helper.productAttributes(id, currencyRate?.rate ?? 0),
                ...helper.reviewRating(),
              ],
            },
            required: true,
            include: [
              {
                model: ProductDiscount,
                where: { status: 'active' },
                required: false,
                include: [
                  {
                    model: Discount,
                    where: { status: 'active' },
                    required: false,
                  },
                ],
              },
              {
                model: ProductImage,
                as: 'productImage',
                required: false,
                where: { status: 'active' },
              },
              {
                model: ReviewRating,
                as: 'productReviewRating',
                required: false,
                where: { status: 'active' },
              },
              {
                model: Brand,
                required: false,
                where: { status: 'active' },
              },
            ],
          },
        ],
      });
    } catch (error) {
      loggers.error(
        `Product wishlist error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Get All rating Review
   * @param {object} req
   * @returns
   */
  async getAllReviewRating(req) {
    try {
      const {
        query: {
          limit, offset, productId, customerId, sellerId,
        },
        user: { userRole, id },
      } = req;
      const where = {};
      const scope = 'notDeletedReviewRating';
      const scopes = req?.query?.scope ? req?.query?.scope : scope;
      const orderBy = [['rating', 'DESC']];
      let searchCriteria = {
        where,
        order: orderBy,
        distinct: false,
      };

      // if (userRole === 'customer' || customerId) {
      //   where['$User.id$'] = customerId ?? id;
      // }
      // if (userRole === 'customer' && productId) {
      //   where = {};
      // }
      // if (userRole === 'seller' || sellerId) {
      //   where['$Product.seller_id$'] = sellerId ?? id;
      // }
      // if (productId) {
      //   where['$Product.id$'] = productId;
      // }

      if (userRole === 'customer') {
        if (customerId) {
          where['$User.id$'] = customerId ?? id;
        }
        if (productId) {
          where['$Product.id$'] = productId;
        }
      }

      if (userRole === 'seller') {
        if (customerId) {
          where['$Product.seller_id$'] = sellerId ?? id;
        }
        if (productId) {
          where['$Product.id$'] = productId;
        }
      }

      if (productId) {
        where['$Product.id$'] = productId;
      }
      const activeWhere = { status: { [Op.ne]: 'deleted' } };
      const userInclude = [
        {
          model: User,
          where: activeWhere,
          attributes: [
            'firstName',
            'lastName',
            'profilePicture',
            'profilePictureUrl',
          ],
          required: false,
        },
        {
          model: Product,
          where: activeWhere,
          required: false,
          include: [
            {
              model: ProductImage,
              as: 'productImage',
              separate: true,
              required: false,
              where: activeWhere,
            },
          ],
        },
      ];
      if (scopes === 'notDeletedReviewRating') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          col: 'id',
          distinct: true,
          include: userInclude,
        };
      }
      const result = await ReviewRating.scope(scopes).findAndCountAll(
        searchCriteria,
      );
      if (scopes === 'notDeletedReviewRating') {
        const data = await ReviewRating.findOne({
          where,
          attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'totalRating'],
          ],
          includeIgnoreAttributes: false,
          raw: true,
          include: userInclude,
        });
        result.avgRating = Math.round(data?.totalRating) ?? 0.0;
      }
      return result;
    } catch (error) {
      loggers.error(
        `Review rating list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Update Product Request Status
   * @param {object} req
   * @returns
   */
  async updateProductRequestStatus(req) {
    try {
      const { body, product } = req;
      const { status } = product;
      if (status === body.productRequestStatus) {
        return false;
      }
      body.status = body.productRequestStatus;
      return await product.update(body);
    } catch (error) {
      loggers.error(
        `Product Request Status update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Global listing
   * @param {} req
   * @returns
   */

  async getGlobal(req) {
    try {
      const {
        query: { search },
      } = req;
      let whereProduct = {};
      let whereCommonSearch = {};
      const limit = 3;
      if (search) {
        whereProduct = {
          [Op.or]: [{ productName: { [Op.like]: `%${search}%` } }],
        };
        whereCommonSearch = {
          [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
        };
      }
      const product = await Product.scope('activeProduct').findAll({
        attributes: [
          'id',
          ['product_name', 'name'],
          [Sequelize.literal('IFNULL(null, "product")'), 'type'],
        ],
        where: whereProduct,
        include: {
          model: ProductImage.scope('notDeletedProductImage'),
          as: 'productImage',
          where: { fileType: 'image' },
          required: false,
          limit: 1,
          attributes: ['productImage', 'id', 'productImageUrl', 'fileType'],
        },
        limit,
      });
      const category = await Category.scope('activeCategory').findAll({
        attributes: [
          'id',
          'name',
          'categoryImage',
          'categoryImageUrl',
          [Sequelize.literal('IFNULL(null, "category")'), 'type'],
        ],
        where: whereCommonSearch,
        limit,
      });
      const subCategory = await SubCategory.scope('activeSubCategory').findAll({
        attributes: [
          'id',
          'name',
          'subCategoryImageUrl',
          'subCategoryImage',
          [Sequelize.literal('IFNULL(null, "subCategory")'), 'type'],
        ],
        where: whereCommonSearch,
        limit,
      });
      const childCategory = await ChildCategory.scope(
        'activeChildCategory',
      ).findAll({
        attributes: [
          'id',
          'name',
          'childCategoryImage',
          'childCategoryImageUrl',
          [Sequelize.literal('IFNULL(null, "childCategory")'), 'type'],
        ],
        where: whereCommonSearch,
        limit,
      });

      const brand = await Brand.scope('notDeletedBrand').findAll({
        attributes: [
          'id',
          'name',
          'brandImage',
          'brandImageUrl',
          [Sequelize.literal('IFNULL(null, "brand")'), 'type'],
        ],
        where: whereCommonSearch,
        limit,
      });
      return [
        ...category,
        ...subCategory,
        ...childCategory,
        ...product,
        ...brand,
      ];
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Remove Product from wishlist
   * @param {object} req
   * @returns
   */
  async removeWishlistProduct(req) {
    try {
      const {
        params: { id },
        user,
      } = req;
      return ProductWishlist.destroy({
        where: { productId: id, userId: user.id },
      });
    } catch (error) {
      loggers.error(
        `Product wishlist error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Product Status update
   * @param {Object} req
   * @returns
   */
  async updateProductStatus(req) {
    try {
      const { body, product } = req;
      return await product.update(body);
    } catch (error) {
      loggers.error(
        `Product Status update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Product Upload
   * @param {Object} req
   */
  async uploadProduct(req) {
    try {
      const { body, user } = req;
      const { app: { mediaStorage } } = config;

      body.sellerId = user.id;
      const { basePath } = body;
      let errorValue = [];
      let success = true;
      let message = 'ALL_PRODUCT_UPLOADED';
      let newProductValue = false;
      const extName = path.extname(basePath);
      body.fileName = path.basename(basePath, extName);
      const unCreated = [];
      let workbook;
      if (mediaStorage === 's3') {
        const result = await bucketServices.getExcelData(basePath);
        workbook = xlsx.read(result?.Body, { cellDates: true });
      } else {
        workbook = xlsx.readFile(basePath, { cellDates: true });
      }

      const sheetNames = workbook.SheetNames;
      let subCategoryData;
      let emailCheck = false;
      let childCategoryData;
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);
      await mediaRepository.markMediaAsUsed([basePath]);
      const productData = data.map(async (element) => {
        const excelData = {
          product_name: element?.product_name ?? null,
          price: element?.price ?? null,
          category: element?.category ?? null,
          sub_category: element?.sub_category ?? null,
          child_category: element?.child_category ?? null,
          overview: element?.overview ?? null,
          specification: element?.specification ?? null,
          variant: element?.variant ?? null,
          attribute: element?.attribute ?? null,
        };
        const productSchema = Joi.object()
          .options({ abortEarly: false })
          .keys(productValidator.productData);
        const validate = productSchema.validate(element);
        if (!validate.error) {
          const brand = await Brand.findOne({
            where: { userId: user.id, status: 'active' },
          });
          const bodyData = {
            ...element,
            status: 'incomplete',
            brandId: brand?.id,
            sellerId: user?.id,
            quantity: 0,
            productId: utils.getUniqueId(6),
          };
          bodyData.productName = element.product_name;
          const categoryData = await Category.findOne({
            where: { name: element.category, status: 'active' },
            raw: true,
          });
          if (categoryData) {
            bodyData.categoryId = categoryData.id;
            subCategoryData = await SubCategory.findOne({
              where: {
                categoryId: categoryData.id,
                name: element.sub_category,
                status: 'active',
              },
            });
            if (subCategoryData) {
              bodyData.subCategoryId = subCategoryData.id;
              childCategoryData = await ChildCategory.findOne({
                where: {
                  name: element.child_category,
                  categoryId: categoryData.id,
                  subCategoryId: subCategoryData.dataValues.id,
                  status: 'active',
                },
              });
              if (childCategoryData) {
                bodyData.childCategoryId = childCategoryData.id;
              } else {
                emailCheck = true;
                excelData.errors = utils.getMessage(
                  req,
                  false,
                  'CHILD_CATEGORY_NOT_EXIST',
                );
                unCreated.push(excelData);
              }
            } else {
              emailCheck = true;
              excelData.errors = utils.getMessage(
                req,
                false,
                'SUB_CATEGORY_NOT_EXIST',
              );
              unCreated.push(excelData);
            }
          } else {
            emailCheck = true;
            excelData.errors = utils.getMessage(
              req,
              false,
              'CATEGORY_NOT_EXIST',
            );
            unCreated.push(excelData);
          }
          if (categoryData && subCategoryData && childCategoryData) {
            if (element.variant && element.attribute) {
              const variant = await ProductVariant.findOne({
                where: { name: element.variant, status: 'active' },
                raw: true,
              });
              if (variant) {
                const attributes = await ProductVariantAttribute.findOne({
                  where: {
                    productVariantId: variant.id,
                    attributeNames: element.attribute,
                    status: 'active',
                  },
                });

                if (attributes) {
                  const product = await Product.findOne({
                    where: {
                      productName: bodyData.productName,
                      status: { [Op.notIn]: ['deleted', 'rejected'] },
                    },
                    include: [
                      {
                        model: SellerProductVariant,
                        as: 'sellerProductVariantDetails',
                        required: true,
                        where: {
                          status: 'active',
                          productVariantId: variant.id,
                          productVariantAttributeId: attributes.id,
                        },
                      },
                    ],
                  });
                  if (!product) {
                    const newProduct = await Product.create(bodyData);
                    newProductValue = true;
                    if (newProduct) {
                      const variantData = {
                        productId: newProduct.id,
                        productVariantId: variant.id,
                        productVariantAttributeId: attributes.id,
                      };
                      await SellerProductVariant.create(variantData);
                      notificationRepository.productNotification({
                        productName: bodyData?.productName,
                      });
                    }
                  } else {
                    emailCheck = true;
                    excelData.errors = utils.getMessage(
                      req,
                      false,
                      'PRODUCT_ALREADY_EXIST',
                    );
                    unCreated.push(excelData);
                  }
                } else {
                  emailCheck = true;
                  excelData.errors = utils.getMessage(
                    req,
                    false,
                    'PRODUCT_ATTRIBUTE_NOT_EXIST',
                  );
                  unCreated.push(excelData);
                }
              } else {
                emailCheck = true;
                excelData.errors = utils.getMessage(
                  req,
                  false,
                  'PRODUCT_VARIANT_NOT_EXIST',
                );
                unCreated.push(excelData);
              }
            } else {
              await Product.create(bodyData);
              newProductValue = true;
            }
          }
        } else {
          emailCheck = true;
          validate.error.details.forEach(async (errorData) => {
            errorValue.push(errorData.message);
          });
          const errorFields = errorValue.join(',');
          excelData.errors = errorFields;

          unCreated.push(excelData);
          errorValue = [];
        }
      });
      await Promise.all(productData);
      const invalid = `${__dirname}/../../public/uploads/product/invalid`;
      if (!fs.existsSync(invalid)) {
        fs.mkdirSync(invalid, { recursive: true });
      }
      const ws = xlsx.utils.json_to_sheet(unCreated);
      ws['!cols'] = [
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 30 },
        { width: 30 },
        { width: 30 },
        { width: 30 },
        { width: 90 },
      ];
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'invalid');

      if (mediaStorage === 's3') {
        const fileData = xlsx.write(wb, {
          type: 'buffer',
          bookType: 'xlsx',
          bookSST: false,
        });
        const excelPath = `public/uploads/product/invalid/${body.fileName}.xlsx`;
        await bucketServices.UploadExcel(fileData, excelPath);
      } else {
        const fileDir = path.join(
          __dirname,
          `../../public/uploads/product/invalid/${body.fileName}.xlsx`,
        );
        xlsx.writeFile(wb, fileDir);
      }

      if (emailCheck) {
        message = 'SOME_PRODUCT_ADDED';
        emailTemplateService.uploadProductEmail({
          email: user.email,
          downloadFile: body.fileName,
          userName: user.firstName,
          ...user,
        });
      }
      if (!newProductValue) {
        message = 'NO_PRODUCT_ADDED';
        success = false;
      }

      return { message, success };
    } catch (error) {
      loggers.error(`Product Upload error: ${error},user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Return sample FIle for
   * @returns
   */
  async getSampleFile(req) {
    try {
      return path.join(
        `${config.app.baseUrl}/public/sample/product/product_sample.csv`,
      );
    } catch (error) {
      loggers.error(
        `Product Upload sample file error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * get product count
   * @returns
   */
  async getProductCount(req) {
    const {
      user: { userRole, id },
    } = req;
    try {
      if (userRole === 'seller') {
        return await Product.scope('notDeletedProduct').count({
          where: { seller_id: id, status: { [Op.in]: ['active', 'inactive'] } },
        });
      }
      return await Product.scope('notDeletedProduct').count({
        where: { status: { [Op.in]: ['active', 'inactive'] } },
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get Top selling product and category
   * @param {Object} req
   *
   */
  async getProductCategoryChart(req) {
    try {
      const {
        query,
        user: { userRole, id },
      } = req;
      const { year } = query;
      if (!year) query.year = utils.currentYear();
      let where = {};
      where = {
        ...where,
        [Op.and]: Sequelize.where(
          Sequelize.fn('YEAR', Sequelize.col('OrderProduct.created_at')),
          query.year,
        ),
      };

      if (userRole === 'seller') {
        where.seller_id = id;
      }
      const searchCriteria = {
        where,
        group: 'category_id',
        attributes: [
          [
            Sequelize.fn('COUNT', Sequelize.col('category_id')),
            'categoryCount',
          ],
          [Sequelize.fn('MAX', Sequelize.col('name')), 'categoryName'],
        ],
        raw: true,
        includeIgnoreAttributes: false,
        include: [
          {
            model: Product,
            include: [
              {
                model: Category,
                as: 'categoryDetails',
              },
            ],
          },
        ],
      };
      const searchCriteriaProduct = {
        where,
        group: 'OrderProduct.product_id',
        raw: true,
        includeIgnoreAttributes: false,
        attributes: [
          [
            Sequelize.fn('count', Sequelize.col('OrderProduct.product_id')),
            'productCount',
          ],
          [Sequelize.fn('MAX', Sequelize.col('product_name')), 'productName'],
        ],
        include: [
          {
            model: Product,
            required: false,
          },
        ],
        limit: 5,
        order: [[Sequelize.literal('productCount'), 'DESC']],
      };
      const result = await OrderProduct.scope('notDeletedOrder').findAll(
        searchCriteriaProduct,
      );
      const category = await OrderProduct.scope('notDeletedOrder').findAll(
        searchCriteria,
      );
      return [{ category, product: result }];
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * get product view count
   * @returns
   */
  async viewProductCount(req) {
    try {
      const {
        user: { id },
      } = req;
      return await ProductView.count({
        include: [
          {
            model: Product,
            where: { seller_id: id },
            required: true,
          },
        ],
        col: 'Product_id',
      });
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Customer also liked product
   * @returns
   */
  async customerLiked(req) {
    try {
      const {
        query: { customerId },
        headers: { currencyCode },
        user,
      } = req;
      const userData = user?.id || customerId || 0;
      const where = {
        status: 'active',
      };
      if (customerId) {
        where.userId = { [Op.ne]: customerId };
      }
      const currencyRate = await addressRepository.exchangeCurrencyGet({
        name: currencyCode ?? 'INR',
      });

      return Product.findAll({
        where: { status: 'active' },
        attributes: {
          include: [
            ...helper.productAttributes(userData, currencyRate?.rate ?? 0),
            ...helper.reviewRating(),
          ],
        },
        include: [
          {
            model: ProductWishlist,
            required: true,
            where: { status: 'active' },
          },
          {
            model: ProductDiscount,
            where: { status: 'active' },
            required: false,
            include: [
              {
                model: Discount,
                where: { status: 'active' },
                required: false,
              },
            ],
          },
          {
            model: ProductImage,
            as: 'productImage',
            order: [['createdAt', 'ASC']],
            required: false,
            where: { status: 'active' },
          },
          {
            model: ReviewRating,
            as: 'productReviewRating',
            required: false,
            where: { status: 'active' },
          },
          {
            model: Brand,
            where: { status: 'active' },
            required: false,
            attributes: ['name', 'id', 'storeName'],
            include: [
              {
                association: 'sellerDetails',
                where: { status: 'active' },
                required: false,
                attributes: ['firstName', 'id', 'lastName'],
              },
            ],
          },
        ],
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Product status update in stock, low inventory, out of stock
   * @returns
   */
  async updateCurrentProductStatus() {
    try {
      // Set in Stock
      const generalSetting = await GeneralSetting.findOne({
        where: { key: 'minimum_quantity_product' },
      });
      if (generalSetting) {
        const quantity = parseInt(generalSetting?.value, 10) ?? 0;
        const productCount = await Product.scope('approvedProduct').count();
        if (productCount > 0) {
          await Product.scope('approvedProduct').update(
            { productStatus: 'inStock' },
            {
              where: {
                quantity: { [Op.gt]: quantity },
                productStatus: ['lowInventory', 'outOfStock'],
              },
            },
          );
          // Set low Inventory
          await Product.scope('approvedProduct').update(
            { productStatus: 'lowInventory' },
            { where: { quantity: { [Op.between]: [1, quantity] } } },
          );
          // Set out Of Stock
          await Product.scope('approvedProduct').update(
            { productStatus: 'outOfStock' },
            { where: { quantity: 0 } },
          );
        }
      }

      return true;
    } catch (error) {
      loggers.error(`Product status update error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Home screen list
   * @param {object} req
   */
  async customerHomeScreen(req) {
    try {
      const {
        user: { id, creditPoints },
      } = req;

      const topOffer = await discountRepository.getAllDiscount(req);
      delete req.query.sortBy;
      delete req.query.sortType;
      req.query.dealsOfTheDay = 'dealsOfTheDay';
      const topOfDeal = await discountRepository.getAllDiscount(req);
      const inspiredView = await this.getAllProduct(req);
      const banner = await bannerRepository.getAllBanner(req);
      const bestSellingProduct = await orderRepository.bestSellingProduct(req);
      const notificationCount = await notificationRepository.unreadCountNotification(req);
      const cartData = await Cart.scope('notDeletedCart').sum('quantity', {
        where: { userId: id },
      });
      return {
        creditPoints: creditPoints ?? 0,
        notificationUnreadCount: notificationCount?.unreadCount ?? 0,
        cartCount: cartData ?? 0,
        topOfDeal: topOfDeal?.rows,
        topOffer: topOffer?.rows,
        bestSellingProduct,
        inspiredView: inspiredView?.rows,
        banner: banner?.rows,
      };
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Update product shipping charges
   * @returns
   */
  async updateShippingCharges() {
    try {
      const {
        shippingApiKey: {
          username,
          password,
          asendiaKey,
          accountNumber,
          shippingChargeUrl,
        },
      } = config;

      let newWeight = 0;
      const allProduct = await Product.scope('activeProduct').findAll();
      await Promise.all(
        allProduct.map(async (element) => {
          if (element.unit === 'ounces') {
            newWeight = element.weight / 16;
          }
          const weightData = newWeight > 0 ? newWeight : element.weight;
          const code = weightData > 4 ? 'ePAQ' : 'A112';
          const shippingResult = await axios.get(shippingChargeUrl, {
            params: {
              accountNumber,
              processingLocation: 'LAX',
              recipientPostalCode: '450001',
              recipientCountryCode: 'IN',
              weightUnit: 'Lb',
              productCode: code,
              totalPackageWeight: weightData,
            },
            headers: { 'X-AsendiaOne-ApiKey': asendiaKey },
            auth: {
              username,
              password,
            },
          });
          const shippingCharges = shippingResult?.data?.shippingRates[0]?.rate ?? 0;
          await Product.update(
            { shippingCharges },
            { where: { id: element.id } },
          );
        }),
      );
    } catch (error) {
      loggers.error(`Shipping  charges error: ${error}`);
      return error;
      // throw Error(error);
    }
  },

  /**
   * Get shipping charge by third party api
   * @returns
   */
  async shippingCharges(weight) {
    try {
      const {
        shippingApiKey: {
          username,
          password,
          asendiaKey,
          accountNumber,
          shippingChargeUrl,
        },
      } = config;
      const code = weight > 4 ? 'ePAQ' : 'A112';
      return await axios.get(shippingChargeUrl, {
        params: {
          accountNumber,
          processingLocation: 'LAX',
          recipientPostalCode: '450001',
          recipientCountryCode: 'IN',
          weightUnit: 'Lb',
          productCode: code,
          totalPackageWeight: weight,
        },
        headers: { 'X-AsendiaOne-ApiKey': asendiaKey },
        auth: {
          username,
          password,
        },
      });
    } catch (error) {
      loggers.error(`Shipping  charges error: ${error}`);
      return error;
      // throw Error(error);
    }
  },

  /**
   * Get review rating 5, 4, 3, 2, 1
   */
  async reviewRatingStarCount(productId) {
    try {
      return await ReviewRating.findOne({
        where: { productId },
        attributes: helper.reviewRatingStarCount(productId),
        raw: true,
      });
    } catch (error) {
      loggers.error(`Review rating star count error: ${error}`);
      throw Error(error);
    }
  },
};
