import repositories from '../repositories';
import utility from '../utils';

const { faqRepository } = repositories;

export default {

  /**
   * create FAQ
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async createFaq(req, res, next) {
    try {
      const result = await faqRepository.createFaq(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'FAQ_ADDED'),
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
   * create FAQ
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateFaq(req, res, next) {
    try {
      const result = await faqRepository.updateFaq(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'FAQ_UPDATED'),
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
   * create FAQ
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async deleteFaq(req, res, next) {
    try {
      req.body.status = 'deleted';
      const result = await faqRepository.updateFaq(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'FAQ_DELETED'),
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
   * FAQ Details
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getFaqDetail(req, res, next) {
    try {
      const { faq } = req;
      if (faq) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: faq,
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
   * Update Staff
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllFaq(req, res, next) {
    try {
      const result = await faqRepository.getAllFaq(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
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
