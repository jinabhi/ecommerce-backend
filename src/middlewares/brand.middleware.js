import { Op } from 'sequelize';
import utility from '../utils/index';
import brandRepository from '../repositories/brand.repository';

export default {

  /**
   * Check Brand name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkBrandNameExist(req, res, next) {
    try {
      const {
        body: { name, userId },
        params: { id },
      } = req;
      const where = { name };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      if (userId) {
        where.userId = { [Op.ne]: userId };
      }
      const result = await brandRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'BRAND_EXIST'));
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
   * Check Brand exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkBrandExist(req, res, next) {
    try {
      const {
        params: { id },
        body: { brandId },
      } = req;
      const where = {};
      where.id = brandId || id;
      const result = await brandRepository.findOne(where);
      if (result) {
        req.brand = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'BRAND_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
 * Check update media check
 */
  async checkUpdateMediaExist(req, res, next) {
    try {
      const {
        body: { storeLicenseDocumentImage },
        user: { id },
      } = req;
      const where = { userId: id };
      if (storeLicenseDocumentImage) {
        where.storeLicenseDocumentImage = storeLicenseDocumentImage;
      }
      const result = await brandRepository.findOne(where);
      if (result) {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'brandLogo',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [storeLicenseDocumentImage],
          mediaFor: 'brandLogo',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
 * Check Brand mobile number exist
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async checkBrandMobileNumberExist(req, res, next) {
    try {
      const {
        user,
        body: { storeContactNumber },
      } = req;
      const where = { storeContactNumber };
      if (user?.id) {
        where.userId = { [Op.ne]: user?.id };
      }
      const result = await brandRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'MOBILE_ALREADY_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        req.brand = result;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check update Brand name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkUpdateBrandNameExist(req, res, next) {
    try {
      const {
        body: { name },
        user: { id },
      } = req;
      const where = { name };
      if (id) {
        where.userId = { [Op.ne]: id };
      }
      const result = await brandRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'BRAND_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

};
