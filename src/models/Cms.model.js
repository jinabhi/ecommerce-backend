/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Cms = sequelize.define(
    'Cms',
    {
      pageName: {
        type: DataTypes.STRING(255),
      },
      description: {
        type: DataTypes.TEXT,
      },
      cmsKey: {
        type: DataTypes.STRING(255),
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
  Cms.loadScopes = () => {
    Cms.addScope('activeCms', {
      where: {
        status: 'active',
      },
    });

    Cms.addScope('notDeletedCms', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return Cms;
};
