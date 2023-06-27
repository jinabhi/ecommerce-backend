import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const SellerProductVariant = sequelize.define(
    'SellerProductVariant',
    {
      productId: {
        type: DataTypes.INTEGER,
      },
      productVariantId: {
        type: DataTypes.INTEGER,
      },
      productVariantAttributeId: {
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

  SellerProductVariant.associate = (models) => {
    SellerProductVariant.belongsTo(models.Product, {
      foreignKey: 'productId',
    });
    SellerProductVariant.belongsTo(models.ProductVariantAttribute, {
      foreignKey: 'productVariantAttributeId',
    });
    SellerProductVariant.belongsTo(models.ProductVariant, {
      foreignKey: 'productVariantId',
    });
  };
  SellerProductVariant.loadScopes = () => {
    SellerProductVariant.addScope('activeSellerProductVariant', {
      where: {
        status: 'active',
      },
    });

    SellerProductVariant.addScope('notDeletedSellerProductVariant', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return SellerProductVariant;
};
