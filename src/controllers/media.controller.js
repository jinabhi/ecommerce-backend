/* eslint-disable consistent-return */
import repositories from '../repositories';
import utility from '../utils';

const { mediaRepository } = repositories;

export default {
  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMedia(req, res, next) {
    try {
      return await mediaRepository.uploadMedia(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMediaFile(req, res, next) {
    try {
      return await mediaRepository.uploadMediaFile(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Upload bulk media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async uploadMultipleMedia(req, res, next) {
    try {
      return await mediaRepository.uploadMultipleMedia(req, res, next);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async saveMedia(req, res, next) {
    try {
      const result = await mediaRepository.create(req);
      res.status(utility.httpStatus('CREATED')).json({
        success: true,
        data: result,
        message: '',
      });
    } catch (error) {
      next(error);
    }
  },
  /**
   * Upload media Local/AWS
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async getSignedUrl(req, res, next) {
    try {
      const signedUrl = await mediaRepository.getSingedUrl(req.query.filePath);
      if (signedUrl) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: { url: signedUrl },
          message: '',
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: true,
          data: null,
          message: utility.getMessage(req, false, 'TRY_AGAIN'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
