/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const GeneralSetting = sequelize.define(
    'GeneralSetting',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING,
      },
      value: {
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
  GeneralSetting.addHook('afterFind', (findResult) => {
    if (!Array.isArray(findResult)) {
      findResult = [findResult];
    }
    findResult.forEach((element) => {
      if (element && typeof (element.dataValues.value) === 'string') {
        element.dataValues.value = parseInt(element?.dataValues?.value, 10);
      }
      return [...findResult];
    });
    return findResult;
  });
  GeneralSetting.loadScopes = () => {
    GeneralSetting.addScope('activeGeneralSetting', {
      where: {
        status: 'active',
      },
    });

    GeneralSetting.addScope('notDeletedGeneralSetting', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return GeneralSetting;
};
