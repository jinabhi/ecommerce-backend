import repositories from '../repositories';
import utility from '../utils';

const { promotionRepository } = repositories;

export default {
  /**
      * Add Enquiry
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async addEnquiry(req, res, next) {
    try {
      const result = await promotionRepository.addEnquiry(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PROMOTION_CONTACT_US'),
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
    * Get all Enquiry
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getAllEnquiry(req, res, next) {
    try {
      const result = await promotionRepository.getAllEnquiry(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
    * Get promotion video
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async getPromotionVideo(req, res, next) {
    try {
      const result = await promotionRepository.getPromotionVideo(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Enquiry
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async deleteEnquiry(req, res, next) {
    try {
      await promotionRepository.deleteEnquiry(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        message: utility.getMessage(req, false, 'ENQUIRY_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
      * contactUsAdmin
      * @param {object} req
      * @param {object} res
      * @param {Function} next
      */
  async contactUsAdmin(req, res, next) {
    try {
      const result = await promotionRepository.contactUsAdmin(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PROMOTION_CONTACT_US'),
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
};
