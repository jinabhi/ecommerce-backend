import { Op } from 'sequelize';
import repositories from '../repositories/index';
import utility from '../utils/index';
import models from '../models/index';
import mediaMiddleware from './media.middleware';
import userRepository from '../repositories/user.repository';

const { accountRepository } = repositories;
const { User } = models;

export default {
  /**
   * compare old password
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async checkOldPassword(req, res, next) {
    try {
      const {
        body: { currentPassword },
        user: { id },
      } = req;
      const data = await User.findOne({ where: { id } });
      const isPasswordMatch = await accountRepository.compareUserPassword(
        currentPassword,
        data.password,
      );
      if (data && data?.userRole === 'customer' && data?.socialId && data?.socialType) {
        const error = new Error(utility.getMessage(req, false, 'CHANGE_PASSWORD_PERMISSION'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (isPasswordMatch) {
        req.user = data;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'CURRENT_PASSWORD_MATCH'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
  * Compare old password and new password not same
  * @param {object} req
  * @param {object} res
  * @param {object} next
  */
  async checkOldPasswordNewPasswordSame(req, res, next) {
    try {
      const {
        body: { currentPassword, newPassword },
      } = req;
      if (currentPassword === newPassword) {
        const error = new Error(utility.getMessage(req, false, 'NOT_SAME_NEW_AND_CURRENT_PASSWORD_MATCH'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /** *
   * Check optional image
   */
  async checkOptionalImage(req, res, next) {
    try {
      const {
        body: { profilePicture },
      } = req;
      if (profilePicture) {
        Object.assign(req.params, {
          basePath: req.body.profilePicture,
          basePathArray: [req.body.profilePicture],
          mediaFor: 'user',
        });
        next();
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  },

  /**
* Check update media check
*/
  async checkUpdateMediaExist(req, res, next) {
    try {
      const {
        body: { profilePicture },
        user: { id }, params,
      } = req;
      const where = { id: id ?? params?.id };
      if (profilePicture) {
        // where.profilePicture = profilePicture;
      }
      const result = await userRepository.findOne(where);
      if (result) {
        Object.assign(req.params, {
          basePathArray: [],
          mediaFor: 'user',
          isUpdate: 'yes',
        });
        next();
      } else {
        Object.assign(req.params, {
          basePathArray: [profilePicture],
          mediaFor: 'user',
          isUpdate: 'yes',
        });
        next();
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * Check user media for
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaFor(req, res, next) {
    const { params } = req;
    const basePathStr = params.basePath;
    const newImages = [];
    if (basePathStr !== req.body.profilePicture) {
      newImages.push(basePathStr);
    }
    params.basePath = '';
    params.basePathArray = newImages;

    return (
      (params.basePathArray.length > 0
        && mediaMiddleware.checkMediaFor(req, res, next))
      || next()
    );
  },
  /**
   * Check user media exist
   * Note:- this middleware after checkUserMediaExists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkUserMediaExists(req, res, next) {
    const { params } = req;
    return (
      (params.basePathArray.length > 0
        && mediaMiddleware.checkMediaExists(req, res, next))
      || next()
    );
  },

  /**
   * Check email exists
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async checkEmailExists(req, res, next) {
    try {
      const {
        body: { email },
        params: { id },
      } = req;
      const where = { email };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const user = await accountRepository.findOne(where);

      if (user) {
        const error = new Error(utility.getMessage(req, false, 'EMAIL_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else {
        req.user = user;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user exists by email or mobile number
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async findUserByEmailOrMobileNumber(req, res, next) {
    try {
      const {
        body: { email },
      } = req;
      const where = {
        [Op.or]: [{ email }, { phoneNumber: email }],
        // /status: 'deleted'
      };
      const user = await accountRepository.findOne(where);
      if (user && user?.userRole === 'customer' && user?.socialId && user?.socialType) {
        const error = new Error(utility.getMessage(req, false, 'FORGO_PASSWORD_PERMISSION'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (user?.status === 'inactive') {
        res.status(utility.httpStatus('UNAUTHORIZED')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'ACCOUNT_INACTIVE'),
        });
      } else if (user) {
        req.user = user;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, email.match(/^\d+$/) ? 'PHONE_NOT_FOUND' : 'EMAIL_NOT_FOUND'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   *  Check reset url token
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkValidToken(req, res, next) {
    try {
      const {
        body: { token },
      } = req;
      const format = 'YYYY-MM-DD HH:mm:00';
      const updatedAt = utility.getAddDate(12, 'h', format);
      const data = await User.findOne({ where: { token, status: 'active' } });
      if (data && utility.convertDateTimeFormat(data?.expireDateTime) >= updatedAt) {
        const error = new Error(utility.getMessage(req, false, 'LINK_EXPIRE'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (data) {
        req.data = data;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'FALSE_USER'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Check user exist
   * @param {object} req
   * @param {object} res
   * @param {object} next
   */
  async checkUserExist(req, res, next) {
    try {
      const { body: { userId, phoneNumber } } = req;
      const where = {};
      if (userId) {
        where.id = userId;
      }
      if (phoneNumber) {
        where.phoneNumber = phoneNumber;
      }
      const data = await User.findOne({ where });
      if (data) {
        req.user = data;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'USER_NOT_FOUND'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   *  Check otp verify
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkOtpVerify(req, res, next) {
    try {
      const {
        body: { otp, phoneNumber, changeNumberVerificationStatus }, user,
      } = req;
      const where = { phoneNumber };
      if (changeNumberVerificationStatus) {
        delete where.phoneNumber;
        where.id = user?.id;
      }
      const format = 'YYYY-MM-DD HH:mm:00';
      const updatedAt = utility.getAddDate(10, 'm', format);
      const data = await User.scope('notDeletedUser').findOne({ where });
      if (data && (parseInt(data.otp, 10) !== parseInt(otp, 10))) {
        const error = new Error(utility.getMessage(req, false, 'INVALID_OTP'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (data && utility.convertDateTimeFormat(data?.expireDateTime) >= updatedAt) {
        const error = new Error(utility.getMessage(req, false, 'OTP_EXPIRE'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (data) {
        req.user = data;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'USER_NOT_FOUND'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (err) {
      next(err);
    }
  },
};
