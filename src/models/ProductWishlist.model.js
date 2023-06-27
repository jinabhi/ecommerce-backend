import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const ProductWishlist = sequelize.define('ProductWishlist', {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    },
  }, {
    underscored: true,
  });

  ProductWishlist.associate = (models) => {
    ProductWishlist.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',

    });
    ProductWishlist.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'cascade',
    });
  };
  ProductWishlist.loadScopes = () => {
    ProductWishlist.addScope('activeProductWishlist', {
      where: {
        status: 'active',
      },
    });

    ProductWishlist.addScope('notDeletedProductWishlist', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };

  return ProductWishlist;
};
