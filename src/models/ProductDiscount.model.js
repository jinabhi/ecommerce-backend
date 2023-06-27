import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductDiscount = sequelize.define(
    'ProductDiscount',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      discountId: {
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

  ProductDiscount.associate = (models) => {
    ProductDiscount.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    ProductDiscount.belongsTo(models.Discount, {
      foreignKey: 'discountId',
      onDelete: 'cascade',
    });
  };

  ProductDiscount.loadScopes = () => {
    ProductDiscount.addScope('activeProductDiscount', {
      where: {
        status: 'active',
      },
    });

    ProductDiscount.addScope('notDeletedProductDiscount', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return ProductDiscount;
};
