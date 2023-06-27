/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ContactUs = sequelize.define(
    'ContactUs',
    {
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userType: {
        type: DataTypes.ENUM('customer', 'seller'),
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
    },
    {
      underscored: true,
    },
  );

  ContactUs.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) {
      findResult = [findResult];
    }
    findResult.forEach((element) => {
      if (element && element.dataValues.userDetails === null) {
        element.dataValues.userId = null;
      }
      return [...findResult];
    });
    return findResult;
  });

  ContactUs.associate = (models) => {
    ContactUs.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDetails',
      onDelete: 'cascade',
    });
  };
  ContactUs.loadScopes = () => {
    ContactUs.addScope('activeContactUs', {
      where: {
        status: 'active',
      },
    });

    ContactUs.addScope('notDeletedContactUs', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return ContactUs;
};
