import repositories from '../repositories';
import utility from '../utils';

const { brandRepository } = repositories;

export default {

  /**
     * Create brand
     * @param {object} req
     * @param {object} res
     * @param {Function} next
     */
  async addBrand(req, res, next) {
    try {
      const result = await brandRepository.addBrand(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'BRAND_ADDED'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Brand details
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllBrand(req, res, next) {
    try {
      const result = await brandRepository.getAllBrand(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Brand
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getBrand(req, res, next) {
    try {
      const { brand } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: brand,
        message: utility.getMessage(req, false, 'BRAND_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Update brand commission
  * @param {object} res
  * @param {object} req
  * @param {Function} next
  */
  async updateBrandCommission(req, res, next) {
    try {
      await brandRepository.updateBrandCommission(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'BRAND_COMMISSION_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Brand
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateBrand(req, res, next) {
    try {
      await brandRepository.updateBrand(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'BRAND_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Delete Brand
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async deleteBrand(req, res, next) {
    try {
      req.body.status = 'deleted';
      await brandRepository.updateBrand(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'BRAND_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
};
