import { Op } from 'sequelize';
import utility from '../utils';
import config from '../config';

const defaultUserImage = `${config.app.baseUrl}public/default-images/defaultImage.png`;

module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    brandImage: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
    storeName: {
      type: DataTypes.STRING(255),
    },
    commission: {
      type: DataTypes.INTEGER,
    },
    storeLicenseDocumentImage: {
      type: DataTypes.STRING(255),
    },
    storeContactNumber: {
      type: DataTypes.STRING(255),
    },
    storeContactNumberCountryCode: {
      type: DataTypes.STRING(50),
    },
    address: {
      type: DataTypes.STRING(255),
    },
    storeLicenseDocumentImageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const str = this.get('storeLicenseDocumentImage');
        return utility.getImage(str, defaultUserImage, 'private');
      },
    },
    brandImageUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const str = this.get('brandImage');
        return utility.getImage(str, defaultUserImage, 'private');
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'deleted'),
      defaultValue: 'active',
    },
  }, {
    underscored: true,
  });

  Brand.associate = (models) => {
    Brand.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'sellerDetails',
      onDelete: 'cascade',
    });

    Brand.hasMany(models.Product, {
      foreignKey: 'brandId',
    });
  };
  Brand.loadScopes = () => {
    Brand.addScope('activeBrand', {
      where: {
        status: 'active',
      },
    });

    Brand.addScope('notDeletedBrand', {
      where: {
        status: { [Op.ne]: 'deleted' },
      },
    });
  };
  return Brand;
};
