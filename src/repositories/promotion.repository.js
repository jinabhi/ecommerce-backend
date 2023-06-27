import { Op, Sequelize } from 'sequelize';
import models from '../models/index';
import loggers from '../services/logger.service';
import utility from '../utils';
import emailServices from '../services/emailTemplate.service';

const { PromotionContactUs, GeneralSetting } = models;
export default {

  /**
   * Add Enquiry
   * @param {object} req
   * @returns
   */
  async addEnquiry(req) {
    try {
      const { body } = req;
      const generalSetting = await GeneralSetting.findOne({ where: { key: 'promotional_contact_us' }, hooks: false });
      const {
        email, subject, message, instagramHandle, companyUrl,
      } = body;
      const object = {
        from: email,
        subject: subject ?? 'Enquiry Details',
        email: generalSetting?.value ?? 'info@mor.luxury',
        message: message ?? 'Enquiry Details',
      };
      if (instagramHandle) {
        object.instagramHandle = instagramHandle;
      }
      if (companyUrl) {
        object.companyUrl = companyUrl;
      }
      await emailServices.enquiryAdmin(object);
      return await PromotionContactUs.create(body);
    } catch (error) {
      loggers.error(`Add Enquiry error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Get All Enquiry
   * @returns
   */
  async getAllEnquiry(req) {
    try {
      const {
        query: {
          limit, offset, sortBy, sortType, search,
        },
      } = req;
      let orderBy = [['id', 'DESC']];
      if (sortBy && sortType) {
        orderBy = [[sortBy, sortType]];
      }
      let where = {};
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { subject: { [Op.like]: `%${search}%` } },
            { phoneNumber: { [Op.like]: `%${search}%` } },
            { message: { [Op.like]: `%${search}%` } },
            Sequelize.where(
              Sequelize.fn(
                'CONCAT_WS',
                ' ',
                Sequelize.col('first_name'),
                Sequelize.col('last_name'),
              ),
              'LIKE',
              `%${search}%`,
            ),
          ],
        };
      }
      return await PromotionContactUs.scope('notDeletedPromotion').findAndCountAll({
        limit: parseInt(Math.abs(limit), 10) || 10,
        offset: parseInt(Math.abs(offset), 10) || 0,
        order: orderBy,
        where,
      });
    } catch (error) {
      loggers.error(`Enquiry list error: ${error}`);
      throw Error(error);
    }
  },

  /**
  * Get Promotion video
  * @returns
  */
  async getPromotionVideo() {
    try {
      const generalSetting = await GeneralSetting.findOne({ where: { key: 'promotion_video' } });
      return {
        isVideoShow: parseInt(generalSetting?.value, 10) ? '1' : '0',
        videoBaseUrl: utility.getImage('public/promotion/sample.mp4'),
      };
    } catch (error) {
      loggers.error(`Enquiry list error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * Delete Enquiry
   * @param {object} req
   */
  async deleteEnquiry(req) {
    try {
      const { params: { id } } = req;
      return await PromotionContactUs.scope('notDeletedPromotion').update({ status: 'deleted' }, { where: { id } });
    } catch (error) {
      loggers.error(`Delete Enquiry error: ${error}`);
      throw Error(error);
    }
  },

  /**
   * contactUsAdmin
   * @param {object} req
   * @returns
   */
  async contactUsAdmin(req) {
    try {
      const generalSetting = await GeneralSetting.findOne({ where: { key: 'promotional_contact_us' }, hooks: false });
      const { body: { from, subject, message } } = req;
      const object = {
        from,
        subject: subject ?? 'Promotional Contact Us',
        email: generalSetting?.value ?? 'info@mor.luxury',
        message: message ?? 'Promotional Contact Us',
      };
      // Forgot password email
      await emailServices.contactUsAdmin(object);
      return true;
    } catch (error) {
      loggers.error(`Contact us admin error: ${error}`);
      throw Error(error);
    }
  },

};
