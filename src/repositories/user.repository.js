/* eslint-disable import/no-cycle */
import { Op, Sequelize } from 'sequelize';
import moment from 'moment';
import models from '../models';
import loggers from '../services/logger.service';
import mediaRepository from './media.repository';
import utils from '../utils/index';
import notificationRepository from './notification.repository';
import emailTemplateService from '../services/emailTemplate.service';
import jwt from '../services/jwt.service';
import stripeService from '../services/stripe.service';
import config from '../config';
import smsService from '../services/twillo.service';
import accountRepository from './account.repository';

const {
  User,
  SellerBankDetail,
  Address,
  Country,
  State,
  City,
  Notification,
  UserDevice,
  ProductView,
  Order,
  Product,
} = models;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const fromDateTime = ' 00:00:00';
const toDateTime = ' 23:59:59';

export default {
  /**
   * Create Staff
   */
  async createStaff(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body } = req;
      const { password, profilePicture, email } = body;
      body.password = await utils.generateHashPassword(password);
      body.userRole = 'staff';
      body.status = 'active';
      body.verificationStatus = 'completed';
      await mediaRepository.markMediaAsUsed([profilePicture]);
      const userResult = await User.create(body);
      if (userResult) {
        body.userId = userResult.id;
        await Address.create(body);
      }
      const object = {
        userName: `${userResult.firstName ?? ''}`,
        email,
        password: password ?? '',
        dateTime: utils.getCurrentLocalDate(Date(), 'YYYY-MM-DD HH:mm:ss') ?? '',
      };
      // Change password email send
      emailTemplateService.createStaff(object);
      await transaction.commit();
      return userResult;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Staff add error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * Otp verify
   * @param {object} req
   */
  async otpVerify(req) {
    try {
      const {
        user, body,
      } = req;
      const {
        changeNumberVerificationStatus,
        userRole,
        firebaseToken,
        deviceType,
        appVersion,
      } = body;
      const {
        firstName, lastName, phoneNumber, phoneNumberCountryCode, email,
      } = user;
      let bodyData = {
        verificationStatus: 'otpVerified',
        otp: null,
        status: 'profileInComplete',
      };
      if (userRole === 'customer') {
        bodyData.verificationStatus = 'completed';
        bodyData.status = 'active';
        const customerData = {
          name: `${firstName} ${lastName}`,
          email,
          phone: `${phoneNumberCountryCode}${phoneNumber}`,
        };
        const customer = await stripeService.createCustomer(
          customerData,
        );
        bodyData.stripeCustomerId = customer ? customer.id : '';
      }
      if (changeNumberVerificationStatus) {
        bodyData = { ...body, otp: null };
      }
      const userData = await user.update(bodyData);
      if (userData.userRole === 'customer' && !changeNumberVerificationStatus) {
        const userDetails = userData.get();
        const token = await jwt.createToken(userDetails);
        const deviceData = {
          userId: userDetails.id,
          deviceId: firebaseToken,
          deviceType,
          accessToken: token,
          appVersion,
        };
        await accountRepository.addUpdateUserDevice(deviceData);
        delete userDetails.password;
        delete userDetails.otp;
        return { ...userDetails, token };
      }
      delete userData.dataValues.password;
      delete userData.dataValues.token;
      return userData;
    } catch (error) {
      loggers.error(`Staff add error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Add bank details
   * @param {object} req
   */
  async addBankDetail(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { user, body } = req;
      if (user.status === 'rejected') {
        // Re approval request
        await SellerBankDetail.destroy(
          { where: { userId: user.id } },
          { transaction },
        );
      }
      await SellerBankDetail.create(body, { transaction });
      const result = await user.update(
        { verificationStatus: 'completed', status: 'pendingApproval' },
        { transaction },
      );
      await transaction.commit();
      delete result.dataValues.password;
      delete result.dataValues.token;
      notificationRepository.sendApprovalNotification();
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`Bank detail create add error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Create User otp send
   * @param {object} req
   */
  async createUser(req) {
    const transaction = await models.sequelize.transaction();
    try {
      const { body } = req;
      const {
        socialId, address, phoneNumberCountryCode, phoneNumber, firebaseToken,
        appVersion, deviceType, firstName, lastName, email, socialType,
      } = body;

      if (!socialId) {
        body.password = await utils.generateHashPassword(body.password);
        const otp = 4444 ?? utils.generateOtp();
        body.otp = otp;
        body.expireDateTime = utils.getCurrentDate(
          new Date(),
          'YYYY-MM-DD HH:mm:ss',
        );
        smsService.sendOtp({ otp, to: `${phoneNumberCountryCode}${phoneNumber}` });
      } else {
        body.lastLoginDate = utils.getCurrentDate(
          Date(),
          'YYYY-MM-DD HH:mm:ss',
        );
        if ((email && phoneNumber) || (socialType === 'apple')) {
          const customerData = {
            name: `${firstName} ${lastName}` || 'Morluxury Customer',
            email: email || 'Morluxury@gmail.com',
            phone: `${phoneNumber}` || '',
          };
          const customer = await stripeService.createCustomer(
            customerData,
          );
          body.stripeCustomerId = customer ? customer.id : '';
        }
      }
      const result = await User.create(body, { transaction });
      if (result && address) {
        await Address.create(
          { address: body.address, isDefault: true, userId: result.id },
          { transaction },
        );
      }
      if (result.status === 'profileInComplete' || result.status === 'active') {
        const data = result.get();
        const token = await jwt.createToken(data);
        const deviceData = {
          userId: data.id,
          deviceId: firebaseToken,
          deviceType,
          accessToken: token,
          appVersion,
        };
        await accountRepository.addUpdateUserDevice(deviceData, transaction);
        await transaction.commit();
        return { ...data, token };
      }
      await transaction.commit();
      delete result.dataValues.password;
      delete result.dataValues.token;
      notificationRepository.signupNotification(result?.userRole);
      return result;
    } catch (error) {
      await transaction.rollback();
      loggers.error(`User add error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Resend otp and change number otp send
   * @param {object} req
   */
  async resendOtp(req) {
    try {
      const {
        user,
        body: { phoneNumber },
      } = req;
      const otp = 4444 ?? utils.generateOtp();
      smsService.sendOtp({ otp, to: `${user?.phoneNumberCountryCode}${phoneNumber}` });
      if (user) {
        return await user.update({
          otp,
          expireDateTime: utils.getCurrentDate(
            new Date(),
            'YYYY-MM-DD HH:mm:ss',
          ),
        });
      }
      return await user.update(
        {
          otp,
          expireDateTime: utils.getCurrentDate(
            new Date(),
            'YYYY-MM-DD HH:mm:ss',
          ),
        },
        { where: { phoneNumber } },
      );
    } catch (error) {
      loggers.error(`User resend otp error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Update bank details
   * @param {object} req
   * @returns
   */
  async updateBankDetail(req) {
    try {
      const {
        body,
        // params: { id },
        user,
      } = req;
      await SellerBankDetail.update(body, { where: { userId: user.id } });
      notificationRepository.updateProfileNotification(
        user.id,
        'brand',
        'bank',
      );
      return true;
    } catch (error) {
      loggers.error(
        `Seller Bank details update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Find data
   * @param {object} where
   * @returns
   */
  async findOne(where) {
    try {
      const activeWhere = { status: 'active' };
      const addressInclude = [
        {
          model: Country,
          where: activeWhere,
          required: false,
        },
        {
          model: State,
          where: activeWhere,
          required: false,
        },
        {
          model: City,
          where: activeWhere,
          required: false,
        },
      ];
      return await User.scope('notDeletedUser').findOne({
        where,
        include: [
          {
            association: 'userAddressDetails',
            where: activeWhere,
            required: false,
            include: addressInclude,
          },
          {
            association: 'sellerBrandDetail',
            required: false,
            where: activeWhere,
          },
          {
            association: 'sellerBankDetail',
            required: false,
            where: activeWhere,
          },
        ],
      });
    } catch (error) {
      loggers.error(`User details error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Check bank detail
   * @param {object} where
   * @returns
   */
  async SellerBankDetails(where) {
    try {
      return await SellerBankDetail.scope('notDeleteSellerBankDetail').findOne({
        where,
      });
    } catch (error) {
      loggers.error(`Seller bank  details error: ${error}`);
      throw Error(error);
    }
  },
  /**
   * Update Staff
   * @param {object} req
   * @returns
   */
  async updateUser(req) {
    try {
      const { body, user } = req;
      const {
        password, status, profilePicture, email, phoneNumber, firstName, lastName,
      } = body;

      if (password) {
        body.password = await utils.generateHashPassword(password);
      }
      if (email && phoneNumber && !user?.stripeCustomerId) {
        const customerData = {
          name: `${firstName} ${lastName}` || 'Morluxury Customer',
          email: email || 'Morluxury@gmail.com',
          phone: `${phoneNumber}` || 9876543210,
        };
        const customer = await stripeService.createCustomer(
          customerData,
        );
        body.stripeCustomerId = customer ? customer.id : '';
      }
      if (user.status === 'profileInComplete' || user.verificationStatus !== 'completed') {
        body.status = 'active';
        body.verificationStatus = 'completed';
      }

      if (user.profilePicture !== profilePicture) {
        await mediaRepository.findMediaByBasePathAndUnlink(user.profilePicture);
        await mediaRepository.markMediaAsUsed([profilePicture]);
      }
      const result = await user.update(body);
      if (result) {
        await Address.update(body, { where: { userId: user?.id } });
      }
      if (status || password) {
        return result;
      }
      delete result.dataValues.password;
      delete result.dataValues.token;
      return result;
    } catch (error) {
      loggers.error(`User details update error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * All Users get
   */
  async getAllUser(req) {
    try {
      const {
        query: {
          limit,
          offset,
          search,
          sortBy,
          sortType,
          scope,
          status,
          userRole,
          registeredFrom,
          registeredTo,
          countryId,
          cityId,
          stateId,
        },
      } = req;
      let where = { userRole: { [Op.ne]: 'admin' } };
      let orderBy = [['createdAt', 'DESC']];
      const notDeletedScope = 'notDeletedUser';
      const scopes = scope || notDeletedScope;
      const activeWhere = { status: 'active' };
      const countryWhere = { ...activeWhere };
      const cityWhere = { ...activeWhere };
      const stateWhere = { ...activeWhere };
      let addressRequired = false;
      const userFullName = Sequelize.fn(
        'CONCAT_WS',
        ' ',
        Sequelize.col('User.first_name'),
        Sequelize.col('User.last_name'),
      );
      const startDate = utils.getStartDateFormater(registeredFrom);
      const endDate = utils.getEndDateFormater(registeredTo);
      if (userRole) {
        where.userRole = userRole;
      }

      let duplicating = { separate: true };
      if (search) {
        const searchArray = [
          Sequelize.where(userFullName, 'LIKE', `%${search}%`),
          { email: { [Op.like]: `%${search}%` } },
          { status: { [Op.like]: `%${search}%` } },
          { '$userAddressDetails.City.city$': { [Op.like]: `%${search}%` } },
          { '$userAddressDetails.address$': { [Op.like]: `%${search}%` } },
          {
            '$userAddressDetails.State.state_name$': {
              [Op.like]: `%${search}%`,
            },
          },
          {
            '$userAddressDetails.Country.country$': {
              [Op.like]: `%${search}%`,
            },
          },
          { phoneNumber: { [Op.like]: `%${search}%` } },
        ];
        if (userRole === 'seller') {
          searchArray.push({
            '$sellerBrandDetail.name$': { [Op.like]: `%${search}%` },
          });
          searchArray.push({
            '$sellerBrandDetail.store_name$': { [Op.like]: `%${search}%` },
          });
        }
        where = {
          ...where,
          [Op.or]: searchArray,
        };
        duplicating = { duplicating: false };
      }
      if (registeredFrom) {
        where.createdAt = { [Op.gte]: startDate };
      }
      if (registeredTo) {
        where.createdAt = { [Op.lte]: endDate };
      }
      if (registeredFrom && registeredTo) {
        where.createdAt = { [Op.between]: [startDate, endDate] };
      }

      if (countryId && countryId !== 'all') {
        countryWhere.id = countryId;
        addressRequired = true;
        duplicating = { duplicating: false };
      }
      if (cityId && cityId !== 'all') {
        cityWhere.id = cityId;
        addressRequired = true;
        duplicating = { duplicating: false };
      }
      if (stateId && stateId !== 'all') {
        stateWhere.id = stateId;
        addressRequired = true;
        duplicating = { duplicating: false };
      }
      if (status && status !== 'all') {
        where.status = status;
        duplicating = { duplicating: false };
      }
      if (sortBy && sortType) {
        switch (sortBy) {
          case 'name':
            orderBy = [[userFullName, sortType]];
            break;
          case 'storName':
            orderBy = [
              [
                User.associations.sellerBrandDetail,
                'store_name',
                sortType,
              ],
            ];
            break;
          case 'brandName':
            orderBy = [
              [
                User.associations.sellerBrandDetail,
                'name',
                sortType,
              ],
            ];
            break;
          case 'address':
            orderBy = [
              [
                User.associations.userAddressDetails,
                'address',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'city':
            orderBy = [
              [
                User.associations.userAddressDetails, Address.associations.City,
                'city',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'state':
            orderBy = [
              [
                User.associations.userAddressDetails, Address.associations.State,
                'state_name',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          case 'country':
            orderBy = [
              [
                User.associations.userAddressDetails, Address.associations.Country,
                'country',
                sortType,
              ],
            ];
            duplicating = { duplicating: false };
            break;
          default:
            orderBy = [[sortBy, sortType]];
            break;
        }
      }
      const addressInclude = [
        {
          model: Country,
          where: countryWhere,
          required: 'id' in countryWhere,
        },
        {
          model: State,
          where: stateWhere,
          required: 'id' in stateWhere,
        },
        {
          model: City,
          where: cityWhere,
          required: 'id' in cityWhere,
        },
      ];
      const include = [
        {
          association: 'userAddressDetails',
          ...duplicating,
          where: activeWhere,
          required: addressRequired,
          include: addressInclude,
        },
      ];
      if (userRole === 'seller') {
        include.push({
          association: 'sellerBrandDetail',
          required: false,
          where: activeWhere,
        });
      }
      let searchCriteria = {
        order: orderBy,
        where,
        include,
        col: 'id',
        distinct: true,
      };
      if (scopes === 'notDeletedUser') {
        searchCriteria = {
          ...searchCriteria,
          limit: parseInt(Math.abs(limit), 10) || 10,
          offset: parseInt(Math.abs(offset), 10) || 0,
        };
      }
      return await User.scope(scopes).findAndCountAll(searchCriteria);
    } catch (error) {
      loggers.error(`User list error: ${error}, user id: ${req?.user?.id}`);
      throw Error(error);
    }
  },

  /**
   * User status update
   * @param {object} req
   * @returns
   */
  async updateStatus(req) {
    try {
      const { user, body } = req;
      const { status, userRole, message } = body;
      if (user.status === status) {
        return false;
      }
      const pendingApproval = user.status;
      const result = await user.update({ status });
      if (userRole === 'seller') {
        const object = {
          userName: `${result.firstName ?? ''}`,
          email: result.email,
          status,
          message,
          pendingApproval,
        };
        emailTemplateService.sellerRequestUpdate(object);
      } else if (userRole === 'customer') {
        const object = {
          userName: `${result.firstName ?? ''}`,
          email: result.email,
          status,
        };
        emailTemplateService.customerStatusUpdate(object);
      }
      // User inactive case logout
      if (status === 'inactive') {
        const userDevice = await accountRepository.getUserDeviceToken(user.id);
        if (userDevice) {
          await accountRepository.deleteUserDevice(userDevice);
        }
      }
      return result;
    } catch (error) {
      loggers.error(
        `User status update error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

  /**
   * Get dashboard count
   * @param {Object} data
   */
  async getUserCount(data) {
    try {
      const userData = {
        totalUsers: 0,
        totalLastWeekUsers: 0,
        totalCurrentWeekUsers: 0,
      };
      const where = { status: { [Op.in]: ['active', 'inactive'] } };
      if (data && data.userType) {
        where.userRole = data.userType;
      }
      userData.totalUsers = await User.count({ where });
      // Current week total users
      const startCurrentWeekDate = moment
        .utc()
        .startOf('week')
        .format(dateFormat);
      const endCurrentWeekDate = moment.utc().endOf('week').format(dateFormat);
      if (startCurrentWeekDate && endCurrentWeekDate) {
        where.createdAt = {
          [Op.between]: [startCurrentWeekDate, endCurrentWeekDate],
        };
        userData.totalCurrentWeekUsers = await User.count({ where });
      }
      // Last week total users
      const lastWeekStartDate = moment
        .utc()
        .startOf('week')
        .subtract(7, 'd')
        .format(dateFormat);
      const lastWeekendDate = moment
        .utc()
        .endOf('week')
        .subtract(7, 'd')
        .format(dateFormat);
      if (lastWeekStartDate && lastWeekendDate) {
        where.createdAt = {
          [Op.between]: [lastWeekStartDate, lastWeekendDate],
        };
        userData.totalLastWeekUsers = await User.count({ where });
      }
      return userData;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get total registered users graph data for admin dashboard
   * @param {object} req
   * @param {object} type
   * @returns
   */
  async getDashboardRegisteredUsersGraph(req, type) {
    try {
      let name = '';
      const where = {};
      const queryData = req.query;
      if (!queryData.year) {
        queryData.year = utils.currentYear();
      }
      const timezone = req.headers.timezone
        ? req.headers.timezone
        : 'Asia/kolkata';

      if (type === 'customer') {
        name = 'buyers';
        where.userRole = 'customer';
      } else if (type === 'seller') {
        name = 'sellers';
        where.userRole = 'seller';
        where.status = 'active';
      } else {
        name = 'vistors';
        where.userRole = 'admin';
      }

      let data = [];
      const monthNames = [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
      ];

      if (queryData.fromDate && queryData.toDate && timezone) {
        let fromDate = `${queryData.fromDate}${fromDateTime}`;
        let toDate = `${queryData.toDate}${toDateTime}`;
        fromDate = utils.convertDateFromTimezone(
          fromDate,
          timezone,
          dateFormat,
        );
        toDate = utils.convertDateFromTimezone(toDate, timezone, dateFormat);
        fromDate = moment.utc(fromDate);
        toDate = moment.utc(toDate);
        where.createdAt = { [Op.gte]: fromDate, [Op.lte]: toDate };
      }
      await Promise.all(
        monthNames.map(async (element, i) => {
          if (monthNames[i]) {
            const { year } = queryData;
            where[Op.and] = [
              Sequelize.where(
                Sequelize.fn('month', Sequelize.col('User.created_at')),
                parseInt(monthNames[i], 10),
              ),
              Sequelize.where(
                Sequelize.fn('YEAR', Sequelize.col('User.created_at')),
                year,
              ),
            ];
          }
          const userScope = [
            {
              method: ['user', { where, havingWhere: {}, attributes: ['id'] }],
            },
          ];
          data.push({ [i]: await User.scope(userScope).count(), type: i });
        }),
      );
      // sort by value
      data.sort((a, b) => parseInt(a.type, 10) - parseInt(b.type, 10));
      // const final = [];
      data = data.map((e, i) => e[i]);

      return { name, data };
    } catch (error) {
      throw Error(error);
    }
  },
  /**
   * Get user with user profile
   * @param {Object} where
   */
  async getUserDetail(where) {
    try {
      const user = await User.findOne({
        where,
      });
      return user;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get user device token from user id
   * @param {Integer} userId
   */
  async getUserNotificationCount(userId) {
    try {
      const where = {
        userId,
        isUnreadStatus: 'unread',
      };
      return await Notification.count({
        where,
      });
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * Get user device token from user id
   * @param {Number} userId
   */
  async getUserDeviceToken(userId) {
    try {
      const where = {
        userId,
      };
      const userToken = await UserDevice.findOne({
        where,
      });

      return userToken;
    } catch (error) {
      throw Error(error);
    }
  },

  /**
   * visitor buyer graph
   * @param {object} req
   * @returns
   */
  async visitorBuyerGraph(req) {
    try {
      const {
        query,
        user: { userRole, id },
        headers: { timezone },
      } = req;
      const { year, toDate, fromDate } = query;
      if (!year) {
        query.year = utils.currentYear();
      }
      const appTimezone = timezone || 'Asia/kolkata';
      let where = {};
      if (fromDate && toDate) {
        const startDate = utils.getUTCDateTimeFromTimezone(
          `${fromDate}${fromDateTime}`,
          appTimezone,
          dateFormat,
        );
        const endDate = utils.getUTCDateTimeFromTimezone(
          `${toDate}${toDateTime}`,
          appTimezone,
          dateFormat,
        );
        where.createdAt = { [Op.gte]: startDate, [Op.lte]: endDate };
      }
      where = {
        ...where,
        [Op.and]: Sequelize.where(
          Sequelize.fn('YEAR', Sequelize.col('created_at')),
          query.year,
        ),
      };

      if (userRole === 'seller') {
        where.seller_id = id;
      }
      const serachCriteria = {
        where,
        group: Sequelize.fn('MONTH', Sequelize.col('created_at')),
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
          [Sequelize.fn('count', Sequelize.col('id')), 'count'],
        ],
        raw: true,
      };
      const result = await Order.findAll(serachCriteria);
      const visitor = await ProductView.findAll(serachCriteria);
      const finalData = [];
      const finalVisitor = [];

      const monthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      monthNames.forEach((everyMonth) => {
        const item = result.find((items) => items.month === everyMonth);
        const visit = visitor.find((items) => items.month === everyMonth);
        if (item) {
          finalData.push(item);
        } else {
          finalData.push({
            month: everyMonth,
            count: 0,
          });
        }
        if (visit) {
          finalVisitor.push(visit);
        } else {
          finalVisitor.push({
            month: everyMonth,
            count: 0,
          });
        }
      });
      return [{ buyer: finalData, visitor: finalVisitor }];
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },

  /**
   * visitor buyer graph
   * @param {object} req
   * @returns
   */
  async visitorBuyerGraphSeller(req) {
    try {
      const {
        query,
        user: { userRole, id },
        headers: { timezone },
      } = req;
      const { year, toDate, fromDate } = query;
      if (!year) {
        query.year = utils.currentYear();
      }
      const appTimezone = timezone || 'Asia/kolkata';
      let where = {};
      const whereVisitor = {};
      if (fromDate && toDate) {
        const startDate = utils.getUTCDateTimeFromTimezone(
          `${fromDate}${fromDateTime}`,
          appTimezone,
          dateFormat,
        );
        const endDate = utils.getUTCDateTimeFromTimezone(
          `${toDate}${toDateTime}`,
          appTimezone,
          dateFormat,
        );
        where.createdAt = { [Op.gte]: startDate, [Op.lte]: endDate };
        whereVisitor.ProductView.createdAt = {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        };
      }
      where = {
        ...where,
        [Op.and]: Sequelize.where(
          Sequelize.fn('YEAR', Sequelize.col('Order.created_at')),
          query.year,
        ),
      };

      let whereProduct = {};
      if (userRole === 'seller') {
        whereProduct = {
          [Op.and]: [{ seller_id: id }],
        };
      }
      const searchCriteria = {
        where,
        raw: true,
        group: Sequelize.fn('MONTH', Sequelize.col('Order.created_at')),
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('Order.created_at')), 'month'],
          [Sequelize.literal('COUNT(DISTINCT(Order.id))'), 'count'],
        ],
        includeIgnoreAttributes: false,
        include: [
          {
            association: 'orderDetails',
            where: whereProduct,
            required: true,
          },
        ],
      };
      const result = await Order.findAll(searchCriteria);
      const visitor = await this.visitorCount(req, whereVisitor);
      const finalData = [];
      const finalVisitor = [];

      const monthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      monthNames.forEach((everyMonth) => {
        const item = result.find((items) => items.month === everyMonth);
        const visit = visitor.find((items) => items.month === everyMonth);
        if (item) {
          finalData.push(item);
        } else {
          finalData.push({
            month: everyMonth,
            count: 0,
          });
        }
        if (visit) {
          finalVisitor.push({
            month: visit.month,
            count: visit.count,
          });
        } else {
          finalVisitor.push({
            month: everyMonth,
            count: 0,
          });
        }
      });
      return [{ buyer: finalData, visitor: finalVisitor }];
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },

  /**
   * Get seller product visitor count
   * @param {object} req
   * @returns
   */
  async guestUser(req) {
    try {
      const { body: { deviceId } } = req;
      const data = {
        userRole: 'guest',
        status: 'active',
      };
      const guestUserData = await UserDevice.findOne({ where: { deviceId } });
      if (guestUserData) {
        const userData = guestUserData.get();
        const userDetail = await User.findOne({ where: { id: userData.userId, userRole: 'guest', status: 'active' } });
        const guestData = userDetail.get();
        const tokenData = {
          id: guestData.id,
          status: guestData.status,
          userRole: guestData.userRole,
        };
        const token = await jwt.createToken(tokenData);
        const newToken = { accessToken: token };
        return guestUserData.update(newToken);
      }
      const guestData = await User.create(data);
      if (guestData) {
        const userData = guestData.get();
        const tokenData = {
          id: userData.id,
          status: userData.status,
          userRole: userData.userRole,
        };
        const token = await jwt.createToken(tokenData);
        const deviceData = {
          userId: userData.id,
          accessToken: token,
          deviceId,
        };
        return await UserDevice.create(deviceData);
      }

      return false;
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },

  /**
   * Get seller product visitor count
   * @param {object} req
   * @returns
   */
  async visitorCount(req, searchData) {
    try {
      const {
        query,
        user: { id },
      } = req;
      const where = {
        ...searchData,
        [Op.and]: Sequelize.where(
          Sequelize.fn('YEAR', Sequelize.col('ProductView.created_at')),
          query.year,
        ),
      };

      const search = {
        where,
        group: Sequelize.fn('MONTH', Sequelize.col('ProductView.created_at')),
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('ProductView.created_at')), 'month'],
          [Sequelize.fn('count', Sequelize.col('ProductView.id')), 'count'],
        ],
        raw: true,
        includeIgnoreAttributes: false,
        include: [
          {
            model: Product,
            where: { seller_id: id },
            required: true,
          },
        ],
        required: true,
      };
      return await ProductView.findAll(
        search,
      );
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },
  /**
   * Get Stripe Details
   * @param {object} req
   * @returns
   */
  async getStripeDetails() {
    try {
      return config.stripe;
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },

  /**
 * Check credit point of user
 * @param {object} where
 * @returns
 */
  async creditPointsExist(where) {
    try {
      return await User.findOne(
        {
          where,
        },
      );
    } catch (error) {
      loggers.error(`User detail error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Send Test Notification
   * @param {object} req
   * @returns
   */
  async sendTestNotification(req) {
    try {
      return notificationRepository.sendTestNotification(req);
    } catch (error) {
      loggers.error(error);
      throw Error(error);
    }
  },

};
