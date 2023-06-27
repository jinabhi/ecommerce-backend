import repositories from '../repositories';
import utility from '../utils';

const { addressRepository } = repositories;

export default {

  /**
   * Country Listing
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllCountry(req, res, next) {
    try {
      const result = await addressRepository.getAllCountry(req);
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

  /**
   * City Listing
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllCity(req, res, next) {
    try {
      const result = await addressRepository.getAllCity(req);
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

  /**
   * State Listing
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllState(req, res, next) {
    try {
      const result = await addressRepository.getAllState(req);
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

  /**
    * Add address
    * @param {object} req
    * @param {object} res
    * @param {Function} next
    */
  async addAddress(req, res, next) {
    try {
      const result = await addressRepository.addAddress(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'ADDRESS_ADDED'),
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
     * Delete Address
     * @param {object} req
     * @param {object} res
     * @param {Function} next
     */
  async deleteAddress(req, res, next) {
    try {
      req.body.status = 'deleted';
      await addressRepository.updateAddress(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'ADDRESS_DELETED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get All Address
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAllAddress(req, res, next) {
    try {
      const result = await addressRepository.getAllAddress(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update address
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateAddress(req, res, next) {
    try {
      await addressRepository.updateAddress(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'ADDRESS_UPDATED'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Address detail
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async getAddressDetail(req, res, next) {
    try {
      const { address } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: address,
        message: utility.getMessage(req, false, 'ADDRESS_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Address detail
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async updateDefaultAddress(req, res, next) {
    try {
      await addressRepository.updateDefaultAddress(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: {},
        message: utility.getMessage(req, false, 'DEFAULT_ADDRESS'),
      });
    } catch (error) {
      next(error);
    }
  },

};
