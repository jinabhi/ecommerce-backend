import models from '../models';
import loggers from '../services/logger.service';

const { Cms } = models;

export default {
  /**
   * Get all CMC
   * @param {object} req
   * @returns
   */
  async getAllCms(req) {
    try {
      const {
        query: {
          limit, offset, scope, sortBy, sortType, type,
        },
      } = req;
      let orderBy = [['createdAt', 'DESC']];
      const where = {};
      const defaultScope = 'notDeletedCms';
      const scopes = scope || defaultScope;
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      if (type) {
        where.cmsKey = type;
      }

      let searchCriteria = { where, order: orderBy };
      if (scopes === 'notDeletedCms') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await Cms.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`CMS list error: ${error}, user id: ${req?.user?.id}`);
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
      return await Cms.scope('notDeletedCms').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`CMS details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update CMS
   * @param {object} req
   * @returns
   */
  async updateCms(req) {
    try {
      const {
        body,
        params: { id },
      } = req;
      const { status } = body;
      const result = await Cms.update(body, { where: { id } });
      if (status) {
        return result;
      }
      return result;
    } catch (error) {
      loggers.error(`CMS update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
};
