import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils/index';
import helper from '../helper/subQuery';

const { ProductVariant, ProductVariantAttribute } = models;
export default {
  /**
   * Add ProductVariant
   * @param {object} req
   * @returns
   */
  async addProductVariant(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body } = req;
      let productVariantArr;
      const { attributeNames } = body;
      const data = await ProductVariant.create(body, { transaction });
      const { id } = data;

      if (attributeNames && attributeNames.length > 0) {
        productVariantArr = attributeNames.map((ele) => ({
          attributeNames: ele,
          productVariantId: id,
        }));
      }
      if (productVariantArr && productVariantArr.length > 0) {
        await ProductVariantAttribute.bulkCreate(productVariantArr, {
          transaction,
        });
        await transaction.commit();
      }
      return data;
    } catch (error) {
      await transaction.rollback();
      loggers.error(
        `Product variant add error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * ProductVariant list
   * @param {object} req
   * @returns
   */
  async getAllProductVariant(req) {
    try {
      const {
        query: {
          limit,
          offset,
          name,
          sortBy,
          fromDate,
          toDate,
          sortType,
          scope,
        },
      } = req;
      let where = {};

      const startDate = utility.getStartDateFormater(fromDate);
      const endDate = utility.getEndDateFormater(toDate);
      const deletedScope = 'notDeletedProductVariant';
      const scopes = scope || deletedScope;
      let duplicating = { separate: true };
      let orderBy = [['created_at', 'DESC']];
      let includeOrder = [['created_at', 'DESC']];
      if (name) {
        where = {
          ...where,
          [Op.or]: [
            { name: { [Op.like]: `%${name}%` } },
            {
              '$productVariantAttributeDetail.attribute_names$': {
                [Op.like]: `%${name}%`,
              },
            },
            {
              id: {
                [Op.in]: helper.productVariantLike(name),
              },
            },
          ],
        };
        duplicating = { duplicating: false };
      }
      if (fromDate) {
        where.createdAt = { [Op.gte]: startDate };
      }
      if (toDate) {
        where.createdAt = { [Op.lte]: endDate };
      }
      if (fromDate && toDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }
      let searchCriteria = {};
      if (sortBy === 'attributeNames') {
        includeOrder = [['attribute_names', sortType]];
        orderBy = [['name', sortType]];
      } else if (sortBy === 'totalProduct') {
        orderBy = [[Sequelize.col('totalProduct'), sortType]];
        includeOrder = '';
      } else {
        includeOrder = '';
        if (sortBy && sortType) orderBy = [[sortBy, sortType]];
      }
      searchCriteria = {
        order: orderBy,
        where,
        include: [
          {
            model: ProductVariantAttribute,
            as: 'productVariantAttributeDetail',
            order: includeOrder,
            where: { status: 'active' },
            required: false,
            ...duplicating,
            attributes: ['id', 'attributeNames', 'productVariantId',
              // helper.productAssignVariantAttribute()
            ],
          },
        ],
      };
      if (scopes === 'notDeletedProductVariant') {
        searchCriteria = {
          ...searchCriteria,
          col: 'id',
          distinct: true,
          attributes: {
            include: helper.totalProductVariantAttribute(),
          },
        };
      }
      return await ProductVariant.scope(scopes).findAndCountAll({
        ...searchCriteria,
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
      });
    } catch (error) {
      loggers.error(
        `Product variant list error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * ProductVariant detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await ProductVariant.scope('notDeletedProductVariant').findOne({
        where,
        include: [
          {
            model: ProductVariantAttribute,
            as: 'productVariantAttributeDetail',
            required: false,
            duplicating: false,
            attributes: ['attributeNames', 'productVariantId', 'id'],
          },
        ],
      });
    } catch (error) {
      loggers.error(`Product variant details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update, delete and status update ProductVariant
   * @param {object} req
   * @returns
   */
  async updateProductVariant(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const {
        body,
        params: { id },
      } = req;
      const { attributeNames } = body;
      await ProductVariant.update(body, { where: { id } }, { transaction });
      if (attributeNames && attributeNames.length > 0) {
        await Promise.all(
          attributeNames.map(
            async (ele) => {
              await ProductVariantAttribute.findOrCreate({
                where: { attributeNames: ele, productVariantId: id },
              });
            },
            { transaction },
          ),
        );

        await ProductVariantAttribute.destroy(
          {
            where: {
              productVariantId: id,
              attributeNames: { [Op.notIn]: attributeNames },
            },
          },
          { transaction },
        );
      }
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      loggers.error(
        `Product variant update error: ${error},user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Delete Product Variant and Attribute
   * @param {object} req
   * @returns
   */
  async deleteProductVariantAndAttribute(req) {
    try {
      const {
        body,
        params: { id },
      } = req;
      await ProductVariant.update(body, { where: { id } });
      return await ProductVariantAttribute.update(
        { status: 'deleted' },
        { where: { productVariantId: id } },
      );
    } catch (error) {
      throw Error(error);
    }
  },
};
