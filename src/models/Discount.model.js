/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Discount = sequelize.define(
    'Discount',
    {
      name: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      discountPercent: {
        type: DataTypes.INTEGER,
      },
      categoryId: {
        type: DataTypes.INTEGER,
      },
      subCategoryId: {
        type: DataTypes.INTEGER,
      },
      childCategoryId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },

      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted', 'expired', 'scheduled'),
        defaultValue: 'active',
      },
    },
    {
      underscored: true,
    },

  );

  Discount.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) {
      findResult = [findResult];
    }
    findResult.forEach((element) => {
      if (element && element.dataValues.categoryDetails === null) {
        element.dataValues.categoryId = null;
      }
      if (element && element.dataValues.subCategoryDetails === null) {
        element.dataValues.subCategoryId = null;
      }
      if (element && element.dataValues.childCategoryDetails === null) {
        element.dataValues.subCategoryId = null;
      }
      if (element && element.dataValues.sellerDetails === null) {
        element.dataValues.subCategoryId = null;
      }
      return [...findResult];
    });
    return findResult;
  });

  Discount.associate = (models) => {
    Discount.hasMany(models.ProductDiscount, {
      foreignKey: 'discountId',
      as: 'productDiscountDetails',
      onDelete: 'cascade',
    });
    Discount.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'categoryDetails',
      onDelete: 'cascade',
    });
    Discount.belongsTo(models.SubCategory, {
      foreignKey: 'subCategoryId',
      as: 'subCategoryDetails',
      onDelete: 'cascade',
    });
    Discount.belongsTo(models.ChildCategory, {
      foreignKey: 'childCategoryId',
      as: 'childCategoryDetails',
      onDelete: 'cascade',
    });
    Discount.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'sellerDetails',
      onDelete: 'cascade',
    });
  };

  Discount.loadScopes = () => {
    Discount.addScope('activeDiscount', {
      where: {
        status: 'active',
      },
    });

    Discount.addScope('notDeletedDiscount', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
    Discount.addScope('notExpiredProductDiscount', {
      where: {
        status: { [Op.notIn]: ['deleted', 'expired'] },
      },
    });
  };

  return Discount;
};
