/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';
import utility from '../utils/index';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const ChildCategory = sequelize.define(
    'ChildCategory',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      childCategoryImage: {
        type: DataTypes.STRING(255),
      },
      categoryId: {
        type: DataTypes.INTEGER,
      },
      subCategoryId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
      childCategoryImageUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('childCategoryImage');
          return utility.getImage(str, defaultUserImage, 'public');
        },
      },
    },

    {
      underscored: true,
    },
  );

  ChildCategory.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) {
      findResult = [findResult];
    }
    findResult.forEach((element) => {
      if ((element && (
        element.dataValues.SubCategory === null || element.dataValues.Category === null))) {
        element.dataValues.subCategoryId = null;
        element.dataValues.SubCategory = null;
      }
      if (element && element.dataValues.Category === null) {
        element.dataValues.categoryId = null;
      }
      if (element && element.dataValues.SubCategory === null) {
        element.dataValues.subCategoryId = null;
      }
      return [...findResult];
    });
    return findResult;
  });

  ChildCategory.associate = (models) => {
    ChildCategory.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      onDelete: 'cascade',
    });
    ChildCategory.belongsTo(models.SubCategory, {
      foreignKey: 'subCategoryId',
      onDelete: 'cascade',
    });
    ChildCategory.hasMany(models.Product, {
      foreignKey: 'childCategoryId',
    });
  };

  ChildCategory.loadScopes = () => {
    ChildCategory.addScope('activeChildCategory', {
      where: {
        status: 'active',
      },
    });

    ChildCategory.addScope('notDeleteChildCategory', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return ChildCategory;
};
