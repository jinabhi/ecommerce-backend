/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ShippingLog = sequelize.define(
    'ShippingLog',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      shippingQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      acceptedQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      deliveryDate: {
        type: DataTypes.DATE,
      },
      shippingStatus: {
        type: DataTypes.ENUM('shipped', 'delivered'),
        defaultValue: 'shipped',
      },
      isShippingType: {
        type: DataTypes.BOOLEAN,
        Comment: 'manual: true, auto: false',
        defaultValue: true,
      },
      shippingCarrier: {
        type: DataTypes.STRING,
      },
      trackingId: {
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

  ShippingLog.associate = (models) => {
    ShippingLog.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
  };

  ShippingLog.loadScopes = () => {
    ShippingLog.addScope('activeShippingLog', {
      where: {
        status: 'active',
      },
    });

    ShippingLog.addScope('notDeletedShippingLog', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ShippingLog;
};
