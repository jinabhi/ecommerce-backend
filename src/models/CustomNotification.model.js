/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const CustomNotification = sequelize.define(
    'CustomNotification',
    {
      userType: {
        type: DataTypes.ENUM('seller', 'customer', 'all'),
        defaultValue: 'all',
      },
      title: {
        type: DataTypes.STRING(255),
      },
      description: {
        type: DataTypes.TEXT,
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
  CustomNotification.loadScopes = () => {
    CustomNotification.addScope('activeCustomNotification', {
      where: {
        status: 'active',
      },
      attributes: {
        exclude: ['password'],
      },
    });

    CustomNotification.addScope('notDeletedCustomNotification', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
      attributes: {
        exclude: ['password'],
      },
    });
  };

  return CustomNotification;
};
