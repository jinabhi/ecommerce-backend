import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductNotifyMe = sequelize.define(
    'ProductNotifyMe',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      userId: {
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

  ProductNotifyMe.associate = (models) => {
    ProductNotifyMe.belongsTo(models.Product, {
      foreignKey: 'productId',
    });
    ProductNotifyMe.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  ProductNotifyMe.loadScopes = () => {
    ProductNotifyMe.addScope('notActiveProductNotifyMe', {
      where: {
        status: 'active',
      },
    });

    ProductNotifyMe.addScope('notDeletedProductNotifyMe', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ProductNotifyMe;
};
