import { Op } from 'sequelize';
import models from '../models';
import helper from '../helper/subQuery';
import logger from '../services/logger.service';

const {
  SubCategory, Product, ChildCategory,
} = models;

export default {

  async getMyStore(req) {
    try {
      const { user, query: { name } } = req;
      let activeWhere = { status: 'active' };
      if (name) {
        activeWhere = {
          ...activeWhere,
          [Op.or]: [
            { name: { [Op.like]: `%${name}%` } },
            { '$ChildCategories.name$': { [Op.like]: `%${name}%` } },
          ],
        };
      }
      return SubCategory.findAll({
        where: activeWhere,
        include: [{
          model: ChildCategory,
          where: activeWhere,
          required: true,
          include: [{
            model: Product,
            required: true,
            where: { status: 'active', sellerId: user.id },
            attributes: helper.childCategoryProduct(user.id),
          }],
        }],
      });
    } catch (error) {
      logger.error(
        `My Store listing error: ${error}, user id: ${req?.user?.id}`,
      );
      throw Error(error);
    }
  },

};
