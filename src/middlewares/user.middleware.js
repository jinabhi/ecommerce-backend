/* eslint-disable consistent-return */
import { Op } from 'sequelize';
import userRepository from '../repositories/user.repository';
import utility from '../utils/index';
import jwt from '../services/jwt.service';
import accountRepository from '../repositories/account.repository';

export default {
  /**
   * check user email and mobile number exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkUserEmailExist(req, res, next) {
    try {
      const {
        body: { phoneNumber, email },
        user,
        params: { id, isUpdate },
      } = req;
      const where = { [Op.or]: [{ phoneNumber }, { email }] };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      if (isUpdate && (user && user?.id)) {
        where.id = { [Op.ne]: user.id };
      }
      const result = await userRepository.findOne(where);
      if (result?.email.toLowerCase() === email.toLowerCase()) {
        const error = new Error(utility.getMessage(req, false, 'EMAIL_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (
        parseInt(result?.phoneNumber, 10) === parseInt(phoneNumber, 10)
      ) {
        const error = new Error(utility.getMessage(req, false, 'MOBILE_ALREADY_EXIST'));
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
  * check user email and mobile number exist
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async checkUpdateUserEmailExist(req, res, next) {
    try {
      const {
        body: { phoneNumber, email },
        user: { id },
      } = req;
      const where = { [Op.or]: [{ phoneNumber }, { email }] };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await userRepository.findOne(where);
      if (result?.email.toLowerCase() === email.toLowerCase()) {
        const error = new Error(utility.getMessage(req, false, 'EMAIL_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (
        parseInt(result?.phoneNumber, 10) === parseInt(phoneNumber, 10)
      ) {
        const error = new Error(utility.getMessage(req, false, 'MOBILE_ALREADY_EXIST'));
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
   * check Account and routing number
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkRoutingAccountNumberExist(req, res, next) {
    try {
      const {
        body: { routingNumber, accountNumber },
        user: { id },
      } = req;
      const where = { [Op.or]: [{ routingNumber }, { accountNumber }] };
      if (id) {
        where.userId = { [Op.ne]: id };
      }
      const result = await userRepository.SellerBankDetails(where);
      if (parseInt(result?.accountNumber, 10) === parseInt(accountNumber, 10)) {
        const error = new Error(utility.getMessage(req, false, 'ACCOUNT_NUMBER_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      } else if (
        parseInt(result?.routingNumber, 10) === parseInt(routingNumber, 10)
      ) {
        const error = new Error(utility.getMessage(req, false, 'ROUTING_NUMBER_EXIST'));
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
   * check user social ID exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkSocialIdExist(req, res, next) {
    try {
      const {
        body: {
          socialId, socialType, firebaseToken,
          deviceType, appVersion, firstName,
          lastName, phoneNumber, email,
        },
      } = req;
      const where = { socialId, socialType };
      const updateData = {};
      const user = await userRepository.findOne(where);
      if (user && user?.socialId === socialId) {
        if (user.status !== 'inactive') {
          if (firstName) {
            updateData.firstName = firstName;
          }
          if (lastName) {
            updateData.lastName = lastName;
          }
          if (email) {
            updateData.email = email;
          }
          if (phoneNumber) {
            updateData.phoneNumber = phoneNumber;
          }
          await user.update(updateData);
          const { ...userData } = user.get();
          const token = await jwt.createToken(userData);
          const deviceData = {
            userId: userData.id,
            deviceId: firebaseToken,
            deviceType,
            accessToken: token,
            appVersion,
          };
          await accountRepository.addUpdateUserDevice(deviceData);
          const data = user.get();
          delete data.password;
          delete data.token;
          delete data.otp;
          res.status(utility.httpStatus('OK')).json({
            success: true,
            data: { token, ...data },
            message: utility.getMessage(req, false, 'LOGIN_SUCCESS'),
          });
        } else if (user.verificationStatus !== 'completed' && user.status !== 'invalid') {
          res.status(utility.httpStatus('OK')).json({
            success: true,
            data: user,
            message: utility.getMessage(req, false, 'VERIFICATION_INCOMPLETE'),
          });
        } else {
          const error = new Error(utility.getMessage(req, false, 'ACCOUNT_INACTIVE'));
          error.status = utility.httpStatus('BAD_REQUEST');
          next(error);
        }
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * Check user exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkUserExist(req, res, next) {
    try {
      const {
        body: { userId },
        params: { id },
      } = req;
      const where = {};
      where.id = userId || id;
      const result = await userRepository.findOne(where);
      if (result) {
        req.user = result;
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
   * Check user exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */

  async checkPassword(req, res, next) {
    try {
      const { body } = req;
      if (body.password === body.confirmPassword) {
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'PASSWORD_NOT_MATCH'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },
};
