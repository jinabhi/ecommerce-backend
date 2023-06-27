import utility from '../utils/index';
import howItWorksRepository from '../repositories/howItWorks.repository';

export default {
  /**
  * Check how it works exist
  * @param {object} req
  * @param {object} res
  * @param {Function} next
  */
  async checkHowItWorksExist(req, res, next) {
    try {
      const { body: { howItWorksId }, params: { id } } = req;
      const where = {};
      where.id = howItWorksId || id;
      const result = await howItWorksRepository.findOne(where);
      if (result) {
        req.howItWorks = result;
        next();
      } else {
        res.status(utility.httpStatus('BAD_REQUEST')).json({
          success: false,
          data: null,
          message: utility.getMessage(req, false, 'HOW_IT_WORKS_NOT_EXIST'),
        });
      }
    } catch (error) {
      next(error);
    }
  },
};
