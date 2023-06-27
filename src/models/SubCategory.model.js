/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';
import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define('SubCategory', {
    subCategoryImage: {
      type: DataTypes.STRING(255),
    },
    name: {
      type: DataTypes.STRING(255),
    },
    categoryId: {
      type: DataTypes.INTEGER,
    },
    subCategoryImageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const str = this.get('subCategoryImage');
        return utility.getImage(str, defaultUserImage, 'public');
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    },

  }, {
    underscored: true,
  });

  SubCategory.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) {
      findResult = [findResult];
    }
    findResult.forEach((element) => {
      if (element && element.dataValues.Category === null) {
        element.dataValues.categoryId = null;
      }
    });
    return findResult;
  });

  SubCategory.associate = (models) => {
    SubCategory.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      onDelete: 'cascade',
      scope: {
        status: { [Op.eq]: 'active ' },
      },
    });
    SubCategory.hasMany(models.Product, {
      foreignKey: 'subCategoryId',
      onDelete: 'cascade',
      scope: {
        status: { [Op.eq]: 'active ' },
      },
    });
    SubCategory.hasMany(models.ChildCategory, {
      foreignKey: 'subCategoryId',
      onDelete: 'cascade',
      scope: {
        status: { [Op.eq]: 'active ' },
      },

    });
  };
  SubCategory.loadScopes = () => {
    SubCategory.addScope('activeSubCategory', {
      where: {
        status: 'active',
      },
    });

    SubCategory.addScope('notDeletedSubCategory', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return SubCategory;
};
