import repositories from '../repositories/index';
import utility from '../utils/index';

const { generalSettingRepository } = repositories;

export default {

  /**
   * GeneralSetting list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllGeneralSetting(req, res, next) {
    try {
      const result = await generalSettingRepository.getAllGeneralSetting(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: { rows: result },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update GeneralSetting
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateGeneralSetting(req, res, next) {
    try {
      const result = await generalSettingRepository.updateGeneralSetting(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
        message: utility.getMessage(req, false, 'GENERAL_SETTING_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

};
