import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define(
    'ProductVariant',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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

  ProductVariant.associate = (models) => {
    ProductVariant.hasMany(models.ProductVariantAttribute, {
      foreignKey: 'productVariantId',
      as: 'productVariantAttributeDetail',
      // onDelete: 'cascade',
    });
  };
  ProductVariant.loadScopes = () => {
    ProductVariant.addScope('activeProductVariant', {
      where: {
        status: 'active',
      },
    });

    ProductVariant.addScope('notDeletedProductVariant', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ProductVariant;
};
