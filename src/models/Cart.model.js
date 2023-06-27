import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    'Cart',
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      productId: {
        type: DataTypes.INTEGER,
      },
      quantity: {
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

  Cart.associate = (models) => {
    Cart.belongsTo(models.Product, {
      foreignKey: 'productId',
    });
    Cart.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  Cart.loadScopes = () => {
    Cart.addScope('activeCart', {
      where: {
        status: 'active',
      },
    });

    Cart.addScope('notDeletedCart', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return Cart;
};
