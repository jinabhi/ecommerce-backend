import repositories from '../repositories';
import utility from '../utils';

const { earningRepository } = repositories;

export default {

  /**
    * Earning  Listing
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getEarnings(req, res, next) {
    try {
      const result = await earningRepository.getAllEarning(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * Earning  Listing
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getEarningsGraph(req, res, next) {
    try {
      const result = await earningRepository.getEarningsGraph(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Earning status update
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async earningStatusUpdate(req, res, next) {
    try {
      await earningRepository.earningStatusUpdate(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'EARNING_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

  /*
  * Get earning details for admin
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async earningDetails(req, res, next) {
    try {
      const result = await earningRepository.earningDetails(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

};
