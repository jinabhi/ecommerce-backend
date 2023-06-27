import utility from '../utils/index';
import repositories from '../repositories';

const { contactUsRepository, productComplaintRepository } = repositories;
export default {

  /**
     * Check ContactUs exist
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns
     */
  async checkContactUsExist(req, res, next) {
    try {
      const { params: { id } } = req;
      const result = await contactUsRepository.findOne({ id });
      if (result) {
        req.contactUs = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CONTACT_US_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
     * Check product compliant exist
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns
     */
  async checkProductComplaintExist(req, res, next) {
    try {
      const { params: { id }, body: { productComplainId } } = req;
      const where = {};
      if (id) {
        where.id = id;
      }
      if (productComplainId) {
        where.id = productComplainId;
      }
      const result = await productComplaintRepository.findOne(where);
      if (result) {
        req.productComplaint = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_COMPLAINT_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
     * Check product compliant exist
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns
     */
  async checkProductComplaintCreditExist(req, res, next) {
    try {
      const { body: { productComplainId, userId } } = req;
      const where = { productComplainId, userId };
      const result = await productComplaintRepository.checkProductComplaintCreditPoint(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'PRODUCT_COMPLAINT_CREDIT_POINT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        req.productComplaintCreditPoint = result;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
 * Check add damage image check
 */
  async addDamageProductImageValidate(req, res, next) {
    try {
      const { body: { damageProductImages } } = req;
      if (damageProductImages && damageProductImages.length > 0) {
        const damageProductImageArray = damageProductImages.map((element) => element?.basePath);
        Object.assign(req.params, {
          basePathArray: damageProductImageArray.length ? damageProductImageArray : [],
          mediaFor: 'damageProductImage',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'damageProductImage',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },

};
