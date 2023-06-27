import { Op } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import smsService from '../services/twillo.service';
import utility from '../utils';

const { GetEarlyAccess } = models;
export default {

  /**
   * Add get early contact us
   * @param {object} req
   * @returns
   */
  async addGetEarlyContactUs(req) {
    try {
      const { body } = req;
      const result = await GetEarlyAccess.create(body);
      if (result) {
        smsService.sendMessage({
          message: utility.getMessage(req, false, 'PROMOTIONAL_SMS_MESSAGE'),
          to: `${body?.contactNumberCountryCode}${body?.contactNumber}`,
        });
      }
      return result;
    } catch (error) {
      loggers.error(`Promotion contact us add error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Get all early contact us
   * @returns
   */
  async getAllGetEarlyContactUs(req) {
    try {
      const {
        query: {
          limit, offset, sortBy, sortType, search,
        },
      } = req;
      let where = {};
      if (search) {
        where = {
          [Op.or]: [
            { contactNumber: { [Op.like]: `%${search}%` } },
            { contactNumberCountryCode: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      let orderBy = [['id', 'DESC']];
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      return await GetEarlyAccess.scope('notDeletedGetEarlyAccess').findAndCountAll({
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
        order: orderBy,
        where,
      });
    } catch (error) {
      loggers.error(`Promotion list contact us error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Delete get early contact us
   * @param {object} req
   */
  async deleteGetEarlyContactUs(req) {
    try {
      const { params: { id } } = req;
      return await GetEarlyAccess.update({ status: 'deleted' }, { where: { id } });
    } catch (error) {
      loggers.error(`Promotion enquiry delete error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Promotion contact us  detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await GetEarlyAccess.scope('notDeletedGetEarlyAccess').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Promotion enquiry detail error: ${error}`);
      throw Error(error);
    }
  },

};
