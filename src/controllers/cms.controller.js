import repositories from '../repositories';
import utility from '../utils';

const { cmsRepository } = repositories;

export default {
  /**
  * Get all CMS List
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async getAllCms(req, res, next) {
    try {
      const result = await cmsRepository.getAllCms(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update CMS
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateCms(req, res, next) {
    try {
      await cmsRepository.updateCms(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CMS_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Delete CMS
 * @param {object} req
 * @param {object} res
 * @param {Function} next
 */
  async  deleteCms(req, res, next) {
    try {
      req.body.status = 'deleted';
      await cmsRepository.updateCms(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'CMS_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Subcategory
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async getCms(req, res, next) {
    try {
      const { cms } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: cms,
        message: utility.getMessage(req, false, 'CMS_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
};
