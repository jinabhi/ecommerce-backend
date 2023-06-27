/* eslint-disable no-param-reassign */
import { Op } from 'sequelize';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    brandId: {
      type: DataTypes.INTEGER,
    },
    categoryId: {
      type: DataTypes.INTEGER,
    },
    productId: {
      type: DataTypes.STRING(255),
      comment: '6 digit alphanumeric',
    },
    shippingCharges: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    subCategoryId: {
      type: DataTypes.INTEGER,
    },
    childCategoryId: {
      type: DataTypes.INTEGER,
    },
    overview: {
      type: DataTypes.TEXT,
    },
    specification: {
      type: DataTypes.TEXT,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      defaultValue: 0,
    },
    unit: {
      type: DataTypes.ENUM('lb', 'ounces', 'gm'),
    },
    rejectMessage: {
      type: DataTypes.TEXT,
    },
    sellerId: {
      type: DataTypes.INTEGER,
    },
    productStatus: {
      type: DataTypes.STRING,
      defaultValue: 'outOfStock',
      comment: 'lowInventory, outOfStock, inStock',
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'rejected', 'inactive', 'deleted', 'incomplete'),
      defaultValue: 'pending',
    },
  }, {
    underscored: true,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'categoryDetails',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.Brand, {
      foreignKey: 'brandId',
      as: 'brandDetails',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.SubCategory, {
      foreignKey: 'subCategoryId',
      as: 'subCategoryDetails',
      onDelete: 'cascade',
    });
    Product.hasMany(models.OrderProduct, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.ChildCategory, {
      foreignKey: 'childCategoryId',
      as: 'childCategoryDetails',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.ChildCategory, {
      foreignKey: 'childCategoryId',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.Brand, {
      foreignKey: 'brandId',
      onDelete: 'cascade',
    });
    Product.belongsTo(models.User, {
      foreignKey: 'sellerId',
      onDelete: 'cascade',
    });
    Product.hasMany(models.ProductImage, {
      foreignKey: 'productId',
      as: 'productImage',
      onDelete: 'cascade',
    });
    Product.hasMany(models.ReviewRating, {
      foreignKey: 'productId',
      onDelete: 'cascade',
      as: 'productReviewRating',
    });
    Product.hasMany(models.SellerProductVariant, {
      foreignKey: 'productId',
      as: 'sellerProductVariantDetails',
    });
    Product.hasMany(models.ShippingLog, {
      foreignKey: 'productId',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    });
    Product.hasOne(models.ProductDiscount, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    Product.hasMany(models.ProductWishlist, {
      foreignKey: 'productId',
    });
  };
  Product.loadScopes = () => {
    Product.addScope('activeProduct', {
      where: {
        status: 'active',
      },
    });

    Product.addScope('notDeletedProduct', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });

    Product.addScope('approvedProduct', {
      where: {
        status: { [Op.notIn]: ['deleted', 'rejected', 'pending'] },
      },
    });
  };

  return Product;
};
