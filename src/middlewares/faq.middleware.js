import { Op } from 'sequelize';
import utility from '../utils/index';
import repositories from '../repositories';

const { faqRepository } = repositories;
export default {

  /**
     * Check faq exist
     * @param {object} req
     * @param {object} res
     * @param {function} next
     * @returns
     */
  async checkFaqExist(req, res, next) {
    try {
      const { params: { id } } = req;
      const result = await faqRepository.findOne({ id });
      if (result) {
        req.faq = result;
        next();
      } else {
        const error = new Error(utility.getMessage(req, false, 'FAQ_NOT_EXIST'));
        error.status = utility.httpStatus('BAD_REQUEST');
        next(error);
      }
    } catch (error) {
      next(error);
    }
  },

  /**
   * check if CMS Page name already exist
   * @param {object} req
   * @param {object} res
   * @param {Function} next
   */
  async checkDuplicateFaqExist(req, res, next) {
    try {
      const {
        body: { question },
        params: { id },
      } = req;
      const where = { question };
      if (id) {
        where.id = { [Op.ne]: id };
      }
      const result = await faqRepository.findOne(where);
      if (result) {
        const error = new Error(utility.getMessage(req, false, 'FAQ_EXIST'));
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
