import models from '../models/index';
import logger from '../services/logger.service';

const { HowItWorks } = models;

export default {

  /**
  * Add how it works
  * @param {object} req
  * @returns
  */
  async addHowItWorks(req) {
    try {
      const { body } = req;
      return await HowItWorks.create(body);
    } catch (error) {
      logger.error(`How it works add error: ${error}`);
      throw Error(error);
    }
  },

  /**
    * How it work detail
    * @param {object} where
    * @returns
    */
  async findOne(where) {
    try {
      return await HowItWorks.scope('notDeletedHowItWorks').findOne({
        where,
      });
    } catch (error) {
      logger.error(`How it works details error: ${error}`);
      throw Error(error);
    }
  },

  /**
  * Get all how it works
  * @param {object} req
  * @returns
  */
  async getAllHowItWorks(req) {
    try {
      const {
        query: {
          limit,
          offset,
        },
      } = req;
      return await HowItWorks.scope('notDeletedHowItWorks').findAndCountAll({
        order: [['createdAt', 'DESC']],
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
      });
    } catch (error) {
      logger.error(`How it works list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update how it works
   * @param {object} req
   * @returns
   */
  async updateHowItWorks(req) {
    try {
      const { params: { id }, body } = req;
      return await HowItWorks.update(body, { where: { id } });
    } catch (error) {
      logger.error(`How it works delete error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },
};
