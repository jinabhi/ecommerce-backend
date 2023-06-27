import { Op } from 'sequelize';
import utility from '../utils/index';
import bannerRepository from '../repositories/banner.repository';
import models from '../models';

const { Banner } = models;

export default {
  /**
   * Check Banner exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkBannerExist(req, res, next) {
    try {
      const {
        params: { id },
        body: { bannerId },
      } = req;
      const result = await bannerRepository.findOne({ id: bannerId || id });
      if (result) {
        req.banner = result;
        next();
      } else {
        const error = new Error(
          utility.getMessage(req, false, 'BANNER_NOT_EXIST'),
        );
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check banner name exist
   * @param {object} req
   * @param {object} res
   * @param {function} next
   * @returns
   */
  async checkBannerNameExist(req, res, next) {
    try {
      const {
        body: { title },
        params: { id },
      } = req;
      const where = { title };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await bannerRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'BANNER_EXIST'));
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
   * Check Banner count
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkBannerCount(req, res, next) {
    try {
      const {
        body: { status },
      } = req;
      const bannerCount = await Banner.scope('activeBanner').count();
      if (status) {
        if (status === 'active') {
          if (bannerCount >= 5) {
            const error = new Error(
              utility.getMessage(req, false, 'BANNER_ADD_ERROR'),
            );
            error.status = utility.httpStatus('BAD_REQUEST');
            next(error);
          } else {
            next();
          }
        } else {
          next();
        }
      } else if (bannerCount >= 5) {
        const error = new Error(
          utility.getMessage(req, false, 'BANNER_ADD_ERROR'),
        );
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
