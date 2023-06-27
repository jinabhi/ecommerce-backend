import utility from '../utils/index';
import addressRepository from '../repositories/address.repository';
import models from '../models/index';

const { City, State, Country } = models;

export default {
  /**
   * Check Address exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkAddressExist(req, res, next) {
    try {
      const {
        body: { addressId },
        params: { id },
      } = req;
      const where = {};
      where.id = id || addressId;
      const result = await addressRepository.findOne(where);
      if (result) {
        req.address = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'ADDRESS_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check City Exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkCityExist(req, res, next) {
    try {
      const {
        body: { cityId },
      } = req;
      if (cityId) {
        const result = await City.findOne({ where: { id: cityId } });
        if (!result) {
          const error = new Error(utility.getMessage(req, false, 'CITY_NOT_EXIST'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
    * Check state Exist
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async checkStateExist(req, res, next) {
    try {
      const { body: { stateId } } = req;
      if (stateId) {
        const result = await State.findOne({ where: { id: stateId } });
        if (!result) {
          const error = new Error(utility.getMessage(req, false, 'STATE_NOT_EXIST'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
 * Check country exist
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async checkCountryCodeExist(req, res, next) {
    try {
      const { body: { countryCodeId } } = req;
      if (countryCodeId) {
        const result = await Country.findOne({ where: { id: countryCodeId } });
        if (!result) {
          const error = new Error(utility.getMessage(req, false, 'COUNTRY_NOT_EXIST'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        } else {
          next();
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

};
