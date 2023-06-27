import repositories from '../repositories/index';
import utility from '../utils/index';

const { productComplaintRepository } = repositories;

export default {
  /**
   * Product Complaint add
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async addProductComplaint(req, res, next) {
    try {
      const result = await productComplaintRepository.addProductComplaint(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PRODUCT_COMPLAINT_ADDED'),
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
   * Product Complaint list
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getAllProductComplaint(req, res, next) {
    try {
      const result = await productComplaintRepository.getAllProductComplaint(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Product Complaint details
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async productComplaintDetails(req, res, next) {
    try {
      const { productComplaint } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: productComplaint,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete Product Complaint
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async updateProductComplaintStatus(req, res, next) {
    try {
      const result = await productComplaintRepository.updateProductComplaintStatus(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'PRODUCT_COMPLAINT_STATUS_UPDATE'),
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
 * Delete Product Complaint
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
  async addCreditPoint(req, res, next) {
    try {
      const result = await productComplaintRepository.addCreditPoint(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'CREDIT_POINT_ADDED'),
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
