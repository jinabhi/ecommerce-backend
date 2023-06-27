import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductVariantAttribute = sequelize.define(
    'ProductVariantAttribute',
    {
      productVariantId: {
        type: DataTypes.INTEGER,
      },
      attributeNames: {
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

  ProductVariantAttribute.associate = (models) => {
    ProductVariantAttribute.belongsTo(models.ProductVariant, {
      foreignKey: 'productVariantId',
    });
  };
  ProductVariantAttribute.loadScopes = () => {
    ProductVariantAttribute.addScope('activeProductVariantAttribute', {
      where: {
        status: 'active',
      },
    });
    ProductVariantAttribute.addScope('notDeletedProductVariantAttribute', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ProductVariantAttribute;
};
