import { Op } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import utility from '../utils';

const { Banner } = models;
export default {

  /**
  * Add banner
  * @param {object} req
  * @returns
  */
  async addBanner(req) {
    try {
      const { body } = req;
      await mediaRepository.markMediaAsUsed([body.bannerImage]);
      return await Banner.create(body);
    } catch (error) {
      loggers.error(`Banner add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Get all banner
   * @returns
   */
  async getAllBanner(req) {
    try {
      const {
        query: {
          limit, offset, sortBy, sortType, name,
        },
        user,
      } = req;
      let where = {};
      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      if (name) {
        where = {
          ...where,
          [Op.or]: [{ title: { [Op.like]: `%${name}%` } }, { description: { [Op.like]: `%${name}$%` } }],
        };
      }
      if (user?.userRole !== 'admin') {
        where.status = 'active';
      }

      const result = await Banner.scope('notDeletedBanner').findAndCountAll({
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
        order: orderBy,
        where,
      });
      if (result && result.count === 0 && (user?.userRole === 'customer' || user?.userRole === 'guest')) {
        return {
          count: 1,
          rows: [
            {
              title: 'Default',
              bannerImage: 'public/banner-demo/banner.png',
              description: 'Default',
              status: 'active',
              bannerImageUrl: utility.getImage('public/banner-demo/banner.png'),
              createdAt: '2022-09-19T11:58:05.000Z',
              updatedAt: '2022-09-19T11:58:05.000Z',
            },
          ],
        };
      }
      return result;
    } catch (error) {
      loggers.error(`Banner list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Banner detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Banner.scope('notDeletedBanner').findOne({ where });
    } catch (error) {
      loggers.error(`Banner details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Delete banner
   * @param {object} req
   * @returns
   */
  async deleteBanner(req) {
    try {
      const { banner } = req;
      return await banner.update({ status: 'deleted' });
    } catch (error) {
      loggers.error(`Banner delete error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Banner status update
   * @param {object} req
   * @returns
   */
  async bannerStatusUpdate(req) {
    try {
      const { params: { id }, body } = req;
      return await Banner.update(body, { where: { id } });
    } catch (error) {
      loggers.error(`Banner status update error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
};
