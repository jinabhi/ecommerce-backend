import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils/index';

const { ContactUs } = models;
export default {
  /**
   * Add ContactUs
   * @param {object} req
   * @returns
   */
  async addContactUs(req) {
    try {
      const { body, user: { id } } = req;
      return await ContactUs.create({ ...body, userId: id });
    } catch (error) {
      loggers.error(`Contact us add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * ContactUs list
   * @param {object} req
   * @returns
   */
  async getAllContactUs(req) {
    try {
      const {
        query: {
          limit,
          offset,
          search,
          sortBy,
          fromDate,
          toDate,
          sortType,
          scope,
          userType,
        },
      } = req;
      let where = {};
      const startDate = utility.getStartDateFormater(fromDate);
      const endDate = utility.getEndDateFormater(toDate);
      const deletedScope = 'notDeletedContactUs';
      const scopes = scope || deletedScope;
      const userFullName = Sequelize.fn('CONCAT_WS', ' ', Sequelize.col('userDetails.first_name'), Sequelize.col('userDetails.last_name'));

      let orderBy = [['createdAt', 'DESC']];
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'fullName':
            orderBy = [[userFullName, sortType]];
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            Sequelize.where(userFullName, 'LIKE', `%${search}%`),
            { reason: { [Op.like]: `%${search}%` } },
            { description: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (fromDate) {
        where.createdAt = { [Op.gte]: startDate };
      }
      if (userType && userType !== 'all') {
        where.userType = userType;
      }
      if (toDate) {
        where.createdAt = { [Op.lte]: endDate };
      }
      if (fromDate && toDate) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }
      let searchCriteria = { order: orderBy, where };
      if (scopes === 'notDeletedContactUs') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
          include: [
            {
              association: 'userDetails',
              where: { status: 'active' },
              required: false,
              attributes: ['firstName', 'lastName'],
            },
          ],
        };
      }
      return ContactUs.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`ContactUs list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * ContactUs detail
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await ContactUs.scope('notDeletedContactUs').findOne({ where });
    } catch (error) {
      loggers.error(`ContactUs details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Delete contact us
   * @param {object} req
   * @returns
   */
  async updateContactUs(req) {
    try {
      const { contactUs } = req;
      return await contactUs.update({ status: 'deleted' });
    } catch (error) {
      loggers.error(`ContactUs delete error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

};
