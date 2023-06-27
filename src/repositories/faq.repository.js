import { Op } from 'sequelize';
import models from '../models';
import loggers from '../services/logger.service';

const { Faq } = models;

export default {

  /**
   * Create FAQ
   * @param {object} req
   * @returns
   */
  async createFaq(req) {
    try {
      const { body } = req;
      return Faq.create(body);
    } catch (error) {
      loggers.error(`FAQ Create error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Update FAQ
   * @param {object} req
   * @returns
   */
  async updateFaq(req) {
    try {
      const { body, params: { id } } = req;
      return Faq.update(body, { where: { id } });
    } catch (error) {
      loggers.error(`FAQ update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Get all FAQ
   * @param {object} req
   * @returns
   */
  async getAllFaq(req) {
    try {
      const {
        query: {
          limit, offset, scope, sortBy, sortType, search, type,
        },
      } = req;

      let where = {};
      if (search) {
        where = { [Op.or]: [{ question: { [Op.like]: `%${search}%` } }, { type: { [Op.like]: `%${search}%` } }] };
      }
      let orderBy = [['createdAt', 'DESC']];
      const defaultScope = 'notDeletedFaq';
      const scopes = scope || defaultScope;
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      if (type && type !== 'all') {
        where.type = type;
      }
      let searchCriteria = { order: orderBy, where };

      if (scopes === 'notDeletedFaq') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await Faq.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`FAQ list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Find name
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return Faq.scope('notDeletedFaq').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`FAQ details error: ${error}`);
      throw Error(error);
    }
  },

};
