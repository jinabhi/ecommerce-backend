import repositories from '../repositories';
import utility from '../utils';

const { howItWorksRepository } = repositories;

export default {

  /**
    * Add how it works
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async addHowItWorks(req, res, next) {
    try {
      const result = await howItWorksRepository.addHowItWorks(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'HOW_IT_WORKS_ADDED'),
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
   * How it works Details
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async howItWorksDetails(req, res, next) {
    try {
      const result = await howItWorksRepository.getAllHowItWorks(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
  * Update how it works
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async updateHowItWorks(req, res, next) {
    try {
      await howItWorksRepository.updateHowItWorks(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'HOW_IT_WORKS_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Get how it works
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async getHowItWorksDetails(req, res, next) {
    try {
      const { howItWorks } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: howItWorks,
        message: utility.getMessage(req, false, 'HOW_IT_WORKS_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete how it works
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async  deleteHowItWorks(req, res, next) {
    try {
      req.body.status = 'deleted';
      await howItWorksRepository.updateHowItWorks(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'HOW_IT_WORKS_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
