/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-undef */
import models from '../models/index';
import loggers from '../services/logger.service';

const { GeneralSetting } = models;
export default {
  /**
     * Add and update GeneralSetting
     * @param {object} req
     * @returns
     */
  async updateGeneralSetting(req) {
    try {
      for (const [key, value] of Object.entries(req.body)) {
        await GeneralSetting.update({ value }, { where: { key } });
      }
    } catch (error) {
      loggers.error(`General Setting add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
     * GeneralSetting detail
     */
  async getAllGeneralSetting() {
    try {
      return await GeneralSetting.scope('notDeletedGeneralSetting').findAll({ attributes: ['key', 'name', 'value'] });
    } catch (error) {
      loggers.error(`General Setting details error: ${error}`);
      throw Error(error);
    }
  },
};
