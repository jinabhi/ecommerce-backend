/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductComplaint = sequelize.define(
    'ProductComplaint',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      description: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
      productComplaintStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'credited'),
        defaultValue: 'pending',
      },
    },
    {
      underscored: true,
    },
  );

  ProductComplaint.associate = (models) => {
    ProductComplaint.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'productDetails',
      onDelete: 'cascade',
    });
    ProductComplaint.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDetails',
      onDelete: 'cascade',
    });
    ProductComplaint.hasOne(models.CreditPoint, {
      foreignKey: 'productComplainId',
      onDelete: 'cascade',
    });
    ProductComplaint.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'orderDetails',
    });
    ProductComplaint.hasMany(models.DamageProductImage, {
      foreignKey: 'productComplaintId',
      as: 'damageProductImage',
      onDelete: 'cascade',
    });
  };
  ProductComplaint.loadScopes = () => {
    ProductComplaint.addScope('activeProductComplaint', {
      where: {
        status: 'active',
      },
    });

    ProductComplaint.addScope('notDeletedProductComplaint', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ProductComplaint;
};
