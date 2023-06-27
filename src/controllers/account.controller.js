import repositories from '../repositories';
import utility from '../utils';

const { accountRepository } = repositories;

export default {
  /**
   * User signup
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async signup(req, res, next) {
    try {
      const result = await accountRepository.signup(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'SIGNUP'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
        });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * User login
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async userAccountLogin(req, res, next) {
    try {
      const {
        body: { deviceType, userRole },
      } = req;
      let user = null;
      if (deviceType) {
        user = await accountRepository.checkMobileAccountLogin(req);
      } else {
        user = await accountRepository.checkUserAccountLogin(req);
      }
      if (user?.status === 'active' && (user?.userRole === 'admin' || user?.verificationStatus === 'completed')) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: { ...user },
          message: utility.getMessage(req, false, 'LOGIN_SUCCESS'),
        });
      } else if ((user && user?.otpSend) || (user && user?.status === 'inactive')) {
        res.status(utility.httpStatus('UNAUTHORIZED')).json({
          success: user?.status !== 'inactive',
          data: { ...user },
          message: utility.getMessage(req, false, user?.status === 'inactive' ? 'ACCOUNT_INACTIVE' : 'OTP_RE_SENT'),
        });
      } else if (user && user?.status === 'unAuthorized') {
        res.status(utility.httpStatus('UNAUTHORIZED')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'LOGIN_PERMISSION'),
        });
      } else if ((user?.status === 'pendingApproval' || user?.status === 'rejected') && userRole === 'seller') {
        const msg = user.status === 'pendingApproval' ? 'VERIFICATION_PENDING' : 'REJECT_USER_REQUEST';
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: { ...user },
          message: utility.getMessage(req, false, msg),
        });
      } else if (user && user?.verificationStatus !== 'completed' && user?.status !== 'invalid' && userRole !== 'admin') {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: { ...user },
          message: utility.getMessage(req, false, user.userRole ? 'VERIFICATION_INCOMPLETE' : 'OTP_VERIFICATION_INCOMPLETE'),
        });
      } else {
        let msg = userRole === 'admin' || userRole === 'staff' ? 'WRONG_EMAIL_CREDENTIAL' : 'WRONG_CREDENTIAL';
        if (deviceType) {
          msg = 'CUSTOMER_WRONG_CREDENTIAL';
        }
        res.status(utility.httpStatus('UNAUTHORIZED')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, user?.status === 'inactive' ? 'ACCOUNT_INACTIVE' : msg),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * User logout api
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async logout(req, res, next) {
    try {
      const { user } = req;
      const userDevice = await accountRepository.getUserDeviceToken(user.id);
      if (userDevice) {
        await accountRepository.deleteUserDevice(userDevice);
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: {},
          message: utility.getMessage(req, false, 'LOGOUT_SUCCESS'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'USER_NOT_FOUND'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send Reset Password Link
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async forgetPassword(req, res, next) {
    try {
      const sendResetLink = await accountRepository.sendResetPasswordLink(req);
      if (sendResetLink) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: null,
          message: sendResetLink,
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PASSWORD_LINK_NOT_SENT'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send Reset Password Link
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async createNewPassword(req, res, next) {
    try {
      const sendResetLink = await accountRepository.createNewPassword(req);
      if (sendResetLink) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: null,
          message: utility.getMessage(req, false, 'PASSWORD_CREATED_SUCCESS'),
        });
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PASSWORD_MISMATCH'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resets Password
   * @param {Object} req
   * @param {Object} res
   * @param {Function} next
   */
  async resetPassword(req, res, next) {
    try {
      const resetPassword = await accountRepository.resetPassword(req);
      if (resetPassword) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: null,
          message: 'PASSWORD_CHANGED',
        });
      } else {
        res.status(utility.httpStatus('NOT_FOUND')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'PASSWORD_NOT_CHANGED'),
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * change password
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async changePassword(req, res, next) {
    try {
      const password = await accountRepository.changePassword(req);
      if (password) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          message: utility.getMessage(req, false, 'PASSWORD_CHANGED'),
        });
      } else {
        res.status(utility.httpStatus('NOT_FOUND')).json({
          success: false,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Edit profile
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async editProfile(req, res, next) {
    try {
      const result = await accountRepository.editProfile(req);
      if (result) {
        res.status(utility.httpStatus('OK')).json({
          success: true,
          data: result,
          message: utility.getMessage(req, false, 'PROFILE_UPDATED'),
        });
      } else {
        res.status(utility.httpStatus('NOT_FOUND')).json({
          success: false,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get self user details
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getUserDetail(req, res, next) {
    try {
      const { user } = req;
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data: user,
        message: utility.getMessage(req, false, 'USER_DETAIL'),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Winston Logs List
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getWinstonLogs(req, res, next) {
    try {
      const data = await accountRepository.getWinstonLogs(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Winston Logs Path
   * @param {object} req
   * @param {object} res
   * @param {function} next
   */
  async getWinstonLogsPath(req, res, next) {
    try {
      const data = await accountRepository.getWinstonLogsPath(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Send Mailchimp
  * @param {object} req
  * @param {object} res
  * @param {function} next
  */
  async sendMailchimp(req, res, next) {
    try {
      const data = await accountRepository.sendMailchimp();
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
  * Send Test Mail
  * @param {object} req
  * @param {object} res
  * @param {function} next
  */
  async sendTestMail(req, res, next) {
    try {
      const data = await accountRepository.sendTestMail(req);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
 * Get Winston Logs level count
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
  async getWinstonLevelCount(req, res, next) {
    try {
      const queryData = req.query;
      const data = await accountRepository.getWinstonLevelCount(queryData);
      res.status(utility.httpStatus('OK')).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

};
