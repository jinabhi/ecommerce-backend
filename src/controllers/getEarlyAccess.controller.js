import repositories from '../repositories';
import utility from '../utils';

const { getEarlyAccessRepository } = repositories;

export default {
  /**
      * Add Contact us
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addContact(req, res, next) {
    try {
      const result = await getEarlyAccessRepository.addGetEarlyContactUs(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'GET_EARLY_CONTACT_US_ADDED'),
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
    * Contact us Listing
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getAllGetEarlyContactUs(req, res, next) {
    try {
      const result = await getEarlyAccessRepository.getAllGetEarlyContactUs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete get early contact us
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async deleteGetEarlyAccess(req, res, next) {
    try {
      await getEarlyAccessRepository.deleteGetEarlyContactUs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        message: utility.getMessage(req, false, 'GET_EARLY_ACCESS_CONTACT_US_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
