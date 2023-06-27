/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const PaymentCard = sequelize.define(
    'PaymentCard',
    {
      cardHolder: {
        type: DataTypes.STRING(50),
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      cardId: {
        type: DataTypes.STRING(255),
      },
      brand: {
        type: DataTypes.STRING(25),
      },
      lastDigit: {
        type: DataTypes.STRING(5),
      },
      cardTag: {
        type: DataTypes.STRING(25),
        defaultValue: 'other',
      },
      isDefault: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
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

  PaymentCard.associate = (models) => {
    PaymentCard.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };

  PaymentCard.loadScopes = () => {
    PaymentCard.addScope('activePaymentCard', {
      where: {
        status: 'active',
      },
    });

    PaymentCard.addScope('notDeletedPaymentCard', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return PaymentCard;
};
