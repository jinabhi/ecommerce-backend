import repositories from '../repositories/index';
import utility from '../utils';

const { bannerRepository } = repositories;

export default {

  /**
   * Add banner
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async addBanner(req, res, next) {
    const result = await bannerRepository.addBanner(req);
    try {
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'BANNER_ADDED'),
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
   * Get all Banners
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllBanner(req, res, next) {
    try {
      const result = await bannerRepository.getAllBanner(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Banner delete
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async deleteBanner(req, res, next) {
    try {
      await bannerRepository.deleteBanner(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'BANNER_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Get Banner details
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getBanner(req, res, next) {
    try {
      const { banner } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: banner,
        message: utility.getMessage(req, false, 'BANNER_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Banner status update
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async bannerStatusUpdate(req, res, next) {
    try {
      await bannerRepository.bannerStatusUpdate(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'BANNER_STATUS_UPDATE'),
      });
    } catch (error) {
      next(error);
    }
  },

};
