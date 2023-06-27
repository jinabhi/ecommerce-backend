import { Op } from 'sequelize';
import utility from '../utils/index';
import getEarlyAccessRepository from '../repositories/getEarlyAccess.repository';

export default {

  /**
   * Check get early contact us
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkGetEarlyAccessEnquiryExist(req, res, next) {
    try {
      const {
        params: { id },
      } = req;
      const where = { };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await getEarlyAccessRepository.findOne(where);
      if (!result) {
        const error = new Error(utility.getMessage(req, false, 'GET_EARLY_ACCESS_CONTACT_US_NOT_EXIST'));
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
   * Check Country Code And Mobile Number
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async checkCountryCodeAndMobile(req, res, next) {
    try {
      const { body: { contactNumberCountryCode, contactNumber } } = req;
      const where = { contactNumber, contactNumberCountryCode };
      const result = await getEarlyAccessRepository.findOne(where);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          message: utility.getMessage(req, false, 'GET_EARLY_ACCESS_ALREADY_EXIST'),
        });
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },
};
