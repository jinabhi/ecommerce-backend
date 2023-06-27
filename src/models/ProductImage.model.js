import { Op } from 'sequelize';
import utility from '../utils/index';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
    productImage: {
      type: DataTypes.STRING,
    },
    productId: {
      type: DataTypes.INTEGER,
    },
    productImageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const str = this.get('productImage');
        return utility.getImage(str, defaultUserImage, 'public');
      },
    },
    fileType: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    },
  }, {
    underscored: true,
  });

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, {
      foreignKey: 'productId',
      onDelete: 'cascade',
    });
    ProductImage.loadScopes = () => {
      ProductImage.addScope('activeProductImage', {
        where: {
          status: 'active',
        },
      });
      ProductImage.addScope('notDeletedProductImage', {
        where: {
          status: { [Op.ne]: 'deleted' },
        },
      });
    };
  };
  return ProductImage;
};
