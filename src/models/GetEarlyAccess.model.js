import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const GetEarlyAccess = sequelize.define(
    'GetEarlyAccess',
    {
      contactNumber: {
        type: DataTypes.STRING,
      },
      contactNumberCountryCode: {
        type: DataTypes.STRING,
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

  GetEarlyAccess.loadScopes = () => {
    GetEarlyAccess.addScope('activeGetEarlyAccess', {
      where: {
        status: 'active',
      },
    });

    GetEarlyAccess.addScope('notDeletedGetEarlyAccess', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return GetEarlyAccess;
};
