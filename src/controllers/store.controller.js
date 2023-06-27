import repositories from '../repositories';
import utility from '../utils';

const { storeRepository } = repositories;

export default {
  /**
   * SubCategory create
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getMyStore(req, res, next) {
    try {
      const result = await storeRepository.getMyStore(req);
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
