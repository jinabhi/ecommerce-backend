import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductView = sequelize.define(
    'ProductView',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      count: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
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

  ProductView.associate = (models) => {
    ProductView.belongsTo(models.Product, {
      foreignKey: 'productId',
    });
    ProductView.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  ProductView.loadScopes = () => {
    ProductView.addScope('notActiveProductView', {
      where: {
        status: 'active',
      },
    });

    ProductView.addScope('notDeletedProductView', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return ProductView;
};
