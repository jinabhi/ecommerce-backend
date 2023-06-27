import models from '../models';
import loggers from '../services/logger.service';

const {
  GeneralSetting, Country, State, City,
} = models;

export default {

  /**
   * Get all setting
   * @param {Object} req
   */
  async findAll(req) {
    try {
      const settings = {};
      const where = { status: 'active' };
      if (req.query.settingType) {
        where.settingType = req.query.settingType;
      }
      const results = await GeneralSetting.findAll({
        where,
      });
      results.forEach((data) => {
        const obj = data.toJSON();
        if (['android_force_update', 'ios_force_update'].indexOf(obj.key) !== -1) {
          settings[obj.key] = parseInt(obj.value, 10);
        } else {
          settings[obj.key] = obj.value;
        }
      });

      return settings;
    } catch (error) {
      loggers.error(`Setting list error: ${error} `);
      throw Error(error);
    }
  },

  /**
  * Get country list
  * @param {Object} req
  */
  async getCountryList() {
    try {
      return await Country.findAll();
    } catch (error) {
      loggers.error(`Country list error: ${error} `);
      throw Error(error);
    }
  },

  /**
   *
   * @param {*} countryId
   * @returns State List
   */
  async getStateList(countryId) {
    try {
      const where = { countryId };
      return State.findAll(
        { where },
      );
    } catch (error) {
      loggers.error(`State list error: ${error} `);
      throw Error(error);
    }
  },

  /**
   *
   * @param {*} countryId
   * @returns City List
   */
  async getCityList(stateId) {
    try {
      const where = { stateId };
      return City.findAll(
        { where },
      );
    } catch (error) {
      loggers.error(`City list error: ${error} `);
      throw Error(error);
    }
  },
};
