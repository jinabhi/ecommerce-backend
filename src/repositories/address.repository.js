import { Op, Sequelize } from 'sequelize';
import axios from 'axios';
import models from '../models';
import loggers from '../services/logger.service';
import config from '../config';

const {
  Country, City, State, Address, CurrencyExchangeRates,
} = models;

export default {
  /**
   * Add address
   * @param {object} req
   * @returns
   */
  async addAddress(req) {
    try {
      const { user: { id }, body } = req;
      body.userId = id;
      await Address.scope('notDeletedAddress').update({ isDefault: false }, { where: { userId: id } });
      body.isDefault = true;
      return await Address.create(body);
    } catch (error) {
      loggers.error(`Address add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Get all address
   * @param {object} req
   * @returns
   */
  async getAllAddress(req) {
    try {
      const {
        query: {
          limit,
          offset,
        }, user: { id, userRole },
      } = req;
      const where = {};
      if (userRole === 'customer') {
        where.userId = id;
      }
      return await Address.scope('notDeletedAddress').findAndCountAll({
        where,
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
        order: [[Sequelize.literal('IF(is_default = true, 1, 0 )'), 'DESC'], ['createdAt', 'DESC']],
      });
    } catch (error) {
      loggers.error(`Address list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Get all country
   */
  async getAllCountry() {
    try {
      const orderBy = [['createdAt', 'DESC']];
      return await Country.scope('notDeletedCountry').findAll({ order: orderBy });
    } catch (error) {
      loggers.error(`Country list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Find one
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      return await Address.scope('notDeletedAddress').findOne({ where });
    } catch (error) {
      loggers.error(`Address details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Get all state
   * @param {object} req
   * @returns
   */
  async getAllState(req) {
    try {
      const { query: { countryId } } = req;
      const where = {};
      if (countryId) {
        where.countryId = countryId;
      }
      const orderBy = [['createdAt', 'DESC']];
      return await State.scope('notDeletedState').findAll({ where, order: orderBy });
    } catch (error) {
      loggers.error(`State list error: ${error}}`);
      throw Error(error);
    }
  },

  /**
   * Get all city
   * @param {object} req
   * @returns
   */
  async getAllCity(req) {
    try {
      const { query: { stateId, countryId } } = req;
      const where = {};
      if (stateId) {
        where.stateId = stateId;
      }
      if (countryId) {
        where.countryId = countryId;
      }
      const orderBy = [['createdAt', 'DESC']];
      return await City.scope('notDeletedCity').findAll({ where, order: orderBy });
    } catch (error) {
      loggers.error(`City list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update address
   * @param {object} req
   * @returns
   */
  async updateAddress(req) {
    try {
      const { address, body, user: { id } } = req;
      const { status } = body;
      const result = await address.update(body);
      if (status === 'deleted' && address?.isDefault) {
        const addressResult = await Address.scope('notDeletedAddress').findAll({ where: { userId: id }, order: [['id', 'DESC']], limit: 1 });
        if (addressResult.length > 0) {
          await Address.scope('notDeletedAddress').update({ isDefault: true }, { where: { id: addressResult[0]?.id } });
        }
      }
      return result;
    } catch (error) {
      loggers.error(`Update address error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update address
   * @param {object} req
   * @returns
   */
  async updateDefaultAddress(req) {
    // const transaction = await models.sequelize.transaction();
    try {
      const { address, user: { id }, params } = req;
      await address.update({ isDefault: true });
      await Address.update({ isDefault: false }, {
        where: {
          userId: id,
          id: { [Op.ne]: params?.id },
        },
      });
      // await transaction.commit();
      return true;
    } catch (error) {
      // await transaction.rollback();
      loggers.error(`Update address error: ${error}`);
      throw Error(error);
    }
  },

  /**
  * Currency exchange rate
  * @param {object} req
  * @returns
  */
  async currencyExchangeRate() {
    try {
      const { currencyExchange: { apiKey } } = config;
      // Get currency usd rate
      const currencyResult = await axios.get('https://api.apilayer.com/currency_data/live', {
        params: { base: 'USD', symbols: 'INR' },
        headers: { apiKey },
      });
      if (currencyResult) {
        const countryDetail = await Country.scope('notDeletedCountry').findOne({ where: { country: { [Op.like]: 'india' } } });
        const where = {
          countryId: countryDetail?.id,
        };
        const bodyData = {
          name: 'INR' ?? currencyResult?.data?.source,
          countryId: countryDetail?.id,
          rate: currencyResult?.data?.quotes?.USDINR,
        };
        const currency = await CurrencyExchangeRates.findOne({ where });
        if (currency) {
          return await currency.update(bodyData);
        }
        return await CurrencyExchangeRates.create(bodyData);
      }
      return true;
    } catch (error) {
      loggers.error(`Currency exchange rate error: ${error}`);
      return error;
      // throw new Error(error);
    }
  },

  /**
  * Exchange currency get
  * @param {object} where
  * @returns
  */
  async exchangeCurrencyGet(where) {
    try {
      return await CurrencyExchangeRates.findOne({ where });
    } catch (error) {
      loggers.error(`Currency exchange details error: ${error}`);
      throw Error(error);
    }
  },
};
