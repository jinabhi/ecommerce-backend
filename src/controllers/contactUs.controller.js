import repositories from '../repositories/index';
import utility from '../utils/index';

const { contactUsRepository } = repositories;

export default {
  /**
   * ContactUs add
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addContactUs(req, res, next) {
    try {
      const result = await contactUsRepository.addContactUs(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'CONTACT_US_ADDED'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'FALSE_RESPONSE'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * ContactUs list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllContactUs(req, res, next) {
    try {
      const result = await contactUsRepository.getAllContactUs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete ContactUs
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async deleteContactUs(req, res, next) {
    try {
      await contactUsRepository.updateContactUs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CONTACT_US_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
