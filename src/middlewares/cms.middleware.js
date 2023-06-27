import { Op } from 'sequelize';
import cmsRepository from '../repositories/cms.repository';
import utility from '../utils/index';

export default {
  /**
   * check if CMS Page name already exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkCmsNameExist(req, res, next) {
    try {
      const {
        body: { description },
        params: { id },
      } = req;
      const where = { description };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await cmsRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'CMS_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check if CMS Page exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async checkCmsExist(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const where = {};
      where.id = id;
      const result = await cmsRepository.findOne(where);
      if (result) {
        req.cms = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CMS_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
};
