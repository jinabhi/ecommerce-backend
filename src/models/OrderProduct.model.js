import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const OrderProduct = sequelize.define(
    'OrderProduct',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      orderId: {
        type: DataTypes.INTEGER,
      },
      sellerId: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      countryCurrencyAmount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      currencyCode: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
      },
      commission: {
        type: DataTypes.DECIMAL(10, 2),
      },
      adminCommission: {
        type: DataTypes.DECIMAL(10, 2),
      },
      sellerCommission: {
        type: DataTypes.DECIMAL(10, 2),
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
      },
      shippingCharges: {
        type: DataTypes.DECIMAL(10, 2),
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      status: {
        type: DataTypes.ENUM(
          'active',
          'inactive',
          'deleted',
        ),
        defaultValue: 'active',
      },
    },
    {
      underscored: true,
    },
  );

  OrderProduct.associate = (models) => {
    OrderProduct.belongsTo(models.User, {
      foreignKey: 'sellerId',
      as: 'seller',
      onDelete: 'cascade',
    });
    OrderProduct.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    OrderProduct.belongsTo(models.Order, {
      foreignKey: 'orderId',
      onDelete: 'cascade',
    });
    OrderProduct.belongsTo(models.Brand, {
      foreignKey: 'brandId',
      onDelete: 'cascade',
    });
  };
  OrderProduct.loadScopes = () => {
    OrderProduct.addScope('activeOrder', {
      where: {
        status: 'active',
      },
    });
    OrderProduct.addScope('notDeletedOrder', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return OrderProduct;
};
