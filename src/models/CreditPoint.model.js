/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const CreditPoint = sequelize.define(
    'CreditPoint',
    {
      productComplainId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      point: {
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

  CreditPoint.associate = (models) => {
    CreditPoint.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDetails',
      onDelete: 'cascade',
    });
  };
  CreditPoint.loadScopes = () => {
    CreditPoint.addScope('activeCreditPoint', {
      where: {
        status: 'active',
      },
    });

    CreditPoint.addScope('notDeletedCreditPoint', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return CreditPoint;
};
